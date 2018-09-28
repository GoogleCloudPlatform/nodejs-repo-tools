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

const fs = require('fs-extra');
const parser = require('yargs-parser');
const path = require('path');

const {logger} = require('../utils');

const packs = (exports.packs = fs
  .readdirSync(__dirname)
  .filter(name => name !== 'index.js' && name !== 'build_pack.js')
  .map(name => {
    return {
      name: name.replace('.js', ''),
      BuildPack: require(`./${name}`),
    };
  }));

exports.BuildPack = require('./build_pack');
exports.NodejsBuildPack = require('./nodejs');
exports.PythonBuildPack = require('./python');
exports.RubyBuildPack = require('./ruby');

let currentBuildPack;

/**
 * This methods examines the arguments passed to the current process in order
 * to infer which build pack to use. If localPath wasn't specified then it
 * will add it to the process args.
 *
 * @param {*} args
 */
exports.getBuildPack = (args = process.argv) => {
  let isHelpOrVersion = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (
      arg === '--help' ||
      arg === '-h' ||
      arg === '--version' ||
      arg === '-v'
    ) {
      isHelpOrVersion = true;
      break;
    }
  }

  if (currentBuildPack) {
    // Return the cached build pack
    return currentBuildPack;
  }

  logger.debug('Detecting buildPack...');

  let buildPackName, localPath;
  const argv = parser(args);

  buildPackName = argv.buildPack || argv.b;
  localPath = argv.localPath || argv.l;

  if (localPath) {
    localPath = path.resolve(localPath);
    logger.debug(`Using provided localPath: ${localPath.yellow}`);
  } else {
    logger.debug('Inferring localPath...');
    localPath = process.cwd();
    const index = process.argv.indexOf('--');
    if (index >= 0) {
      process.argv.splice(index, 0, `--local-path=${localPath}`);
    } else {
      process.argv.push(`--local-path=${localPath}`);
    }
    logger.debug(`Inferred localPath: ${localPath.yellow}`);
  }

  // Try to load the build pack selected by the user
  if (buildPackName) {
    // Otherwise try to infer the build pack
    const pack = packs.find(pack => pack.name === buildPackName);
    if (!pack) {
      logger.fatal('cli', `Invalid buildPack: ${buildPackName}`);
    }
    logger.debug(`Using specified buildPack: ${buildPackName.yellow}`);
    currentBuildPack = new pack.BuildPack(
      {},
      {
        _name: buildPackName,
        _selected: true,
        _cwd: localPath,
      }
    );
    return currentBuildPack;
  }
  logger.debug('Inferring buildPack...');

  // Otherwise try to infer the build pack
  const pack = packs.find(pack => {
    try {
      return pack.BuildPack.detect(localPath);
    } catch (err) {
      // Ignore error
    }
  });

  if (pack) {
    const index = process.argv.indexOf('--');
    const buildPackArg = `--build-pack=${pack.name}`;
    if (index >= 0) {
      process.argv.splice(index, 0, buildPackArg);
    } else {
      process.argv.push(buildPackArg);
    }
    logger.debug(`Inferred buildPack: ${pack.name.yellow}`);
    currentBuildPack = new pack.BuildPack(
      {},
      {
        _name: pack.name,
        _detected: true,
        _cwd: localPath,
      }
    );
    return currentBuildPack;
  }

  if (!isHelpOrVersion) {
    logger.error(
      'cli',
      `Could not infer build pack! Using the default build pack which does not support all commands.`
        .yellow
    );
  }

  currentBuildPack = new exports.BuildPack();
  currentBuildPack._name = 'default';
  currentBuildPack._selected = true;
  currentBuildPack._cwd = localPath;
  return currentBuildPack;
};
