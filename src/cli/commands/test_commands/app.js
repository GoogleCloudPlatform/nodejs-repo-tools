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

const buildPack = require('../../../build_packs').getBuildPack();
const options = require('../../options');
const utils = require('../../../utils');

const CLI_CMD = 'app';
const COMMAND = `tools test ${CLI_CMD} ${'[options]'.yellow}`;
const DESCRIPTION = `Start an app and test it with a GET request.`;
const USAGE = `Usage:
  ${COMMAND.bold}
Description:
  ${DESCRIPTION}

  Override the args passed to the configured start command by appending ${
    '-- "your" "args" "here"'.bold
  } when you run the ${'test app'.bold} command.`;

exports.command = CLI_CMD;
exports.description = DESCRIPTION;
exports.builder = yargs => {
  yargs.usage(USAGE).options({
    cmd: {
      description: `${'Default:'.bold} ${
        buildPack.config.test.app.cmd.yellow
      }. The command used to start the app.`,
      type: 'string',
    },
    port: {
      description: `Override the port the app should listen on. By default the command will find an open port.`,
      type: 'number',
    },
    start: {
      default: true,
      description: `${'Default:'.bold} ${
        'true'.yellow
      }. Whether to start the app in addition to sending it a request.`,
      type: 'boolean',
    },
    config: options.config,
    'config-key': options['config-key'],
    url: {
      description: `Override the request url.`,
      type: 'string',
    },
    msg: {
      description:
        'Set a message the should be found in the response to the rest request.',
      requiresArg: true,
      type: 'string',
    },
    code: {
      description: 'Override the expected status code of the response.',
      requiresArg: true,
      type: 'number',
    },
    'required-env-vars': {
      alias: 'r',
      description:
        'Specify environment variables that must be set for the test to succeed.',
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

  opts.cmd || (opts.cmd = buildPack.config.test.app.cmd);
  opts.args || (opts.args = buildPack.config.test.app.args);
  opts.port || (opts.port = buildPack.config.test.app.port);
  opts.msg || (opts.msg = buildPack.config.test.app.msg);
  opts.code || (opts.code = buildPack.config.test.app.code);
  opts.url || (opts.code = buildPack.config.test.app.url);

  // Verify that required env vars are set, if any
  opts.requiredEnvVars =
    opts.requiredEnvVars || buildPack.config.test.app.requiredEnvVars || [];
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

  if (!opts.start) {
    utils
      .testRequest(
        opts.url ||
          `http://localhost:${opts.port ||
            buildPack.config.test.app.port ||
            8080}`,
        opts
      )
      .then(
        () => utils.logger.log(CLI_CMD, 'Test complete.'.green),
        err => utils.logger.error(CLI_CMD, 'Test failed.', err)
      );
    return;
  }

  utils
    .getPort(opts)
    .then(port => {
      const options = {
        cwd: opts.localPath,
        stdio: opts.silent ? 'ignore' : 'inherit',
        env: _.merge(
          _.merge({}, process.env),
          buildPack.config.test.app.env || {}
        ),
        shell: true,
      };

      options.env.PORT = port;

      utils.logger.log(CLI_CMD, `Starting app in: ${opts.localPath.yellow}`);
      utils.logger.log(CLI_CMD, `Using port: ${`${options.env.PORT}`.yellow}`);
      utils.logger.log(
        CLI_CMD,
        'Running:',
        opts.cmd.yellow,
        opts.args.join(' ').yellow
      );

      if (opts.dryRun) {
        utils.logger.log(
          CLI_CMD,
          `Verifying: ${
            `${opts.url || `http://localhost:${options.env.PORT}`}`.yellow
          }.`
        );
        utils.logger.log(CLI_CMD, 'Dry run complete.'.cyan);
        return;
      }

      let requestErr = null;

      const start = Date.now();

      // Start the app
      const child = childProcess
        .spawn(opts.cmd, opts.args, options)
        .on('exit', (code, signal) => {
          const timeTakenStr = utils.getTimeTaken(start);
          if (code || signal !== 'SIGTERM' || requestErr) {
            utils.logger.error(
              CLI_CMD,
              `Oh no! Test failed after ${timeTakenStr}.`,
              requestErr
            );
          } else {
            utils.logger.log(
              CLI_CMD,
              `Success! Test finished in ${timeTakenStr}.`.green
            );
          }
        });

      utils.logger.log(CLI_CMD, `Child process ID:`, `${child.pid}`.yellow);

      function cleanup() {
        // Try different ways of killing the child process
        try {
          process.kill(child.pid, 'SIGTERM');
        } catch (err) {
          // Ignore error
        }
        try {
          child.kill('SIGTERM');
        } catch (err) {
          // Ignore error
        }
        process.removeListener('exit', cleanup);
      }

      // Be prepared to cleanup the child process
      process.on('exit', cleanup);

      // Give the app time to start up
      setTimeout(() => {
        // Test that the app is working
        utils
          .testRequest(opts.url || `http://localhost:${options.env.PORT}`, opts)
          .then(
            () => cleanup(),
            err => {
              requestErr = err;
              cleanup();
            }
          );
      }, 3000);
    })
    .catch(err => {
      utils.logger.fatal(CLI_CMD, err.stack || err.message);
    });
};
