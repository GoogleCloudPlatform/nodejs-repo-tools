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

require('colors');

const fs = require('fs');
const path = require('path');

exports.command = 'unify';
exports.description =
  '(Node.js only) Recursively add sub-directory dependencies to the top-level package.json file.';

exports.builder = yargs => {
  yargs.options({
    localPath: {
      alias: 'l',
      default: process.cwd(),
      requiresArg: true,
      type: 'string',
    },
  });
};

exports.handler = opts => {
  // Dedupe package.json dependencies
  // WARNING: This will fail if two different versions of the same package are required.
  const pkgSet = {};

  function getDeps(directory, depth) {
    // Limit recursion depth
    if (depth < 0) {
      return;
    }

    // Skip module directories
    if (directory.includes('/.') || directory.includes('node_modules')) {
      return;
    }

    // Get subdirectories
    const dirs = fs.readdirSync(directory);

    // Record subdirectories that contain a package.json file
    let pkgJson;
    const pkgJsonDirs = dirs.filter(dir =>
      fs.existsSync(path.join(directory, dir, `package.json`))
    );
    pkgJsonDirs.forEach(dir => {
      pkgJson = JSON.parse(
        fs.readFileSync(path.join(directory, dir, `package.json`))
      );
      Object.assign(pkgSet, pkgJson.dependencies);
    });

    // Recurse
    const recurseDirs = dirs.filter(dir => {
      return fs.statSync(path.join(directory, dir)).isDirectory();
    });
    recurseDirs.forEach(dir => {
      getDeps(path.join(directory, dir), depth - 1);
    });
  }

  getDeps(opts.localPath, 3);

  // Update root-level package.json (by shelling to npm)
  const spawn = require('child_process').spawn;
  const args = [`add`, `-D`].concat(
    Object.keys(pkgSet).map(pkg => `${pkg}@${pkgSet[pkg]}`)
  );
  spawn(`yarn`, args, {
    cwd: opts.localPath,
    shell: true,
    stdio: ['ignore', process.stdout, process.stderr],
  });
};
