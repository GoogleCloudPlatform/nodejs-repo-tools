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

const fs = require('fs-extra');
const path = require('path');

exports.command = 'init';
exports.description = 'Create a new samples.json file in the current directory.';

exports.builder = (yargs) => {
  yargs
    .options({
      filename: {
        alias: 'f',
        default: path.join(process.cwd(), 'samples.json'),
        type: 'string'
      }
    });
};

exports.handler = (opts) => {
  fs.stat(opts.filename, function (err) {
    if (!err || err.code !== 'ENOENT') {
      console.log((opts.filename + ' already exists!').red);
      return;
    }

    fs.writeJson(opts.filename, {
      foo: 'bar'
    }, (err) => {
      if (err) {
        console.error(err.message.red);
        return;
      }

      console.log(('Created ' + opts.filename).green);
    });
  });
};
