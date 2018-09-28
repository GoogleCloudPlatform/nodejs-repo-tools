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

const buildPack = require('../build_packs').getBuildPack();

module.exports = {
  config: {
    description: `${'Default:'.bold} ${
      `${buildPack.config.global.config}`.yellow
    }. Specify a .json or .js config file to load. Options set in the config file supercede options set at the command line. A .js file must export a function which returns a config object.`,
    requiresArg: true,
    type: 'string',
  },
  'config-key': {
    description: `${'Default:'.bold} ${
      `${buildPack.config.global.configKey}`.yellow
    }. Specify the key under which options are nested in the config file.`,
    requiresArg: true,
    type: 'string',
  },
};
