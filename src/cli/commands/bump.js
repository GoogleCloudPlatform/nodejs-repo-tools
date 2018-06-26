/**
 * Copyright 2018, Google, Inc.
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

require('colors');
const fs = require('fs');
const path = require('path');
const semver = require('semver');

const buildPack = require('../../build_packs').getBuildPack();
const utils = require('../../utils');

const CLI_CMD = 'bump';
const COMMAND = `tools ${CLI_CMD} ${'<rev>'.yellow}`;
const DESCRIPTION = `Bumps the specified semver value in both the main package and dependent packages (e.g. samples). ${
  'rev'.yellow.bold
} can be one of ${'major'.green.bold}, ${'minor'.green.bold}, or ${
  'patch'.green.bold
}.`;
const USAGE = `Usage:
  ${COMMAND.bold}
Description:
  ${DESCRIPTION}
Positional arguments:
  ${'<rev>'.bold}
    The semver version to increase.`;

exports.command = `${CLI_CMD} <rev>`;
exports.description = DESCRIPTION;
exports.builder = yargs => {
  yargs.usage(USAGE);
};
exports.handler = opts => {
  try {
    if (opts.dryRun) {
      utils.logger.log(CLI_CMD, 'Beginning dry run.'.cyan);
    }

    if (!opts.rev) {
      throw new Error(
        `For argument "rev" expected one of "major", "minor", or "patch".`
      );
    } else if (!opts.rev.match(/^major|minor|patch$/)) {
      throw new Error(
        `For argument "rev" expected one of "major", "minor", or "patch".`
      );
    }

    buildPack.expandConfig(opts);

    let oldVersion = buildPack.config.pkgjson.version;
    let name = buildPack.config.pkgjson.name;
    let newVersion = semver.inc(oldVersion, opts.rev);

    utils.logger.log(
      CLI_CMD,
      `Version will be bumped from ${oldVersion.yellow} to ${
        newVersion.yellow
      }.`
    );

    let samplesPackageJson;
    let samplesPackageJsonPath = path.join(
      buildPack.config.global.localPath,
      'samples',
      'package.json'
    );
    if (fs.existsSync(samplesPackageJsonPath)) {
      try {
        samplesPackageJson = JSON.parse(
          fs.readFileSync(samplesPackageJsonPath)
        );
      } catch (err) {
        throw new Error(
          `Cannot parse samples package.json located at ${samplesPackageJsonPath}: ${err.toString()}`
        );
      }
    }

    utils.logger.log(
      CLI_CMD,
      `Version in ${'package.json'.yellow} will be set to ${newVersion.yellow}.`
    );
    if (samplesPackageJson !== undefined) {
      let dependency = `'${name}': '${newVersion}'`;
      utils.logger.log(
        CLI_CMD,
        `${'samples/package.json'.yellow} will depend on ${dependency.yellow}.`
      );
    }

    if (opts.dryRun) {
      utils.logger.log(CLI_CMD, 'Dry run complete.'.cyan);
      return;
    }

    buildPack.config.pkgjson['version'] = newVersion;
    let packageJsonPath = path.join(opts.localPath, 'package.json');

    try {
      fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(buildPack.config.pkgjson, null, '  ') + '\n'
      );
    } catch (err) {
      throw new Error(`Cannot write ${packageJsonPath}: ${err.toString()}`);
    }

    if (samplesPackageJson !== undefined) {
      if (samplesPackageJson['dependencies'] === undefined) {
        samplesPackageJson['dependencies'] = {};
      }
      samplesPackageJson['dependencies'][name] = newVersion;
      try {
        fs.writeFileSync(
          samplesPackageJsonPath,
          JSON.stringify(samplesPackageJson, null, '  ') + '\n'
        );
      } catch (err) {
        throw new Error(
          `Cannot write ${samplesPackageJsonPath}: ${err.toString()}`
        );
      }
    }
    let message = `Files updated. Please regenerate package lock files and commit them:
      ${'rm -f package-lock.json && npm install && npm link'.yellow}
      ${'git add package.json package-lock.json'.yellow}`;
    if (samplesPackageJson !== undefined) {
      message += `
      ${
        'cd samples && rm -f package-lock.json && npm link ../ && npm install && cd ..'
          .yellow
      }
      ${'git add samples/package.json samples/package-lock.json'.yellow}`;
    }
    message += `
      ${'git commit -m "chore: bump version to'.yellow} ${newVersion.yellow}${
      '"'.yellow
    }`;
    utils.logger.log('bump', message);
  } catch (err) {
    utils.logger.error(CLI_CMD, err.toString());
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
};
