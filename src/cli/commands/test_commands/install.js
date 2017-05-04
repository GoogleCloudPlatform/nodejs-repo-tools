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

const INSTALL_CMD = buildPacks.config.test.install.cmd;
const INSTALL_ARGS = buildPacks.config.test.install.args;
const INSTALL_CMD_STR = `${INSTALL_CMD} ${INSTALL_ARGS.join(' ')}`.trim();
const COMMAND = `samples test install ${'[options] [--] [args...]'.yellow}`;
const DESCRIPTION = `Run ${INSTALL_CMD_STR.bold} in ${buildPacks.cwd.yellow}.`;
const USAGE = `Usage:
  ${COMMAND.bold}
Description:
  ${DESCRIPTION}

  Override the args passed to the configured install command by appending ${'-- "your" "args" "here"'.bold} when you run the ${'test install'.bold} command.`;

exports.command = 'install';
exports.description = DESCRIPTION;
exports.builder = (yargs) => {
  yargs
    .usage(USAGE)
    .options({
      cmd: {
        description: `${'Default:'.bold} ${`${INSTALL_CMD}`.yellow}. The install command to use.`,
        type: 'string'
      }
    })
    .example('Run the install command in the specified directory:')
    .example(`- ${'samples test install -l=~/projects/some/dir'.cyan}`)
    .example(`Runs ${'npm install --no-optional'.bold} instead of the default command:`)
    .example(`- ${'samples test install --cmd=npm -- install --no-optional'.cyan}`);
};

exports.handler = (opts) => {
  if (opts.dryRun) {
    utils.log('install', 'Beginning dry run.'.cyan);
  }

  buildPacks.expandConfig(opts);

  opts.cmd || (opts.cmd = buildPacks.config.test.install.cmd);
  opts.args || (opts.args = buildPacks.config.test.install.args);

  utils.log('install', `Installing dependencies in: ${opts.localPath.yellow}`);
  utils.log('install', 'Running:', opts.cmd.yellow, opts.args.join(' ').yellow);

  if (opts.dryRun) {
    utils.log('install', 'Dry run complete.'.cyan);
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
        utils.error('install', 'Install failed.'.red);
        process.exit(code || 1);
      } else {
        utils.log('install', 'Installation complete.'.green);
      }
    });
};
