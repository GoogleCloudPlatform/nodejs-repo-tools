/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require('colors');

const _ = require('lodash');
const childProcess = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const buildPacks = require('../../../build_packs');
const utils = require('../../../utils');

const DEPLOY_CMD = buildPacks.config.test.deploy.cmd;
const COMMAND = `samples test deploy ${'[options]'.yellow}`;
const DESCRIPTION = `Deploy an app and test it with a GET request.`;
const USAGE = `Usage:
  ${COMMAND.bold}
Description:
  ${DESCRIPTION}`;

exports.command = 'deploy';
exports.description = DESCRIPTION;
exports.builder = (yargs) => {
  yargs
    .usage(USAGE)
    .options({
      cmd: {
        description: `${'Default:'.bold} ${DEPLOY_CMD.yellow}. Override the command used to deploy the app.`,
        type: 'string'
      },
      project: {
        alias: 'p',
        description: `${'Default:'.bold} ${`${buildPacks.config.global.project}`.yellow}. The project ID to use ${'inside'.italic} the build.`,
        requiresArg: true,
        type: 'string'
      },
      delete: {
        default: true,
        description: `${'Default:'.bold} ${'true'.yellow}. Whether to delete the deployed app after the test finishes.`,
        type: 'boolean'
      },
      config: {
        description: `${'Default:'.bold} ${`${buildPacks.config.global.config}`.yellow}. Specify a JSON config file to load. Options set in the config file supercede options set at the command line.`,
        requiresArg: true,
        type: 'string'
      },
      'config-key': {
        description: `${'Default:'.bold} ${`${buildPacks.config.global.configKey}`.yellow}. Specify the key under which options are nested in the config file.`,
        requiresArg: true,
        type: 'string'
      },
      msg: {
        description: 'Set a message the should be found in the response to the rest request.',
        requiresArg: true,
        type: 'string'
      },
      'required-env-vars': {
        alias: 'r',
        description: 'Specify environment variables that must be set for the test to succeed.',
        requiresArg: true,
        type: 'string'
      },
      substitutions: {
        description: `Specify variable substitutions for the deployment's yaml file.`,
        requiresArg: true,
        type: 'string'
      },
      tries: {
        description: `${'Default:'.bold} ${'1'.yellow}. Number of times to attempt deployment. Deployment will only be attempted again if the previous deployment fails. Must be greater than zero.`,
        requiresArg: true,
        type: 'number'
      }
    });
};

exports.handler = (opts) => {
  if (opts.dryRun) {
    utils.log('deploy', 'Beginning dry run.'.cyan);
  }

  buildPacks.expandConfig(opts);

  opts.cmd || (opts.cmd = DEPLOY_CMD);
  opts.yaml || (opts.yaml = buildPacks.config.test.deploy.yaml);
  opts.version || (opts.version = path.parse(opts.localPath).base);
  if (opts.tries === undefined) {
    opts.tries = buildPacks.config.test.deploy.tries;
  }
  if (opts.tries < 1) {
    // Must try at least once
    opts.tries = 1;
  }

  // Verify that required env vars are set, if any
  opts.requiredEnvVars = opts.requiredEnvVars || _.get(buildPacks, 'config.test.app.requiredEnvVars', []);
  if (opts.requiredEnvVars && typeof opts.requiredEnvVars === 'string') {
    opts.requiredEnvVars = opts.requiredEnvVars.split(',');
  }
  opts.requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      utils.error('deploy', `Test requires that the ${envVar} environment variable be set!`);
      process.exit(1);
    }
  });

  if (!opts.project) {
    utils.error('deploy', 'You must provide a project ID!');
    process.exit(1);
  }

  return new Promise((resolve, reject) => {
    opts.now = Date.now();

    utils.log('deploy', `Deploying app in: ${opts.localPath.yellow}`);

    // Manually set # of instances to 1
    const tmpAppYaml = changeScaling(opts);

    if (process.env.CLOUD_BUILD) {
      try {
        childProcess.execSync(`gcloud auth activate-service-account --key-file key.json`, {
          cwd: opts.localPath,
          stdio: opts.silent ? 'ignore' : 'inherit'
        });
      } catch (err) {
        // Ignore error
      }
    } else {
      utils.log('deploy', 'Using configured credentials.');
    }

    opts.args = [
      'app',
      'deploy',
      path.parse(tmpAppYaml).base,
      // Skip prompt
      '-q',
      `--project=${opts.project}`,
      // Deploy over existing version so we don't have to clean up
      `--version=${opts.version}`,
      '--no-promote'
    ];

    utils.log('deploy', 'Running:', opts.cmd.yellow, opts.args.join(' ').yellow);

    if (opts.dryRun) {
      utils.log('deploy', 'Dry run complete.'.cyan);
      return;
    }

    const options = {
      cwd: opts.localPath,
      // shell: true,
      stdio: opts.silent ? 'ignore' : 'inherit',
      timeout: 12 * 60 * 1000 // 12-minute timeout
    };

    let triesRemaining = opts.tries;

    function attemptDeploy () {
      if (triesRemaining >= 1) {
        triesRemaining--;

        childProcess
          .spawn(opts.cmd, opts.args, options)
          .on('exit', (code, signal) => {
            if (code || signal) {
              utils.error('deploy', 'Deploy failed.');
            } else {
              utils.log('deploy', 'Deployment complete.'.green);
            }

            // Give app time to start
            setTimeout(() => {
              // Test versioned url of "default" module
              let demoUrl = utils.getUrl(opts.version, opts.project);

              // Test that app is running successfully
              utils.testRequest(demoUrl, opts)
                .then(() => {
                  utils.log('app', 'Test complete.'.green);
                  resolve();
                }, (err) => {
                  utils.error('app', 'Test failed.', err);

                  // Try the test again if any available tries remain
                  attemptDeploy();
                });
            }, 5000);
          });
      } else {
        reject(new Error('Exhausted available deployment attempts.'));
      }
    }

    attemptDeploy();
  })
  .then(() => {
    if (opts.delete && !opts.dryRun) {
      return utils.deleteVersion(opts).catch(() => {});
    }
  }, (err) => {
    if (opts.delete && !opts.dryRun) {
      return utils.deleteVersion(opts)
        .catch(() => {})
        .then(() => Promise.reject(err));
    }
    return Promise.reject(err);
  })
  .catch((err) => {
    utils.error('deploy', err.message);
    process.exit(1);
  });
};

function changeScaling (opts) {
  const oldYamlPath = path.join(opts.localPath, opts.yaml);
  const newYamlPath = path.join(opts.localPath, `${opts.version}-${opts.now}.yaml`);

  utils.log('deploy', 'Compiling:', newYamlPath.yellow);
  let yaml = fs.readFileSync(oldYamlPath, 'utf8');
  yaml += `\n\nmanual_scaling:\n  instances: 1\n`;

  if (opts.substitutions) {
    opts
      .substitutions
      .split(',')
      .map((sub) => sub.split('='))
      .forEach(([key, value]) => {
        yaml = yaml.replace(key, value.startsWith('$') ? process.env[value.substring(1)] : value);
      });
  }

  if (opts.dryRun) {
    utils.log('deploy', 'Printing:', newYamlPath.yellow, `\n${yaml}`);
  } else {
    utils.log('deploy', 'Writing:', newYamlPath.yellow);
    fs.writeFileSync(newYamlPath, yaml, 'utf8');
  }

  return newYamlPath;
}
