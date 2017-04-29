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

const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');

const utils = require('../utils');

const packs = fs
  .readdirSync(__dirname)
  .filter((name) => name !== 'index.js')
  .map((name) => name.replace('.js', ''));

class BuildPacks {
  constructor (packs) {
    this.config = {};
    this.current = null;
    this.packs = packs;

    packs.forEach((pack) => {
      this[pack] = require(path.join(__dirname, pack));
    });
  }

  detectBuildPack (args = process.argv) {
    let buildPack, localPath;

    args.forEach((arg, i) => {
      if (arg === '--build-pack' || arg === '--buildPack' || arg === 'b') {
        if (args[i + 1] in packs) {
          buildPack = args[i + 1];
        }
      } else if (arg.startsWith('--build-pack=')) {
        buildPack = arg.replace('--build-pack=', '');
      } else if (arg.startsWith('--buildPack=')) {
        buildPack = arg.replace('--buildPack=', '');
      } else if (arg.startsWith('-b=')) {
        buildPack = arg.replace('-b=', '');
      } else if (arg === '--local-path' || arg === '--localPath' || arg === '-l') {
        localPath = args[i + 1];
      }
    });

    if (localPath) {
      localPath = path.resolve(localPath);
    } else {
      localPath = process.cwd();
      process.argv.push(`--local-path=${localPath}`);
    }

    this.cwd = localPath;

    // Use the build pack selected by the user
    if (buildPack) {
      if (packs.indexOf(buildPack) === -1) {
        utils.error('cli', `Invalid build pack: ${buildPack}`);
        process.exit(1);
      }

      this.selected = true;
      this.current = buildPack;
    } else {
      packs.forEach((pack) => {
        try {
          if (this[pack].detect(localPath)) {
            buildPack = pack;
            return false;
          }
        } catch (err) {
          // Ignore error
        }
      });

      if (buildPack) {
        process.argv.push(`--build-pack=${buildPack}`);

        this.selected = false;
        this.current = buildPack;
      }
    }

    if (buildPack) {
      this.config = {};
      _.merge(this.config, this.global);
      _.merge(this.config, this[buildPack]);
    }
  }

  loadConfig (opts) {
    opts.localPath = path.resolve(opts.localPath);

    let config;
    const configFilename = opts.config || this.config.global.config;
    const configKey = opts.configKey || this.config.global.configKey;

    if (configFilename) {
      config = require(path.join(opts.localPath, configFilename));
      if (configKey) {
        config = config[configKey];
      }

      // Values in the config file take precedence
      _.merge(this.config, config);
    }

    opts.project = opts.project || this.config.global.project;
  }
}

module.exports = new BuildPacks(packs);
