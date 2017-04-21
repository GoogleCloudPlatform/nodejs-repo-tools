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

const { install } = require('../../../api/testRunner');
const { error } = require('../../../api/utils');
const path = require('path');

exports.command = 'install';
exports.description = `Install an application's dependencies.`;

exports.builder = (yargs) => {
  yargs
    .options({
      config: {
        alias: 'c',
        default: path.join(process.cwd(), 'package.json'),
        requiresArg: true,
        type: 'string'
      },
      configKey: {
        alias: 'k',
        default: 'cloud',
        requiresArg: true,
        type: 'string'
      }
    });
};

exports.handler = (opts) => {
  opts.localPath = path.resolve(opts.localPath);
  const pkg = require(path.join(opts.localPath, 'package.json'));
  let config = require(opts.config) || {};

  if (pkg === config) {
    config = pkg[opts.configKey] || {};
  }

  config.test || (config.test = pkg.name);
  config.cwd = opts.localPath;
  config.dryRun = opts.dryRun;

  return install(config)
    .catch((err) => {
      error(config, err.stack || err.message);
    });
};
