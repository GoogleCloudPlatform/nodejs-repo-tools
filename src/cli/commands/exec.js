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

const buildPack = require('../../build_packs').getBuildPack();
const utils = require('../../utils');

const CLI_CMD = 'exec';
const COMMAND = `tools exec ${'[options] [--] <cmd> [args...]'.yellow}`;
const DESCRIPTION = `Run a given command in ${buildPack._cwd.yellow}.`;
const USAGE = `Usage:
  ${COMMAND.bold}
Description:
  ${DESCRIPTION}`;

exports.command = CLI_CMD;
exports.description = DESCRIPTION;
exports.builder = yargs => {
  yargs
    .usage(USAGE)
    .example('Run the given command in the specified directory:')
    .example(`- ${'tools exec -l=~/projects/some/dir -- echo "hi"'.cyan}`);
};

exports.handler = opts => {
  if (opts.dryRun) {
    utils.logger.log(CLI_CMD, 'Beginning dry run.'.cyan);
  }

  buildPack.expandConfig(opts);

  opts.args || (opts.args = []);

  if (opts.args.length === 0) {
    utils.logger.fatal(
      CLI_CMD,
      'You must provide at least 1 command argument!'
    );
  }

  utils.logger.log(CLI_CMD, `Executing in: ${opts.localPath.yellow}`);
  utils.logger.log(CLI_CMD, 'Running:', opts.args.join(' ').yellow);

  if (opts.dryRun) {
    utils.logger.log(CLI_CMD, 'Dry run complete.'.cyan);
    return;
  }

  const options = {
    cwd: opts.localPath,
    stdio: opts.silent ? 'ignore' : 'inherit',
    shell: true,
  };

  const start = Date.now();

  childProcess
    .spawn(opts.args[0], opts.args.slice(1), options)
    .on('exit', (code, signal) => {
      const timeTakenStr = utils.getTimeTaken(start);
      if (code !== 0 || signal) {
        utils.logger.error(
          CLI_CMD,
          `Oh no! Execution failed after ${timeTakenStr}.`
        );
        // eslint-disable-next-line no-process-exit
        process.exit(code || 1);
      } else {
        utils.logger.log(
          CLI_CMD,
          `Success! Execution finished in ${timeTakenStr}.`.green
        );
      }
    });
};
