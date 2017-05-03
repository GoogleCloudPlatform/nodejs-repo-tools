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
const parser = require('yargs-parser');
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

    const argv = parser(args);

    buildPack = argv.buildPack || argv.b;
    localPath = argv.localPath || argv.l;

    if (localPath) {
      localPath = path.resolve(localPath);
    } else {
      localPath = process.cwd();
      const index = process.argv.indexOf('--');
      if (index >= 0) {
        process.argv.splice(index, 0, `--local-path=${localPath}`);
      } else {
        process.argv.push(`--local-path=${localPath}`);
      }
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
        if (pack === 'global') {
          return;
        }
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
        const index = process.argv.indexOf('--');
        if (index >= 0) {
          process.argv.splice(index, 0, `--build-pack=${buildPack}`);
        } else {
          process.argv.push(`--build-pack=${buildPack}`);
        }

        this.selected = false;
        this.current = buildPack;
      }
    }

    this.config = {};
    _.merge(this.config, this.global);

    if (buildPack) {
      _.merge(this.config, this[buildPack]);
    }
  }

  expandConfig (opts) {
    opts.localPath = path.resolve(opts.localPath);
    opts.cwd = opts.localPath;
    const base = path.parse(opts.localPath).base;

    let config = {};
    let name, repository;
    const configFilename = opts.config || this.config.global.config;
    const configKey = opts.configKey || this.config.global.configKey;

    if (configFilename) {
      try {
        config = this[this.current].load(path.join(opts.localPath, configFilename));
        name = config.name;
        repository = config.repository;
        if (configKey) {
          config = config[configKey] || {};
        }

        // Values in the config file take precedence
        _.merge(this.config, config);
      } catch (err) {
        // TODO: Print something here?
      }
    }

    opts.name = opts.name || config.name || name || base;
    opts.project = opts.project || this.config.global.project;
    opts.builderProject = opts.builderProject || this.config.test.build.builderProject;
    opts.repository = config.repository || repository;

    const args = process.argv.slice(2);

    args.forEach((arg, i) => {
      if (arg === '--') {
        opts.args = args.slice(i + 1);
        return false;
      }
    });
  }
}

module.exports = new BuildPacks(packs);
