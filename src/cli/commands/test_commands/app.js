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

const buildPacks = require('../../../build_packs');
const utils = require('../../../utils');

const COMMAND = `samples test app ${'[options]'.yellow}`;
const DESCRIPTION = `Start an app and test it with a GET request.`;
const USAGE = `Usage:
  ${COMMAND.bold}
Description:
  ${DESCRIPTION}

  Override the args passed to the configured start command by appending ${'-- "your" "args" "here"'.bold} when you run the ${'test app'.bold} command.`;

exports.command = 'app';
exports.description = DESCRIPTION;
exports.builder = (yargs) => {
  yargs
    .usage(USAGE)
    .options({
      cmd: {
        description: `${'Default:'.bold} ${buildPacks.config.test.app.cmd.yellow}. The command used to start the app.`,
        type: 'string'
      },
      port: {
        description: `Override the port the app should listen on. By default the command will find an open port.`,
        type: 'number'
      },
      start: {
        default: true,
        description: `${'Default:'.bold} ${'true'.yellow}. Whether to start the app in addition to sending it a request.`,
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
      url: {
        description: `Override the request url.`,
        type: 'string'
      },
      msg: {
        description: 'Set a message the should be found in the response to the rest request.',
        requiresArg: true,
        type: 'string'
      },
      code: {
        description: 'Override the expected status code of the response.',
        requiresArg: true,
        type: 'number'
      },
      'required-env-vars': {
        alias: 'r',
        description: 'Specify environment variables that must be set for the test to succeed.',
        requiresArg: true,
        type: 'string'
      }
    });
};

exports.handler = (opts) => {
  if (opts.dryRun) {
    utils.log('app', 'Beginning dry run.'.cyan);
  }

  buildPacks.expandConfig(opts);

  opts.cmd || (opts.cmd = buildPacks.config.test.app.cmd);
  opts.args || (opts.args = buildPacks.config.test.app.args);
  opts.port || (opts.port = buildPacks.config.test.app.port);
  opts.msg || (opts.msg = buildPacks.config.test.app.msg);
  opts.code || (opts.code = buildPacks.config.test.app.code);

  // Verify that required env vars are set, if any
  opts.requiredEnvVars = opts.requiredEnvVars || buildPacks.config.test.app.requiredEnvVars || [];
  if (opts.requiredEnvVars && typeof opts.requiredEnvVars === 'string') {
    opts.requiredEnvVars = opts.requiredEnvVars.split(',');
  }
  opts.requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      utils.error('app', `Test requires that the ${envVar} environment variable be set!`);
      process.exit(1);
    }
  });

  if (!opts.start) {
    utils.testRequest(opts.url || `http://localhost:${opts.port || buildPacks.config.test.app.port || 8080}`, opts)
      .then(() => utils.log('app', 'Test complete.'.green), (err) => utils.error('app', 'Test failed.', err));
    return;
  }

  utils.getPort(opts).then((port) => {
    const options = {
      cwd: opts.localPath,
      stdio: opts.silent ? 'ignore' : 'inherit',
      env: _.merge(_.merge({}, process.env), buildPacks.config.test.app.env || {})
    };

    options.env.PORT = port;

    utils.log('app', `Starting app in: ${opts.localPath.yellow}`);
    utils.log('app', `Using port: ${`${options.env.PORT}`.yellow}`);
    utils.log('app', 'Running:', opts.cmd.yellow, opts.args.join(' ').yellow);

    if (opts.dryRun) {
      utils.log('app', `Verifying: ${`${opts.url || `http://localhost:${options.env.PORT}`}`.yellow}.`);
      utils.log('app', 'Dry run complete.'.cyan);
      return;
    }

    let requestErr = null;

    // Start the app
    const child = childProcess
      .spawn(opts.cmd, opts.args, options)
      .on('exit', (code, signal) => {
        if (code || signal !== 'SIGTERM' || requestErr) {
          utils.error('app', 'Test failed.', requestErr);
        } else {
          utils.log('app', 'Test complete.'.green);
        }
      });

    utils.log('app', `Child process ID:`, `${child.pid}`.yellow);

    function cleanup () {
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
      utils.testRequest(opts.url || `http://localhost:${options.env.PORT}`, opts)
        .then(() => cleanup(), (err) => {
          requestErr = err;
          cleanup();
        });
    }, 3000);
  }).catch((err) => {
    utils.error('app', err.stack || err.message);
    process.exit(1);
  });
};
