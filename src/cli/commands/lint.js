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

'use strict';

require('colors');

const {spawn} = require('child_process');

const buildPack = require('../../build_packs').getBuildPack();
const utils = require('../../utils');

const CLI_CMD = 'lint';
// Currently, the base lint command/args are not configurable from the
// command-line.
const LINT_CMD = buildPack.config.lint.cmd;
const LINT_ARGS = buildPack.config.lint.args;
const LINT_CMD_STR = `${LINT_CMD} ${LINT_ARGS.join(' ')}`.trim();
const COMMAND = `tools ${CLI_CMD} -- ${'[files...]'.yellow}`;
const DESCRIPTION = `Lint files by running: ${LINT_CMD_STR.bold} in ${buildPack
  ._cwd.yellow}.`;
const USAGE = `Usage:
  ${COMMAND.bold}
Description:
  ${DESCRIPTION}
Positional arguments:
  ${'files'.bold} (variadic)
    The files to lint.`;

exports.command = `${CLI_CMD}`;
exports.description = DESCRIPTION;
exports.builder = yargs => {
  yargs.usage(USAGE).options({
    cmd: {
      description: `${'Default:'.bold} ${`${LINT_CMD}`
        .yellow}. The lint command to use.`,
      type: 'string',
    },
  });
};
exports.handler = opts => {
  if (opts.dryRun) {
    utils.logger.log(CLI_CMD, 'Beginning dry run.'.cyan);
  }

  buildPack.expandConfig(opts);

  opts.cmd || (opts.cmd = buildPack.config.lint.cmd);
  opts.args || (opts.args = buildPack.config.lint.args);

  utils.logger.log(CLI_CMD, 'Linting files in:', opts.localPath.yellow);
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
    stdio: 'inherit',
    shell: true,
  };

  const start = Date.now();

  spawn(opts.cmd, opts.args, options).on('exit', (code, signal) => {
    const timeTakenStr = utils.getTimeTaken(start);
    if (code !== 0 || signal) {
      utils.logger.error(
        CLI_CMD,
        `Oh no! Linting failed after ${timeTakenStr}.`
      );
      // eslint-disable-next-line no-process-exit
      process.exit(code || 1);
    } else {
      utils.logger.log(
        CLI_CMD,
        `Success! Linting finished in ${timeTakenStr}.`.green
      );
    }
  });
};
