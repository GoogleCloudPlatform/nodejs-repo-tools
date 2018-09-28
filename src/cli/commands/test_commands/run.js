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

const buildPack = require('../../../build_packs').getBuildPack();
const utils = require('../../../utils');

const CLI_CMD = 'run';
const TEST_CMD = buildPack.config.test.run.cmd;
const TEST_ARGS = buildPack.config.test.run.args;
const TEST_CMD_STR = `${TEST_CMD} ${TEST_ARGS.join(' ')}`.trim();
const COMMAND = `tools test ${CLI_CMD} ${'[options] [--] [args...]'.yellow}`;
const DESCRIPTION = `Run ${TEST_CMD_STR.bold} in ${buildPack._cwd.yellow}.`;
const USAGE = `Usage:
  ${COMMAND.bold}
Description:
  ${DESCRIPTION}

  Override the args passed to the configured test command by appending ${
    '-- "your" "args" "here"'.bold
  } when you run the ${'test run'.bold} command.`;

exports.command = CLI_CMD;
exports.description = DESCRIPTION;
exports.builder = yargs => {
  yargs
    .usage(USAGE)
    .options({
      cmd: {
        description: `${'Default:'.bold} ${
          `${TEST_CMD}`.yellow
        }. The test command to use.`,
        type: 'string',
      },
    })
    .example('Run the test command in the specified directory:')
    .example(`- ${'tools test run -l=~/projects/some/dir'.cyan}`)
    .example(
      `Runs ${'npm run system-test'.bold} instead of the default command:`
    )
    .example(`- ${'tools test install --cmd=npm -- run system-test'.cyan}`);
};

exports.handler = opts => {
  if (opts.dryRun) {
    utils.logger.log(CLI_CMD, 'Beginning dry run.'.cyan);
  }

  buildPack.expandConfig(opts);

  opts.cmd || (opts.cmd = buildPack.config.test.run.cmd);
  opts.args || (opts.args = buildPack.config.test.run.args);

  utils.logger.log(CLI_CMD, `Executing tests in: ${opts.localPath.yellow}`);
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
    stdio: opts.silent ? 'ignore' : 'inherit',
    shell: true,
  };

  const start = Date.now();

  childProcess
    .spawn(opts.cmd, opts.args, options)
    .on('exit', (code, signal) => {
      const timeTakenStr = utils.getTimeTaken(start);
      if (code !== 0 || signal) {
        utils.logger.error(
          CLI_CMD,
          `Oh no! Test failed after ${timeTakenStr}.`
        );
        // eslint-disable-next-line no-process-exit
        process.exit(code || 1);
      } else {
        utils.logger.log(
          CLI_CMD,
          `Success! Test finished in ${timeTakenStr}`.green
        );
      }
    });
};
