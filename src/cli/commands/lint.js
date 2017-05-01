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

const buildPacks = require('../../build_packs');
const { error, log } = require('../../utils');

const LINT_CMD = buildPacks.config.lint.cmd;
const LINT_ARGS = buildPacks.config.lint.args;
const LINT_CMD_STR = `${LINT_CMD} ${LINT_ARGS.join(' ')}`.trim();
const COMMAND = `samples lint ${'[files...]'.yellow}`;
const DESCRIPTION = `Lint samples by running: ${LINT_CMD_STR.bold} in ${buildPacks.cwd.yellow}.`;
const USAGE = `Usage:
  ${COMMAND.bold}
Description:
  ${DESCRIPTION}
Positional arguments:
  ${'files'.bold} (variadic)
    The files to lint.`;

exports.command = 'lint [files..]';
exports.description = DESCRIPTION;
exports.builder = (yargs) => {
  yargs.usage(USAGE);
};
exports.handler = (opts) => {
  const cmd = LINT_CMD;
  let args = LINT_ARGS;

  if (opts.dryRun) {
    log('lint', 'Beginning dry run.'.cyan);
  }

  if (opts.files && opts.files.length > 0) {
    args = opts
      .files
      .filter((file) => file)
      .map((file) => {
        // TODO: Do more escaping of user input
        // TOOD: Also, this doesn't work right. samples lint \"**/*.js\" \"scripts/*\" doesn't work
        if (!file.startsWith(`'`)) {
          file = `'${file}`;
        }
        if (!file.endsWith(`'`)) {
          file = `${file}'`;
        }

        return file;
      });
  }

  log('lint', 'Linting files in:', opts.localPath.yellow);
  log('lint', 'Running:', cmd.yellow, args.join(' ').yellow);

  if (opts.dryRun) {
    log('lint', 'Dry run complete.'.cyan);
    return;
  }

  const options = {
    cwd: opts.localPath,
    stdio: 'inherit'
  };

  spawn(cmd, args, options)
    .on('exit', (code, signal) => {
      if (code !== 0 || signal) {
        error('lint', 'Linting failed.'.red);
        process.exit(code || 1);
      } else {
        log('lint', 'Looks good!'.green);
      }
    });
};
