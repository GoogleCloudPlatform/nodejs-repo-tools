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

const _ = require('lodash');
const path = require('path');
const utils = require('../utils');

const globalOpts = {
  global: {
    dryRun: false,
    localPath: process.cwd(),
    project: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
    config: '.cloud-repo-tools.json',
    configKey: null,
  },
  test: {
    app: {},
    build: {
      builderProject: 'cloud-docs-samples',
      ci: process.env.CI,
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      timeout: '20m',
    },
    deploy: {
      cmd: 'gcloud',
      yaml: 'app.yaml',
      tries: 1,
    },
    install: {},
    run: {},
  },
  generate: {
    all: {
      description: 'Generate all available targets.',
    },
    coc: {
      description: 'Generate a CODE_OF_CONDUCT.md file.',
      filename: 'CODE_OF_CONDUCT.md',
    },
    contributing: {
      description: 'Generate a .github/CONTRIBUTING.md file.',
      filename: '.github/CONTRIBUTING.md',
    },
    issue_template: {
      description: 'Generate a .github/ISSUE_TEMPLATE.md file.',
      filename: '.github/ISSUE_TEMPLATE.md',
    },
    license: {
      description: 'Generate a LICENSE file.',
      filename: 'LICENSE',
      data: {
        year: new Date().getFullYear(),
      },
    },
    lib_readme: {
      description: 'Generate a README.md file for a client library.',
      filename: 'README.md',
      getLibPkgName() {
        utils.logger.fatal(
          'generate',
          'getLibPkgName() must be implemented by a subclass!'
        );
      },
      validate(data) {
        if (!data.lib_install_cmd) {
          utils.logger.fatal(
            'generate',
            `In order to generate lib_readme, "lib_install_cmd" must be set!`
          );
        }
      },
    },
    lib_samples_readme: {
      description:
        'Generate a README.md file for the samples/ folder of a client library.',
      filename: 'README.md',
      validate(data) {
        if (!data.samples || !data.samples.length) {
          utils.logger.fatal(
            'generate',
            `In order to generate lib_samples_readme, config must contain a non-empty "samples" array!`
          );
        }
      },
    },
    pr_template: {
      description: 'Generate a .github/PULL_REQUEST_TEMPLATE.md file.',
      filename: '.github/PULL_REQUEST_TEMPLATE.md',
    },
    samples_readme: {
      description: 'Generate a generate samples README.md file.',
      filename: 'README.md',
      validate(data) {
        if (!data.samples || !data.samples.length) {
          utils.logger.fatal(
            'generate',
            `In order to generate samples_readme, config must contain a non-empty "samples" array!`
          );
        }
      },
    },
  },
};

/**
 * Base class for configuratin a build pack, which is a collection of default
 * config values to be used by the various Repo Tools commands.
 *
 * Specific programming languages can subclass {@link BuildPack} to customize
 * behavior for that language.
 *
 * @class BuildPack
 * @returns {BuildPack} A new {@link BuildPack} instance.
 */
module.exports = class BuildPack {
  constructor(config = {}, innerOpts = {}) {
    this.config = _.merge(globalOpts, config);
    delete innerOpts.config;
    _.merge(this, innerOpts);
  }

  detect() {
    throw new Error('detect() must be implemented by a subclass!');
  }

  expandConfig(opts) {
    opts.localPath = path.resolve(opts.localPath);
    opts.cwd = opts.localPath;
    const base = path.parse(opts.localPath).base;

    let config = {};
    let name, repository;
    const configFilename = opts.config || this.config.global.config;
    const configKey = opts.configKey || this.config.global.configKey;

    if (configFilename) {
      try {
        config = this.load(path.join(opts.localPath, configFilename), opts);
        name = config.name;
        repository = config.repository;
        if (configKey && configKey !== '_') {
          config = config[configKey] || {};
        }

        // Values in the config file take precedence
        _.merge(this.config, config);
      } catch (err) {
        // Ignore error
      }
    }

    opts.name = opts.name || config.name || name || base;
    opts.project = opts.project || this.config.global.project;
    opts.builderProject =
      opts.builderProject || this.config.test.build.builderProject;
    opts.repository = config.repository || repository;

    const args = process.argv.slice(2);

    args.forEach((arg, i) => {
      if (arg === '--') {
        opts.args = args.slice(i + 1);
        return false;
      }
    });
  }

  getLibInstallCmd() {
    throw new Error('getLibInstallCmd() must be implemented by a subclass!');
  }

  /**
   * By "requiring" the file, this method supports loading .json and .js files.
   * A .js file needs to export a function that returns the config object.
   *
   * TODO(jdobry): Augment this method to support loading .yaml and .xml files.
   *
   * @param {*} filename
   */
  load(filename) {
    const file = require(filename);
    if (typeof file === 'function') {
      return file(this.config);
    }
    return file;
  }
};
