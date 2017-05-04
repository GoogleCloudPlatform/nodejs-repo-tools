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

const childProcess = require('child_process');

const buildPacks = require('../../../build_packs');
const utils = require('../../../utils');

const TEST_CMD = buildPacks.config.test.run.cmd;
const TEST_ARGS = buildPacks.config.test.run.args;
const TEST_CMD_STR = `${TEST_CMD} ${TEST_ARGS.join(' ')}`.trim();
const COMMAND = `samples test run ${'[options] [--] [args...]'.yellow}`;
const DESCRIPTION = `Run ${TEST_CMD_STR.bold} in ${buildPacks.cwd.yellow}.`;
const USAGE = `Usage:
  ${COMMAND.bold}
Description:
  ${DESCRIPTION}

  Override the args passed to the configured test command by appending ${'-- "your" "args" "here"'.bold} when you run the ${'test run'.bold} command.`;

exports.command = 'run';
exports.description = DESCRIPTION;
exports.builder = (yargs) => {
  yargs
    .usage(USAGE)
    .options({
      cmd: {
        description: `${'Default:'.bold} ${`${TEST_CMD}`.yellow}. The test command to use.`,
        type: 'string'
      }
    })
    .example('Run the test command in the specified directory:')
    .example(`- ${'samples test run -l=~/projects/some/dir'.cyan}`)
    .example(`Runs ${'npm run system-test'.bold} instead of the default command:`)
    .example(`- ${'samples test install --cmd=npm -- run system-test'.cyan}`);
};

exports.handler = (opts) => {
  if (opts.dryRun) {
    utils.log('run', 'Beginning dry run.'.cyan);
  }

  buildPacks.expandConfig(opts);

  opts.cmd || (opts.cmd = buildPacks.config.test.run.cmd);
  opts.args || (opts.args = buildPacks.config.test.run.args);

  utils.log('run', `Executing tests in: ${opts.localPath.yellow}`);
  utils.log('run', 'Running:', opts.cmd.yellow, opts.args.join(' ').yellow);

  if (opts.dryRun) {
    utils.log('run', 'Dry run complete.'.cyan);
    return;
  }

  const options = {
    cwd: opts.localPath,
    stdio: opts.silent ? 'ignore' : 'inherit'
  };

  childProcess
    .spawn(opts.cmd, opts.args, options)
    .on('exit', (code, signal) => {
      if (code !== 0 || signal) {
        utils.error('run', 'Test failed.'.red);
        process.exit(code || 1);
      } else {
        utils.log('run', 'Test complete.'.green);
      }
    });
};
