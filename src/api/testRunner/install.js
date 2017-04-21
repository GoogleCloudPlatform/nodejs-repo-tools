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
const { log } = require('../utils');

module.exports = (config = {}) => {
  return new Promise((resolve, reject) => {
    const cwd = config.cwd || process.cwd();
    const cmd = config.installCmd || 'yarn';
    const args = config.installArgs || ['install', '--mutex', 'file:/tmp/.yarn-mutex'];

    if (config.dryRun) {
      log(config, 'Beginning dry run...'.cyan);
    }
    log(config, `Installing dependencies in: ${cwd.yellow}`);
    log(config, `Install command: ${(cmd + ' ' + args.join(' ')).yellow}`);

    if (config.dryRun) {
      log(config, 'Dry run complete.'.cyan);
      resolve();
      return;
    }

    const child = spawn(cmd, args, { cwd });

    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`${config.test.bold}: ${'INSTALLATION FAILED!'.red}`));
      } else {
        log(config, 'Finished installing dependencies.'.green);
        resolve();
      }
    });

    child.stdout.on('data', (data) => {
      process.stdout.write(`${config.test.bold}: ${'stdout:'.bold} ${data.toString()}`);
    });
    child.stderr.on('data', (data) => {
      process.stderr.write(`${config.test.bold}: ${'stderr:'.red} ${data.toString().red}`);
    });
  });
};
