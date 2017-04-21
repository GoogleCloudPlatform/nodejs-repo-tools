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

const { spawn } = require('child_process');

const {
  error,
  finalize,
  getPort,
  log,
  testRequest
} = require('../utils');

module.exports = (config = {}) => {
  return new Promise((resolve, reject) => {
    const cwd = config.cwd || process.cwd();
    const cmd = config.startCmd || 'yarn';
    const args = config.startArgs || ['start'];

    if (config.dryRun) {
      log(config, 'Beginning dry run...'.cyan);
    }
    log(config, `Testing app in: ${cwd.yellow}`);

    getPort(config).then((port) => {
      log(config, `Using port:`, `${port}`.yellow);
      let calledDone = false;

      const opts = {
        cwd: config.cwd
      };

      opts.env = Object.assign({}, process.env);
      if (config.env) {
        Object.assign(opts.env, config.env);
      }
      opts.env.PORT = opts.env.PORT || config.port || port;

      log(config, `Start command: ${(cmd + ' ' + args.join(' ')).yellow}`);

      if (config.dryRun) {
        log(config, 'Dry run complete.'.cyan);
        resolve();
        return;
      }

      const child = spawn(cmd, args, opts);
      log(config, `Child process ID:`, `${child.pid}`.yellow);

      child.on('error', finish);

      child.stdout.on('data', (data) => {
        process.stdout.write(`${config.test.bold}: ${'stdout:'.bold} ${data.toString()}`);
      });
      child.stderr.on('data', (data) => {
        process.stderr.write(`${config.test.bold}: ${'stderr:'.red} ${data.toString().red}`);
      });

      let requestErr;

      child.on('exit', (code, signal) => {
        if (code !== 0 && signal !== 'SIGKILL') {
          finish(new Error(`${config.test}: failed to run!`));
        } else {
          finish(requestErr);
        }
      });

      // Give the server time to start up
      setTimeout(() => {
        // Test that the app is working
        testRequest(config.url || `http://localhost:${opts.env.PORT}`, config)
          .then(() => finish(), (err) => {
            requestErr = err;
            finish(requestErr);
          });
      }, 3000);

      function cleanup () {
        try {
          process.kill(child.pid, 'SIGKILL');
        } catch (err) {
          // Ignore error
          console.error(err);
        }
        try {
          child.kill('SIGKILL');
        } catch (err) {
          // Ignore error
          console.error(err);
        }
        process.removeListener('exit', cleanup);
      }

      process.on('exit', cleanup);

      // Exit helper so we don't call "cb" more than once
      function finish (err) {
        if (!calledDone) {
          calledDone = true;

          setTimeout(() => {
            if (err) {
              error(config, err);
            } else {
              log(config, 'Finished testing app.'.green);
            }
            finalize(err, resolve, reject);
          }, 1000);

          cleanup();
        }
      }
    });
  });
};
