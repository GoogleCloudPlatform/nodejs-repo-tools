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

'use strict';

var assert = require('assert');
var path = require('path');
var tools = require('../../../../../');
var translate = require('@google-cloud/translate')();

var cwd = path.join(__dirname, '..');
var cmd = 'node index.js';
var lang = 'ru';
var text = 'Hello, world!';

before(tools.checkCredentials);

describe('snippet', function () {
  it('should work', function () {
    return Promise.all([
      tools.runAsync(cmd, cwd),
      translate.translate(text, lang)
    ])
      .then(function (results) {
        var output = results[0];
        var translation = results[1][0];
        assert(output.includes('Text: ' + text));
        assert(output.includes('Translation: ' + translation));
      });
  });
});
