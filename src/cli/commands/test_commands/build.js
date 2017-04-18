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

const fs = require('fs');
const got = require('got');
const handlebars = require('handlebars');
const path = require('path');
const string = require('string');
const url = require('url');

handlebars.registerHelper('slugify', (str) => string(str).slugify().s);
handlebars.registerHelper('trim', (str) => string(str).trim().s);

const tpl = path.join(__dirname, '../../../templates/cloudbuild.yaml.tpl');

require('shelljs/global');

exports.command = 'build';
exports.description = 'Recursively kick off builds for detected projects.';

exports.builder = (yargs) => {
  yargs
    .options({
      async: {
        alias: 'a',
        default: false,
        type: 'boolean'
      },
      changesOnly: {
        alias: 'ch',
        default: false,
        type: 'boolean'
      },
      config: {
        alias: 'c',
        default: 'package.json',
        requiresArg: true,
        type: 'string'
      },
      configKey: {
        alias: 'ck',
        default: 'cloud',
        requiresArg: true,
        type: 'string'
      },
      dryRun: {
        alias: 'd',
        default: false,
        type: 'boolean'
      },
      keyFile: {
        alias: 'k',
        default: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        requiresArg: true,
        type: 'string'
      },
      projectId: {
        alias: 'p',
        default: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
        requiresArg: true,
        type: 'string'
      },
      recurse: {
        alias: 'r',
        default: false,
        type: 'boolean'
      },
      silent: {
        alias: 's',
        default: false,
        type: 'boolean'
      }
    });
};

exports.handler = (opts) => {
  // Load package.json file
  const pkgPath = path.join(opts.localPath, 'package.json');
  let pkg;
  try {
    pkg = require(pkgPath);
  } catch (err) {
    if (err.message.includes('Cannot find')) {
      console.error(`ERROR: Could not locate ${pkgPath}`.red);
    } else if (err.message.includes('JSON')) {
      console.error(`ERROR: Failed to parse ${pkgPath}`.red);
    }
    console.error(`ERROR: ${err.stack || err.message}`.red);
    process.exit(1);
  }

  // Load alternate config file
  const configPath = path.join(opts.localPath, opts.config);
  let config;
  try {
    config = require(configPath) || {};
  } catch (err) {
    if (err.message.includes('Cannot find')) {
      console.error(`ERROR: Could not locate ${configPath}`.red);
    } else if (err.message.includes('JSON')) {
      console.error(`ERROR: Failed to parse ${configPath}`.red);
    }
    console.error(`ERROR: ${err.stack || err.message}`.red);
    process.exit(1);
  }

  // Gather config settings
  if (pkg === config) {
    config = pkg[opts.configKey] || {};
  }
  config.test || (config.test = pkg.name);
  config.cwd = opts.localPath;
  config.installCmd || (config.installCmd = 'yarn');
  config.testCmd || (config.testCmd = 'yarn');
  config.cloudbuildYamlPath = path.join(opts.localPath, 'cloudbuild.yaml');

  if (config.requiresKeyFile && !opts.keyFile) {
    console.error(`ERROR: Build target requires a key file but none was provided!`.red);
    process.exit(1);
  } else if (config.requiresProjectId && !opts.projectId) {
    console.error(`ERROR: Build target requires a project ID but none was provided!`.red);
    process.exit(1);
  }

  console.log(`${config.test.bold}: Found build target.`);

  config.repoPath = getRepoPath(pkg.repository) || 'UNKNOWN';
  if (config.repoPath) {
    console.log(`${config.test.bold}: Repository: ${config.repoPath}`);
  }
  config.sha = getHeadCommitSha() || 'UNKNOWN';
  if (config.sha) {
    console.log(`${config.test.bold}: SHA: ${config.sha}`);
  }
  config.ci = process.env.CI || 'false';
  if (config.ci) {
    console.log(`${config.test.bold}: CI: ${config.ci}`);
  }

  if (!opts.dryRun) {
    try {
      // Setup key file, if any
      if (opts.keyFile && config.requiresKeyFile) {
        config.keyFilePath = path.resolve(opts.keyFile);
        console.log(`${config.test.bold}: Copying ${config.keyFilePath.yellow}`);
        config.keyFileName = path.parse(config.keyFilePath).base;
        cp(config.keyFilePath, path.join(opts.localPath, path.parse(config.keyFilePath).base));
      }
      // Setup project ID, if any
      if (opts.projectId) {
        config.projectId = opts.projectId;
        console.log(`${config.test.bold}: Setting build project ID to ${config.projectId.yellow}`);
      }

      // Generate the cloudbuild.yaml file
      const template = handlebars.compile(fs.readFileSync(tpl, 'utf8'));
      console.log(`${config.test.bold}: Writing ${config.cloudbuildYamlPath.yellow}`);
      fs.writeFileSync(config.cloudbuildYamlPath, template(config));

      // Start the build
      let buildCmd = 'gcloud container builds submit . --config=cloudbuild.yaml';
      if (opts.async) {
        buildCmd += ' --async';
      }
      console.log(`${config.test.bold}: Build cmd: ${buildCmd.yellow}`);
      const result = exec(buildCmd, {
        cwd: opts.localPath,
        silent: opts.silent
      });

      // Remove temp files
      cleanup(opts, config);
    } catch (err) {
      console.error(err);
      cleanup(opts, config);
      throw err;
    }
  }
};

function cleanup (opts, config) {
  try {
    fs.unlinkSync(config.cloudbuildYamlPath);
  } catch (err) {}
  try {
    fs.unlinkSync(config.keyFilePath);
  } catch (err) {}
}

function getDirs (_path, currentDepth, maxDepth) {
  if (!currentDepth) {
    currentDepth = 0;
  }
  if (!maxDepth) {
    maxDepth = 10;
  }

  const dirs = fs.readdirSync(_path)
    .filter((name) => !name.includes('.'))
    .filter((name) => !name.includes('node_modules'))
    .filter((name) => !name.includes('bower_components'))
    .map((name) => path.join(_path, name))
    .filter((name) => fs.statSync(name).isDirectory());

  if (!dirs.length) {
    return [_path];
  } else if (currentDepth === maxDepth) {
    return dirs;
  }

  return dirs.reduce((cur, name) => cur.concat(getDirs(name, currentDepth + 1, maxDepth)), []);
}

function getRepoPath (repository) {
  repository || (repository = {});
  if (typeof repository === 'string') {
    repository = {
      url: repository
    };
  }

  if (!repository.url) {
    throw new Error('Missing repository!');
  }

  return url.parse(repository.url).path.replace('.git', '');
}

function getHeadCommitSha () {
  return process.env.CIRCLE_SHA1 || exec('git log -n 1 --pretty=format:"%H"', { silent: true }).stdout.toString().trim();
}
