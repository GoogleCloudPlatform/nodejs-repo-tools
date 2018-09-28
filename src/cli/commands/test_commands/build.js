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

const childProcess = require('child_process');
const fs = require('fs-extra');
const handlebars = require('handlebars');
const path = require('path');
const slugify = require('@sindresorhus/slugify');

const buildPack = require('../../../build_packs').getBuildPack();
const options = require('../../options');
const utils = require('../../../utils');

handlebars.registerHelper('slugify', str => slugify(str));
handlebars.registerHelper('trim', str => str.trim());

const tpl = path.join(__dirname, '../../../../templates/cloudbuild.yaml.tpl');

const CLI_CMD = 'build';
const COMMAND = `tools test ${CLI_CMD} ${'[options]'.yellow}`;
const DESCRIPTION = `Launch a Cloud Container build.`;
const USAGE = `Usage:
  ${COMMAND.bold}
Description:
  ${DESCRIPTION}

  By default the build will install dependencies and run the system/unit tests.
  Passing ${'--app'.bold} will cause the build to also run the web app tests.
  Passing ${'--deploy'.bold} will cause the build to also run the web app
  deployment test.

  Pass ${
    '--dry-run'.bold
  } to see what the cloudbuild.yaml file will look like.`;

exports.command = CLI_CMD;
exports.description = DESCRIPTION;
exports.builder = yargs => {
  yargs
    .usage(USAGE)
    .options({
      run: {
        default: true,
        description: `${'Default:'.bold} ${
          `true`.yellow
        }. Whether to run the system/unit test command.`,
        type: 'boolean',
      },
      app: {
        description: `${'Default:'.bold} ${
          `false`.yellow
        }. Whether to run the web app test command.`,
        type: 'boolean',
      },
      deploy: {
        description: `${'Default:'.bold} ${
          `false`.yellow
        }. Whether to run the deploy command.`,
        type: 'boolean',
      },
      'builder-project': {
        alias: 'bp',
        description: `${'Default:'.bold} ${
          `${buildPack.config.test.build.builderProject}`.yellow
        }. The project in which the Cloud Container Build should execute.`,
        requiresArg: true,
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
      'key-file': {
        alias: 'k',
        description: `${'Default:'.bold} ${
          `${buildPack.config.test.build.keyFile}`.yellow
        }. The path to the key to copy into the build.`,
        requiresArg: true,
        type: 'string',
      },
      config: options.config,
      'config-key': options.configKey,
      async: {
        alias: 'a',
        description: `${'Default:'.bold} ${
          `${buildPack.config.test.build.async}`.yellow
        }. Start the build, but don't wait for it to complete.`,
        type: 'boolean',
      },
      ci: {
        description: `${'Default:'.bold} ${
          `${buildPack.config.test.build.ci || false}`.yellow
        }. Whether this is a CI environment.`,
        type: 'boolean',
      },
      timeout: {
        description: `${'Default:'.bold} ${
          `${buildPack.config.test.build.timeout}`.yellow
        }. The maximum time allowed for the build.`,
        requiresArg: true,
        type: 'string',
      },
      'install-cmd': {
        description: `${'Default:'.bold} ${
          `${buildPack.config.test.install.cmd}`.yellow
        }. The install command to use.`,
        requiresArg: true,
        type: 'string',
      },
      'install-args': {
        description: `${'Default:'.bold} ${
          `${buildPack.config.test.install.args.join(' ')}`.yellow
        }. The arguments to pass to the install command.`,
        requiresArg: true,
        type: 'string',
      },
      'requires-key-file': {
        description: `${'Default:'.bold} ${'false'.yellow}.`,
        type: 'boolean',
      },
      'required-env-vars': {
        alias: 'r',
        description:
          'Specify environment variables that must be pulled from the environment and injected into the build.',
        requiresArg: true,
        type: 'string',
      },
      'start-cmd': {
        description: `${'Default:'.bold} ${
          `${buildPack.config.test.app.cmd}`.yellow
        }. The command the web app test will use to start the app.`,
        requiresArg: true,
        type: 'string',
      },
      'start-args': {
        description: `${'Default:'.bold} ${
          `${buildPack.config.test.app.args.join(' ')}`.yellow
        }. The arguments to pass to the command used by the web app test.`,
        requiresArg: true,
        type: 'string',
      },
      'test-cmd': {
        description: `${'Default:'.bold} ${
          `${buildPack.config.test.run.cmd}`.yellow
        }. The system/unit test command to use.`,
        requiresArg: true,
        type: 'string',
      },
      'test-args': {
        description: `${'Default:'.bold} ${
          `${buildPack.config.test.run.args.join(' ')}`.yellow
        }. The arguments to pass to the system/unit test command.`,
        requiresArg: true,
        type: 'string',
      },
    })
    .example('Start a build in the current directory with default settings:')
    .example(`- ${'$ tools test build'.cyan}`)
    .example('Start a build that tests and deploys an App Engine app:')
    .example(
      `- ${
        '$ tools test build -l=~/nodejs-docs-samples/appengine/cloudsql --app --deploy'
          .cyan
      }`
    );
};

exports.handler = opts => {
  if (opts.dryRun) {
    utils.logger.log(CLI_CMD, 'Beginning dry run...'.cyan);
  }

  buildPack.expandConfig(opts);

  opts.keyFile || (opts.keyFile = buildPack.config.test.build.keyFile);
  opts.installCmd || (opts.installCmd = buildPack.config.test.install.cmd);
  opts.ci || (opts.ci = buildPack.config.test.build.ci);
  opts.requiresKeyFile ||
    (opts.requiresKeyFile = buildPack.config.requiresKeyFile);
  opts.image || (opts.image = opts.buildPack);
  if (opts.installArgs) {
    opts.installArgs = utils.parseArgs(opts.installArgs);
  } else {
    opts.installArgs = buildPack.config.test.install.args;
  }
  opts.testCmd || (opts.testCmd = buildPack.config.test.run.cmd);
  if (opts.testArgs) {
    opts.testArgs = utils.parseArgs(opts.testArgs);
  } else {
    opts.testArgs = buildPack.config.test.run.args;
  }
  opts.startCmd || (opts.startCmd = buildPack.config.test.app.cmd);
  if (opts.startArgs) {
    opts.startArgs = utils.parseArgs(opts.startArgs);
  } else {
    opts.startArgs = buildPack.config.test.app.args;
  }
  if (opts.run === undefined) {
    opts.run = buildPack.config.test.build.run;
  }

  opts.cloudbuildYamlPath = path.join(
    opts.localPath,
    'repo-tools-cloudbuild.yaml'
  );

  if (opts.requiresKeyFile && !opts.keyFile) {
    utils.logger.fatal(
      CLI_CMD,
      `Build target requires a key file but none was provided!`
    );
  } else if (buildPack.config.requiresProject && !opts.project) {
    utils.logger.fatal(
      CLI_CMD,
      `Build target requires a project ID but none was provided!`
    );
  }

  // Verify that required env vars are set, if any
  opts.requiredEnvVars =
    opts.requiredEnvVars || buildPack.config.test.build.requiredEnvVars || [];
  if (opts.requiredEnvVars && typeof opts.requiredEnvVars === 'string') {
    opts.requiredEnvVars = opts.requiredEnvVars.split(',');
  }
  opts.requiredEnvVars = opts.requiredEnvVars.map(envVar => {
    if (!process.env[envVar]) {
      utils.logger.fatal(
        CLI_CMD,
        `Test requires that the ${envVar} environment variable be set!`
      );
    }
    return {
      key: envVar,
      value: process.env[envVar],
    };
  });

  opts.repoPath =
    utils.getRepoPath(opts.repository, opts.localPath) || 'UNKNOWN';
  if (opts.repoPath) {
    utils.logger.log(CLI_CMD, `Detected repository: ${opts.repoPath.magenta}`);
  }
  opts.sha = getHeadCommitSha(opts.localPath) || 'UNKNOWN';
  if (opts.sha) {
    utils.logger.log(CLI_CMD, `Detected SHA: ${opts.sha.magenta}`);
  }
  if (opts.ci) {
    utils.logger.log(CLI_CMD, `Detected CI: ${`${opts.ci}`.magenta}`);
  }

  try {
    // Setup key file, if any
    if (opts.keyFile && opts.requiresKeyFile) {
      opts.keyFilePath = path.resolve(opts.keyFile);
      utils.logger.log(CLI_CMD, `Copying: ${opts.keyFilePath.yellow}`);
      opts.keyFileName = path.parse(opts.keyFilePath).base;
      opts.copiedKeyFilePath = path.join(
        opts.localPath,
        path.parse(opts.keyFilePath).base
      );
      if (!opts.dryRun) {
        fs.copySync(
          opts.keyFilePath,
          path.join(opts.localPath, path.parse(opts.keyFilePath).base)
        );
      }
    }
    // Setup project ID, if any
    if (opts.project) {
      utils.logger.log(
        CLI_CMD,
        `Setting build project ID to: ${opts.project.yellow}`
      );
    }

    // Generate the cloudbuild.yaml file
    utils.logger.log(CLI_CMD, `Compiling: ${opts.cloudbuildYamlPath.yellow}`);
    const template = handlebars.compile(fs.readFileSync(tpl, 'utf8'))(opts);
    if (!opts.dryRun) {
      utils.logger.log(CLI_CMD, `Writing: ${opts.cloudbuildYamlPath.yellow}`);
      fs.writeFileSync(opts.cloudbuildYamlPath, template);
    } else {
      utils.logger.log(
        CLI_CMD,
        `Printing: ${opts.cloudbuildYamlPath.yellow}\n${template}`
      );
    }

    // Start the build
    let buildCmd = `gcloud container builds submit . --config 'repo-tools-cloudbuild.yaml' --project '${
      opts.builderProject
    }'`;
    if (opts.async) {
      buildCmd += ' --async';
    } else {
      utils.logger.log(CLI_CMD, `Will wait for build to complete.`);
    }
    utils.logger.log(CLI_CMD, `Build command: ${buildCmd.yellow}`);
    if (!opts.dryRun) {
      const start = Date.now();
      try {
        childProcess.execSync(buildCmd, {
          cwd: opts.localPath,
          stdio: opts.silent ? 'ignore' : 'inherit',
          timeout: 20 * 60 * 1000,
        });
        // Remove temp files
        cleanup(opts);
        const timeTakenStr = utils.getTimeTaken(start);
        utils.logger.log(
          CLI_CMD,
          `Success! Build finished in ${timeTakenStr}.`.green
        );
      } catch (err) {
        // Remove temp files
        cleanup();
        const timeTakenStr = utils.getTimeTaken(start);
        utils.logger.error(
          CLI_CMD,
          `Oh no! Build failed after ${timeTakenStr}.`
        );
        // eslint-disable-next-line no-process-exit
        process.exit(err.status);
      }
    }
  } catch (err) {
    utils.logger.error(CLI_CMD, err);
    cleanup(opts);
    throw err;
  }

  if (opts.dryRun) {
    utils.logger.log(CLI_CMD, 'Dry run complete.'.cyan);
  }
};

function cleanup(opts) {
  try {
    fs.unlinkSync(opts.cloudbuildYamlPath);
  } catch (err) {
    // Ignore error
  }
  try {
    fs.unlinkSync(opts.copiedKeyFilePath);
  } catch (err) {
    // Ignore error
  }
}

function getHeadCommitSha(cwd) {
  if (process.env.CIRCLE_SHA1) {
    return process.env.CIRCLE_SHA1;
  }
  const stdout = childProcess.execSync('git log -n 1 --pretty=format:"%H"', {
    cwd,
    stdout: 'ignore',
    timeout: 20 * 60 * 1000,
  });
  return stdout.toString().trim();
}
