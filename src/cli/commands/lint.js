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

const path = require('path');
const standard = require('semistandard');

const {
  error,
  log
} = require('../../api/utils');

exports.command = 'lint [files..]';
exports.description = 'Lint samples.';

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
  const pkg = require(path.join(opts.localPath, 'package.json'));
  let config = require(opts.config) || {};

  if (pkg === config) {
    config = pkg[opts.configKey] || {};
  }

  config.test || (config.test = pkg.name);
  config.cwd = opts.localPath;
  config.dryRun = opts.dryRun;

  log(config, 'Linting files in:', config.cwd.yellow);

  const options = {
    cwd: config.cwd
  };

  standard.lintFiles(opts.files, options, (err, results) => {
    if (err) {
      error(config, err.stack || err.message);
      process.exit(1);
    } else if (results && results.errorCount) {
      let errMessage = 'Use JavaScript Semi-Standard Style (https://github.com/Flet/semistandard)\n';
      results.results.forEach((result) => {
        result.messages.forEach((message) => {
          errMessage += '  ';
          errMessage += result.filePath;
          errMessage += ':';
          errMessage += message.line;
          errMessage += ':';
          errMessage += message.column;
          errMessage += ' ';
          errMessage += message.message;
          errMessage += '\n';
        });
      });
      error(config, errMessage);
      process.exit(1);
    }

    log(config, 'Done linting.'.green);
  });
};
