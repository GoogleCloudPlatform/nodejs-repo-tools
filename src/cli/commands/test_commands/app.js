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

const { app } = require('../../../api/testRunner');
const { error } = require('../../../api/utils');
const path = require('path');

exports.command = 'app';
exports.description = 'Start an app and send it a GET request.';

exports.builder = (yargs) => {
  yargs
    .options({
      config: {
        alias: 'c',
        default: path.join(process.cwd(), 'package.json'),
        requiresArg: true,
        type: 'string'
      },
      'config-key': {
        alias: 'k',
        default: 'cloud',
        requiresArg: true,
        type: 'string'
      },
      msg: {
        alias: 'm',
        default: null,
        requiresArg: true,
        type: 'string'
      },
      'required-env-vars': {
        alias: 'rev',
        default: null,
        requiresArg: true,
        type: 'string'
      },
      'start-cmd': {
        alias: 'sc',
        default: 'node',
        requiresArg: true,
        type: 'string'
      },
      'start-args': {
        alias: 'sa',
        default: ['app.js'],
        requiresArg: true,
        type: 'array'
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
  config.msg = opts.msg || config.msg;
  config.requiredEnvVars = opts.requiredEnvVars || config.requiredEnvVars || [];
  if (config.requiredEnvVars && typeof config.requiredEnvVars === 'string') {
    config.requiredEnvVars = config.requiredEnvVars.split(',');
  }
  config.requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      error(config, `You must set the ${envVar} environment variable!`);
      process.exit(1);
    }
  });
  config.startCmd || (config.startCmd = opts.startCmd);
  config.startArgs || (config.startArgs = opts.startArgs);

  return app(config)
    .catch((err) => {
      error(config, err.stack || err.message);
    });
};
