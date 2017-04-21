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

const { execSync } = require('child_process');
const fs = require('fs-extra');
const handlebars = require('handlebars');
const path = require('path');
const string = require('string');
const url = require('url');

const { error, log } = require('../../../api/utils');

handlebars.registerHelper('slugify', (str) => string(str).slugify().s);
handlebars.registerHelper('trim', (str) => string(str).trim().s);

const tpl = path.join(__dirname, '../../../templates/cloudbuild.yaml.tpl');

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
      builderProjectId: {
        alias: 'bp',
        default: 'cloud-docs-samples',
        requiresArg: true,
        type: 'string'
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
      }
    });
};

exports.handler = (opts) => {
  opts.localPath = path.resolve(opts.localPath);

  const tmpConfig = { test: path.parse(opts.localPath).base };

  // Load package.json file
  const pkgPath = path.join(opts.localPath, 'package.json');
  let pkg;
  try {
    pkg = require(pkgPath);
  } catch (err) {
    if (err.message.includes('Cannot find')) {
      error(tmpConfig, `Could not locate ${pkgPath}`);
    } else if (err.message.includes('JSON')) {
      error(tmpConfig, `Failed to parse ${pkgPath}`);
    }
    error(tmpConfig, err.stack || err.message);
    process.exit(1);
  }

  // Load alternate config file
  const configPath = path.join(opts.localPath, opts.config);
  let config;
  try {
    config = require(configPath) || {};
  } catch (err) {
    if (err.message.includes('Cannot find')) {
      error(tmpConfig, `Could not locate ${configPath}`);
    } else if (err.message.includes('JSON')) {
      error(tmpConfig, `Failed to parse ${configPath}`);
    }
    error(tmpConfig, err.stack || err.message);
    process.exit(1);
  }

  // Gather config settings
  if (pkg === config) {
    config = pkg[opts.configKey] || {};
  }
  config.test || (config.test = pkg.name);
  config.cwd = opts.localPath;
  config.installCmd || (config.installCmd = 'yarn');
  config.installArgs || (config.installArgs = ['install']);
  config.testCmd || (config.testCmd = 'yarn');
  config.testArgs || (config.testArgs = ['test']);
  config.cloudbuildYamlPath = path.join(opts.localPath, 'cloudbuild.yaml');

  if (opts.dryRun) {
    log(config, 'Beginning dry run...'.cyan);
  }

  if (config.requiresKeyFile && !opts.keyFile) {
    error(config, `Build target requires a key file but none was provided!`);
    process.exit(1);
  } else if (config.requiresProjectId && !opts.projectId) {
    error(config, `Build target requires a project ID but none was provided!`);
    process.exit(1);
  }

  log(config, `Detected build target: ${configPath.yellow}`);

  config.repoPath = getRepoPath(pkg.repository) || 'UNKNOWN';
  if (config.repoPath) {
    log(config, `Detected repository: ${config.repoPath.magenta}`);
  }
  config.sha = getHeadCommitSha(config.cwd) || 'UNKNOWN';
  if (config.sha) {
    log(config, `Detected SHA: ${config.sha.magenta}`);
  }
  config.ci = process.env.CI || 'false';
  if (config.ci) {
    log(config, `Detected CI: ${config.ci.magenta}`);
  }

  try {
    // Setup key file, if any
    if (opts.keyFile && config.requiresKeyFile) {
      config.keyFilePath = path.resolve(opts.keyFile);
      log(config, `Copying: ${config.keyFilePath.yellow}`);
      config.keyFileName = path.parse(config.keyFilePath).base;
      config.copiedKeyFilePath = path.join(opts.localPath, path.parse(config.keyFilePath).base);
      if (!opts.dryRun) {
        fs.copySync(config.keyFilePath, path.join(opts.localPath, path.parse(config.keyFilePath).base));
      }
    }
    // Setup project ID, if any
    if (opts.projectId) {
      config.projectId = opts.projectId;
      log(config, `Setting build project ID to: ${config.projectId.yellow}`);
    }

    // Generate the cloudbuild.yaml file
    log(config, `Compiling: ${config.cloudbuildYamlPath.yellow}`);
    const template = handlebars.compile(fs.readFileSync(tpl, 'utf8'))(config);
    if (!opts.dryRun) {
      log(config, `Writing: ${config.cloudbuildYamlPath.yellow}`);
      fs.writeFileSync(config.cloudbuildYamlPath, template);
    } else {
      log(config, `Printing: ${config.cloudbuildYamlPath.yellow}\n${template}`);
    }

    // Start the build
    let buildCmd = `gcloud container builds submit . --config 'cloudbuild.yaml' --project '${opts.builderProjectId}'`;
    if (opts.async) {
      buildCmd += ' --async';
    } else {
      log(config, `Will wait for build to complete.`);
    }
    log(config, `Build command: ${buildCmd.yellow}`);
    if (!opts.dryRun) {
      try {
        execSync(buildCmd, {
          cwd: opts.localPath,
          timeout: 20 * 60 * 1000
        });
        // Remove temp files
        cleanup(opts, config);
      } catch (err) {
        // Remove temp files
        cleanup(opts, config);
        process.exit(err.status);
      }
    }
  } catch (err) {
    error(config, err);
    cleanup(opts, config);
    throw err;
  }

  if (opts.dryRun) {
    log(config, 'Dry run complete.'.cyan);
  }
};

function cleanup (opts, config) {
  try {
    fs.unlinkSync(config.cloudbuildYamlPath);
  } catch (err) {}
  try {
    fs.unlinkSync(config.copiedKeyFilePath);
  } catch (err) {}
}

// function getDirs (_path, currentDepth, maxDepth) {
//   if (!currentDepth) {
//     currentDepth = 0;
//   }
//   if (!maxDepth) {
//     maxDepth = 10;
//   }

//   const dirs = fs.readdirSync(_path)
//     .filter((name) => !name.includes('.'))
//     .filter((name) => !name.includes('node_modules'))
//     .filter((name) => !name.includes('bower_components'))
//     .map((name) => path.join(_path, name))
//     .filter((name) => fs.statSync(name).isDirectory());

//   if (!dirs.length) {
//     return [_path];
//   } else if (currentDepth === maxDepth) {
//     return dirs;
//   }

//   return dirs.reduce((cur, name) => cur.concat(getDirs(name, currentDepth + 1, maxDepth)), []);
// }

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

function getHeadCommitSha (cwd) {
  if (process.env.CIRCLE_SHA1) {
    return process.env.CIRCLE_SHA1;
  }
  const stdout = execSync('git log -n 1 --pretty=format:"%H"', {
    cwd,
    stdout: 'ignore',
    timeout: 20 * 60 * 1000
  });
  return stdout.toString().trim();
}
