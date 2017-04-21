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

const execSync = require('child_process').execSync;
const fs = require('fs-extra');
const handlebars = require('handlebars');
const path = require('path');
const string = require('string');
const utils = require('../../api/utils');

handlebars.registerHelper('slugify', (str) => string(str).slugify().s);
handlebars.registerHelper('trim', (str) => string(str).trim().s);

const tpl = path.join(__dirname, '../templates/readme.tpl');

function fillInMissing (samples) {
  samples.samples || (samples.samples = []);
}

function gatherHelpText (filename, samples) {
  var dir = path.parse(filename).dir;
  samples.samples.forEach((sample) => {
    if (typeof sample.usage === 'string') {
      sample.usage = {
        cmd: sample.usage,
        text: sample.usage
      };
    }
    if (!sample.help && sample.usage && typeof sample.usage.cmd === 'string') {
      sample.help = execSync(sample.usage.cmd, {
        cwd: dir
      });
    }
  });
}

function parse (filename, cb) {
  fs.stat(filename, (err) => {
    if (err) {
      cb(new Error(filename + ' does not exist!'));
      return;
    }

    fs.readJson(filename, (err, samples) => {
      if (err) {
        cb(err);
        return;
      }

      fillInMissing(samples);
      gatherHelpText(filename, samples);

      cb(null, samples);
    });
  });
}

exports.command = 'generate';
exports.description = 'Generate a README.md file in the current directory.';

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
  const dir = path.parse(opts.filename).dir;

  parse(opts.filename, (err, json) => {
    if (err) {
      console.log(err.message.red);
      return;
    }

    Object.keys(utils.products[json.id]).forEach((field) => {
      json[field] = utils.products[json.id][field];
    });

    const template = handlebars.compile(fs.readFileSync(tpl, 'utf-8'));
    const readmePath = path.join(dir, 'README.md');

    fs.writeFile(readmePath, template(json), (err) => {
      if (err) {
        console.log('Failed to generated README.md'.red);
        return;
      }

      console.log(('Generated ' + readmePath).green);
    });
  });
};
