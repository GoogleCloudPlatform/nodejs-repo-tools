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
const fs = require('fs-extra');
const path = require('path');

const BuildPack = require('./build_pack');
const utils = require('../utils');

const SETUP = `
1.  Read [Prerequisites][prereq] and [How to run a sample][run] first.
1.  Install dependencies:

        pip install -r requirements.txt

[prereq]: ../README.md#prerequisites
[run]: ../README.md#how-to-run-a-sample`;

const TESTS = `
1.  Set the **GCLOUD_PROJECT** and **GOOGLE_APPLICATION_CREDENTIALS** environment variables.

1.  Run the tests:

        nox`;

const pythonConfig = {
  display: 'Python',
  test: {
    app: {
      cmd: 'python',
      args: ['main.py'],
    },
    build: {},
    deploy: {},
    install: {
      cmd: 'pip',
      args: ['install', '-r', 'requirements.txt'],
    },
    run: {
      cmd: 'nox',
      args: [],
    },
  },
  generate: {
    gitignore: {
      description: '.gitignore',
      filename: '.gitignore',
    },
    lib_readme: {
      description: 'README.rst',
      filename: 'README.rst',
      lib_install_cmd: 'pip install {{name}}',
      quickstart_filename: 'samples/quickstart.py',
      getLibPkgName(buildPack) {
        return buildPack.config.client_name;
      },
    },
    lib_samples_readme: {
      description:
        'Generate a README.rst file for the samples/ folder of a client library.',
      filename: 'README.rst',
      validate(data) {
        if (!data.samples || !data.samples.length) {
          utils.logger.fatal(
            'generate',
            `In order to generate lib_samples_readme, config must contain a non-empty "samples" array!`
          );
        }
      },
    },
    samples_readme: {
      setup: SETUP,
      tests: TESTS,
    },
  },
};

/**
 * @class PythonBuildPack
 * @returns {PythonBuildPack} A new {@link PythonBuildPack} instance.
 */
module.exports = class PythonBuildPack extends BuildPack {
  constructor(config = {}, innerOpts = {}) {
    super(_.merge(pythonConfig, _.cloneDeep(config)), innerOpts);
  }

  static detect(cwd) {
    try {
      if (fs.statSync(path.join(cwd, 'requirements.txt')).isFile()) {
        return true;
      }
    } catch (err) {
      // Ignore error
    }
    try {
      if (fs.statSync(path.join(cwd, 'setup.py')).isFile()) {
        return true;
      }
    } catch (err) {
      // Ignore error
    }
  }
};
