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
const COMMAND = `samples test install ${'[options]'.yellow}`;
const DESCRIPTION = `Install an application's dependencies by running: ${INSTALL_CMD_STR.bold} in ${buildPacks.cwd.yellow}.`;
const USAGE = `Usage:
  ${COMMAND.bold}
Description:
  ${DESCRIPTION}`;

exports.command = 'install';
exports.description = DESCRIPTION;
exports.builder = (yargs) => {
  yargs
    .usage(USAGE)
    .options({
      cmd: {
        description: 'c',
        type: 'string'
      },
      args: {
        description: 'a',
        type: 'string'
      }
    });
};

exports.handler = (opts) => {
  if (opts.dryRun) {
    utils.log('install', 'Beginning dry run.'.cyan);
  }

  buildPacks.loadConfig(opts);

  opts.cmd || (opts.cmd = INSTALL_CMD);
  if (opts.args) {
    // TODO: Splitting like this isn't accurate enough
    opts.args = opts.args.split(' ');
  } else {
    opts.args = INSTALL_ARGS;
  }

  utils.log('install', `Installing dependencies in: ${opts.localPath.yellow}`);
  utils.log('install', 'Running:', opts.cmd.yellow, opts.args.join(' ').yellow);

  if (opts.dryRun) {
    utils.log('install', 'Dry run complete.'.cyan);
    return;
  }

  const options = {
    cwd: opts.localPath,
    stdio: 'inherit'
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
