/**
 * Copyright 2018, Google LLC.
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

'use strict';

require('colors');

const _ = require('lodash');
const childProcess = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const buildPack = require('../../../build_packs').getBuildPack();
const options = require('../../options');
const utils = require('../../../utils');

const CLI_CMD = 'deploy';
const DEPLOY_CMD = buildPack.config.test.deploy.cmd;
const COMMAND = `tools test ${CLI_CMD} ${'[options]'.yellow}`;
const DESCRIPTION = `Deploy an app and test it with a GET request.`;
const USAGE = `Usage:
  ${COMMAND.bold}
Description:
  ${DESCRIPTION}`;

exports.command = CLI_CMD;
exports.description = DESCRIPTION;
exports.builder = yargs => {
  yargs.usage(USAGE).options({
    cmd: {
      description: `${'Default:'.bold} ${
        DEPLOY_CMD.yellow
      }. Override the command used to deploy the app.`,
      type: 'string',
    },
    project: {
      alias: 'p',
      description: `${'Default:'.bold} ${
        `${buildPack.config.global.project}`.yellow
      }. The project ID to use ${'inside'.italic} the build.`,
      requiresArg: true,
      type: 'string',
    },
    delete: {
      default: true,
      description: `${'Default:'.bold} ${
        'true'.yellow
      }. Whether to delete the deployed app after the test finishes.`,
      type: 'boolean',
    },
    config: options.config,
    'config-key': options['config-key'],
    msg: {
      description:
        'Set a message the should be found in the response to the rest request.',
      requiresArg: true,
      type: 'string',
    },
    'required-env-vars': {
      alias: 'r',
      description:
        'Specify environment variables that must be set for the test to succeed.',
      requiresArg: true,
      type: 'string',
    },
    substitutions: {
      description: `Specify variable substitutions for the deployment's yaml file.`,
      requiresArg: true,
      type: 'string',
    },
    tries: {
      description: `${'Default:'.bold} ${
        '1'.yellow
      }. Number of times to attempt deployment. Deployment will only be attempted again if the previous deployment fails. Must be greater than zero.`,
      requiresArg: true,
      type: 'number',
    },
    yaml: {
      description: `${'Default:'.bold} ${
        'app.yaml'.yellow
      }. Specify the base yaml file to use when deploying.`,
      requiresArg: true,
      type: 'string',
    },
  });
};

exports.handler = opts => {
  if (opts.dryRun) {
    utils.logger.log(CLI_CMD, 'Beginning dry run.'.cyan);
  }

  buildPack.expandConfig(opts);

  opts.cmd || (opts.cmd = DEPLOY_CMD);
  opts.yaml || (opts.yaml = buildPack.config.test.deploy.yaml);
  opts.version || (opts.version = path.parse(opts.localPath).base);
  if (opts.tries === undefined) {
    opts.tries = buildPack.config.test.deploy.tries;
  }
  if (opts.tries < 1) {
    // Must try at least once
    opts.tries = 1;
  }

  // Verify that required env vars are set, if any
  opts.requiredEnvVars =
    opts.requiredEnvVars ||
    _.get(buildPack, 'config.test.app.requiredEnvVars', []);
  if (opts.requiredEnvVars && typeof opts.requiredEnvVars === 'string') {
    opts.requiredEnvVars = opts.requiredEnvVars.split(',');
  }
  opts.requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      utils.logger.fatal(
        CLI_CMD,
        `Test requires that the ${envVar} environment variable be set!`
      );
    }
  });

  if (!opts.project) {
    utils.logger.fatal(CLI_CMD, 'You must provide a project ID!');
  }

  return new Promise((resolve, reject) => {
    opts.now = Date.now();

    utils.logger.log(CLI_CMD, `Deploying app in: ${opts.localPath.yellow}`);

    // Manually set # of instances to 1
    const tmpAppYaml = changeScaling(opts);

    if (process.env.CLOUD_BUILD) {
      try {
        childProcess.execSync(
          `gcloud auth activate-service-account --key-file key.json`,
          {
            cwd: opts.localPath,
            stdio: opts.silent ? 'ignore' : 'inherit',
          }
        );
      } catch (err) {
        // Ignore error
      }
    } else {
      utils.logger.log(CLI_CMD, 'Using configured credentials.');
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
      '--no-promote',
    ];

    utils.logger.log(
      CLI_CMD,
      'Running:',
      opts.cmd.yellow,
      opts.args.join(' ').yellow
    );

    if (opts.dryRun) {
      utils.logger.log(CLI_CMD, 'Dry run complete.'.cyan);
      return;
    }

    const options = {
      cwd: opts.localPath,
      // shell: true,
      stdio: opts.silent ? 'ignore' : 'inherit',
      timeout: 12 * 60 * 1000, // 12-minute timeout
      shell: true,
    };

    const start = Date.now();

    let triesRemaining = opts.tries;

    function attemptDeploy() {
      if (triesRemaining >= 1) {
        triesRemaining--;

        childProcess
          .spawn(opts.cmd, opts.args, options)
          .on('exit', (code, signal) => {
            let timeTakenStr = utils.getTimeTaken(start);

            if (code || signal) {
              utils.logger.error(
                CLI_CMD,
                `Oh no! Deployment failed after ${timeTakenStr}.`
              );
            } else {
              utils.logger.log(
                CLI_CMD,
                `Success! Deployment finished in ${timeTakenStr}.`.green
              );
            }

            // Give app time to start
            setTimeout(() => {
              // Test versioned url of "default" module
              let demoUrl = utils.getUrl(opts);

              // Test that app is running successfully
              utils.testRequest(demoUrl, opts).then(
                () => {
                  timeTakenStr = utils.getTimeTaken(start);
                  utils.logger.log(
                    CLI_CMD,
                    `Success! Test finished in ${timeTakenStr}.`.green
                  );
                  resolve();
                },
                err => {
                  utils.logger.error(
                    CLI_CMD,
                    `Oh no! Test failed after ${timeTakenStr}.`,
                    err
                  );

                  // Try the test again if any available tries remain
                  attemptDeploy();
                }
              );
            }, 5000);
          });
      } else {
        const timeTakenStr = utils.getTimeTaken(start);
        reject(
          new Error(
            `Exhausted available deployment attempts after ${timeTakenStr}.`
          )
        );
      }
    }

    attemptDeploy();
  })
    .then(
      () => {
        if (opts.delete && !opts.dryRun) {
          return utils.deleteVersion(opts).catch(() => {});
        }
      },
      err => {
        if (opts.delete && !opts.dryRun) {
          return utils
            .deleteVersion(opts)
            .catch(() => {})
            .then(() => Promise.reject(err));
        }
        return Promise.reject(err);
      }
    )
    .catch(err => {
      utils.logger.fatal(CLI_CMD, err.message);
    });
};

function changeScaling(opts) {
  const oldYamlPath = path.join(opts.localPath, opts.yaml);
  const newYamlPath = path.join(
    opts.localPath,
    `${opts.version}-${opts.now}.yaml`
  );

  utils.logger.log(CLI_CMD, 'Compiling:', newYamlPath.yellow);
  let yaml = fs.readFileSync(oldYamlPath, 'utf8');
  yaml += `\n\nmanual_scaling:\n  instances: 1\n`;

  if (opts.substitutions) {
    opts.substitutions
      .split(',')
      .map(sub => sub.split('='))
      .forEach(([key, value]) => {
        yaml = yaml.replace(
          key,
          value.startsWith('$') ? process.env[value.substring(1)] : value
        );
      });
  }

  if (opts.dryRun) {
    utils.logger.log(CLI_CMD, 'Printing:', newYamlPath.yellow, `\n${yaml}`);
  } else {
    utils.logger.log(CLI_CMD, 'Writing:', newYamlPath.yellow);
    fs.writeFileSync(newYamlPath, yaml, 'utf8');
  }

  return newYamlPath;
}
