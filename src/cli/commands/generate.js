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

const buildPacks = require('../../build_packs');
const products = require('../../utils/products');
const utils = require('../../utils');

handlebars.registerHelper('slugify', (str) => string(str).slugify().s);
handlebars.registerHelper('trim', (str) => string(str).trim().s);

const tpl = path.join(__dirname, '../../templates/readme.tpl');

function fillInMissing (samples) {
  samples.samples || (samples.samples = []);
}

function gatherHelpText (opts, buildPacks) {
  buildPacks.config.samples.forEach((sample) => {
    if (typeof sample.usage === 'string') {
      sample.usage = {
        cmd: sample.usage,
        text: sample.usage
      };
    }
    if (!sample.help && sample.usage && typeof sample.usage.cmd === 'string') {
      try {
        sample.help = execSync(sample.usage.cmd, {
          cwd: opts.localPath
        }).toString().trim();
      } catch (err) {
        utils.error('generate', err.message);
        process.exit(err.status);
      }
    }
  });
}

function expandOpts (opts, buildPacks) {
  fillInMissing(opts, buildPacks);
  gatherHelpText(opts, buildPacks);
}

const COMMAND = `samples generate ${'[options]'.yellow}`;
const DESCRIPTION = `Generate a README in ${buildPacks.cwd.yellow}.`;
const USAGE = `Usage:
  ${COMMAND.bold}
Description:
  ${DESCRIPTION}`;

exports.command = 'generate';
exports.description = DESCRIPTION;

exports.builder = (yargs) => {
  yargs
    .usage(USAGE);
};

exports.handler = (opts) => {
  if (opts.dryRun) {
    utils.log('generate', 'Beginning dry run.'.cyan);
  }

  buildPacks.expandConfig(opts);

  utils.log('generate', `Generating README in: ${opts.localPath.yellow}`);

  expandOpts(opts, buildPacks);
  opts.repoPath = utils.getRepoPath(opts.repository, opts.localPath) || null;
  buildPacks.config.badgeUri = path.join('cloud-docs-samples-badges', opts.repoPath, opts.name);

  Object.keys(products[buildPacks.config.product]).forEach((field) => {
    buildPacks.config[field] = products[buildPacks.config.product][field];
  });

  const readmePath = path.join(opts.localPath, 'README.md');
  utils.log('generate', 'Compiling:', readmePath.yellow);

  const readme = handlebars.compile(fs.readFileSync(tpl, 'utf-8'))(buildPacks.config);

  if (opts.dryRun) {
    utils.log('generate', `Printing: ${readmePath.yellow}\n${readme}`);
    return;
  }

  fs.writeFile(readmePath, readme, (err) => {
    if (err) {
      utils.error('generate', err.stack || err.message);
      process.exit(1);
    }

    utils.log('generate', `Generated: ${readmePath}`.green);
  });
};
