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

const buildPack = require('../../build_packs').getBuildPack();
const { logger } = require('../../utils');

const CLI_CMD = 'lint';
// Currently, the base lint command/args are not configurable from the
// command-line.
const LINT_CMD = buildPack.config.lint.cmd;
const LINT_ARGS = buildPack.config.lint.args;
const LINT_CMD_STR = `${LINT_CMD} ${LINT_ARGS.join(' ')}`.trim();
const COMMAND = `tools ${CLI_CMD} ${'[files...]'.yellow}`;
const DESCRIPTION = `Lint files by running: ${LINT_CMD_STR.bold} in ${buildPack._cwd.yellow}.`;
const USAGE = `Usage:
  ${COMMAND.bold}
Description:
  ${DESCRIPTION}
Positional arguments:
  ${'files'.bold} (variadic)
    The files to lint.`;

exports.command = `${CLI_CMD} [files..]`;
exports.description = DESCRIPTION;
exports.builder = (yargs) => {
  yargs.usage(USAGE);
};
exports.handler = (opts) => {
  const cmd = LINT_CMD;
  let args = LINT_ARGS;

  if (opts.dryRun) {
    logger.log(CLI_CMD, 'Beginning dry run.'.cyan);
  }

  if (opts.files && opts.files.length > 0) {
    args = opts
      .files
      .filter((file) => file);
  }

  logger.log(CLI_CMD, 'Linting files in:', opts.localPath.yellow);
  logger.log(CLI_CMD, 'Running:', cmd.yellow, args.join(' ').yellow);

  if (opts.dryRun) {
    logger.log(CLI_CMD, 'Dry run complete.'.cyan);
    return;
  }

  const options = {
    cwd: opts.localPath,
    stdio: 'inherit'
  };

  spawn(cmd, args, options)
    .on('exit', (code, signal) => {
      if (code !== 0 || signal) {
        logger.error(CLI_CMD, 'Linting failed.'.red);
        process.exit(code || 1);
      } else {
        logger.log(CLI_CMD, 'Looks good!'.green);
      }
    });
};
