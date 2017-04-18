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

exports.command = 'validate';
exports.description = 'Validate the samples.json file in the current directory.';

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
  fs.stat(opts.filename, (err) => {
    if (err) {
      console.log((opts.filename + ' does not exist!').red);
      return;
    }

    console.log('Not yet implemented.'.red);
  });
};
