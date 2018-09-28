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

const CLI_CMD = 'install';
const INSTALL_CMD = buildPack.config.test.install.cmd;
const INSTALL_ARGS = buildPack.config.test.install.args;
const INSTALL_CMD_STR = `${INSTALL_CMD} ${INSTALL_ARGS.join(' ')}`.trim();
const COMMAND = `tools test ${CLI_CMD} ${'[options] [--] [args...]'.yellow}`;
const DESCRIPTION = `Run ${INSTALL_CMD_STR.bold} in ${buildPack._cwd.yellow}.`;
const USAGE = `Usage:
  ${COMMAND.bold}
Description:
  ${DESCRIPTION}

  Override the args passed to the configured install command by appending ${
    '-- "your" "args" "here"'.bold
  } when you run the ${'test install'.bold} command.`;

exports.command = CLI_CMD;
exports.description = DESCRIPTION;
exports.builder = yargs => {
  yargs
    .usage(USAGE)
    .options({
      cmd: {
        description: `${'Default:'.bold} ${
          `${INSTALL_CMD}`.yellow
        }. The install command to use.`,
        type: 'string',
      },
    })
    .example('Run the install command in the specified directory:')
    .example(`- ${'tools test install -l=~/projects/some/dir'.cyan}`)
    .example(
      `Runs ${'npm install --no-optional'.bold} instead of the default command:`
    )
    .example(
      `- ${'tools test install --cmd=npm -- install --no-optional'.cyan}`
    );
};

exports.handler = opts => {
  if (opts.dryRun) {
    utils.logger.log(CLI_CMD, 'Beginning dry run.'.cyan);
  }

  buildPack.expandConfig(opts);

  opts.cmd || (opts.cmd = buildPack.config.test.install.cmd);
  opts.args || (opts.args = buildPack.config.test.install.args);

  utils.logger.log(
    CLI_CMD,
    `Installing dependencies in: ${opts.localPath.yellow}`
  );
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
          `Oh no! Install failed after ${timeTakenStr}.`
        );
        // eslint-disable-next-line no-process-exit
        process.exit(code || 1);
      } else {
        utils.logger.log(
          CLI_CMD,
          `Success! Installation finished in ${timeTakenStr}.`.green
        );
      }
    });
};
