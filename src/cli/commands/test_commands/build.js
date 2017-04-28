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

const globalDefaults = {
  async: false,
  builderProjectId: 'cloud-docs-samples',
  ci: process.env.CI,
  deploy: false,
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined,
  projectId: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT
};

const buildPackDefaults = {
  nodejs: {
    config: 'package.json',
    configKey: 'cloud-repo-tools',
    deployCmd: 'samples',
    deployArgs: ['test', 'deploy'],
    installCmd: 'samples',
    installArgs: ['test', 'install'],
    testCmd: 'samples',
    testArgs: ['test', 'app']
  },
  python: {
    config: 'cloud-repo-tools.json',
    configKey: null,
    deployCmd: 'samples',
    deployArgs: ['test', 'deploy'],
    installCmd: 'samples',
    installArgs: ['test', 'install'],
    testCmd: 'samples',
    testArgs: ['test', 'app']
  }
};

function detectBuildPack () {
  const args = process.argv;

  let buildPack, localPath;

  args.forEach((arg, i) => {
    if (arg === '--build-pack' || arg === '--buildPack' || arg === 'b') {
      if (args[i + 1] === 'nodejs') {
        buildPack = 'nodejs';
      } else if (args[i + 1] === 'python') {
        buildPack = 'python';
      }
    } else if (arg.startsWith('--build-pack=')) {
      buildPack = arg.replace('--build-pack=', '');
    } else if (arg.startsWith('--buildPack=')) {
      buildPack = arg.replace('--buildPack=', '');
    } else if (arg.startsWith('-b=')) {
      buildPack = arg.replace('-b=', '');
    } else if (arg === '--local-path' || arg === '--localPath' || arg === '-l') {
      localPath = args[i + 1];
    }
  });

  if (buildPack) {
    return { selected: true, buildPack };
  }

  if (localPath) {
    localPath = path.resolve(localPath);
  } else {
    localPath = process.cwd();
  }

  try {
    if (fs.statSync(path.join(localPath, 'package.json')).isFile()) {
      buildPack = 'nodejs';
    }
  } catch (err) {

  }

  try {
    if (fs.statSync(path.join(localPath, 'requirements.txt')).isFile()) {
      buildPack = 'python';
    }
  } catch (err) {

  }

  if (!buildPack) {
    error({ test: path.parse(localPath).base }, 'Unable to determine build pack.');
    process.exit(1);
  }

  process.argv.push(`--buildPack=${buildPack}`);

  return { selected: false, buildPack };
}

exports.command = 'build';
exports.description = 'Recursively kick off builds for detected projects.';

let options, defaults;

/**
 * This method sets up the commands options.
 */
exports.builder = (yargs) => {
  const { selected, buildPack } = detectBuildPack();

  defaults = { buildPack };
  Object.assign(defaults, globalDefaults);
  Object.assign(defaults, buildPackDefaults[buildPack]);

  options = {
    buildPack: {
      alias: 'b',
      description: `${selected ? 'Selected:'.bold : 'Detected:'.bold} ${`${defaults.buildPack}`.magenta}. The build pack to use.`,
      requiresArg: true,
      type: 'string'
    },
    async: {
      alias: 'a',
      description: `${'Default:'.bold} ${`${defaults.async}`.yellow}. Start the build, but don't wait for it to complete.`,
      type: 'boolean'
    },
    builderProjectId: {
      alias: 'bp',
      description: `${'Default:'.bold} ${`${defaults.builderProjectId}`.yellow}. The project in which the Cloud Container Build should execute.`,
      requiresArg: true,
      type: 'string'
    },
    ci: {
      description: `${'Default:'.bold} ${`${defaults.ci}`.yellow}. Whether this is a CI environment.`,
      type: 'boolean'
    },
    config: {
      alias: 'c',
      description: `${'Default:'.bold} ${`${defaults.config}`.yellow}. Specify a JSON config file to load. Options set in the config file supercede options set at the command line.`,
      requiresArg: true,
      type: 'string'
    },
    configKey: {
      description: `${'Default:'.bold} ${`${defaults.configKey}`.yellow}. Specify the key under which options are nested in the config file.`,
      requiresArg: true,
      type: 'string'
    },
    deploy: {
      alias: 'd',
      description: `${'Default:'.bold} ${`${defaults.deploy}`.yellow}. Whether to run the deploy command.`,
      type: 'boolean'
    },
    deployCmd: {
      description: `${'Default:'.bold} ${`${defaults.deployCmd}`.yellow}. The deploy command to use.`,
      requiresArg: true,
      type: 'string'
    },
    deployArgs: {
      description: `${'Default:'.bold} ${`${defaults.deployArgs.join(', ')}`.yellow}. The arguments to pass to the deploy command.`,
      requiresArg: true,
      type: 'array'
    },
    keyFile: {
      alias: 'k',
      desciption: `${'Default:'.bold} ${`${defaults.keyFile}`.yellow}. The path to the key to copy into the build.`,
      requiresArg: true,
      type: 'string'
    },
    projectId: {
      alias: 'p',
      description: `${'Default:'.bold} ${`${defaults.projectId}`.yellow}. The project ID to use ${'inside'.italic} the build.`,
      requiresArg: true,
      type: 'string'
    },
    testCmd: {
      description: `${'Default:'.bold} ${`${defaults.testCmd}`.yellow}. The test command to use.`,
      requiresArg: true,
      type: 'string'
    },
    testArgs: {
      description: `${'Default:'.bold} ${`${defaults.testArgs.join(', ')}`.yellow}. The arguments to pass to the test command.`,
      requiresArg: true,
      type: 'array'
    }
  };

  yargs.options(options);
};

exports.handler = (opts) => {
  opts.localPath = path.resolve(opts.localPath);
  const base = path.parse(opts.localPath).base;
  let configPath, topConfig = {}, config = {};

  for (let key in defaults) {
    if (opts[key] === undefined && defaults[key] !== undefined) {
      opts[key] = defaults[key];
    }
  }

  // Load the config file, if any
  if (opts.config && opts.config !== 'false') {
    configPath = path.join(opts.localPath, opts.config);
    try {
      topConfig = require(configPath) || {};
      if (opts.configKey) {
        config = topConfig[opts.configKey] || {};
      } else {
        config = topConfig;
      }
    } catch (err) {
      if (err.message.includes('Cannot find')) {
        error(base, `Could not locate ${configPath}`);
      } else if (err.message.includes('JSON')) {
        error(base, `Failed to parse ${configPath}`);
      }
      error(base, err.stack || err.message);
      process.exit(1);
    }
  }

  Object.assign(opts, config);
  opts.test = config.test || config.name || topConfig.name || base;
  opts.cwd = opts.localPath;
  opts.cloudbuildYamlPath = path.join(opts.localPath, 'cloudbuild.yaml');

  if (opts.dryRun) {
    log(opts, 'Beginning dry run...'.cyan);
  }

  if (opts.requiresKeyFile && !opts.keyFile) {
    error(opts, `Build target requires a key file but none was provided!`);
    process.exit(1);
  } else if (opts.requiresProjectId && !opts.projectId) {
    error(opts, `Build target requires a project ID but none was provided!`);
    process.exit(1);
  }

  log(opts, `Detected build target: ${(configPath || base).yellow}`);

  opts.repoPath = getRepoPath(config.repository || topConfig.repository) || 'UNKNOWN';
  if (opts.repoPath) {
    log(opts, `Detected repository: ${opts.repoPath.magenta}`);
  }
  opts.sha = getHeadCommitSha(opts.localPath) || 'UNKNOWN';
  if (opts.sha) {
    log(opts, `Detected SHA: ${opts.sha.magenta}`);
  }
  if (opts.ci) {
    log(opts, `Detected CI: ${`${opts.ci}`.magenta}`);
  }

  try {
    // Setup key file, if any
    if (opts.keyFile && opts.requiresKeyFile) {
      opts.keyFilePath = path.resolve(opts.keyFile);
      log(opts, `Copying: ${opts.keyFilePath.yellow}`);
      opts.keyFileName = path.parse(opts.keyFilePath).base;
      opts.copiedKeyFilePath = path.join(opts.localPath, path.parse(opts.keyFilePath).base);
      if (!opts.dryRun) {
        fs.copySync(opts.keyFilePath, path.join(opts.localPath, path.parse(opts.keyFilePath).base));
      }
    }
    // Setup project ID, if any
    if (opts.projectId) {
      log(opts, `Setting build project ID to: ${opts.projectId.yellow}`);
    }

    // Generate the cloudbuild.yaml file
    log(opts, `Compiling: ${opts.cloudbuildYamlPath.yellow}`);
    const template = handlebars.compile(fs.readFileSync(tpl, 'utf8'))(opts);
    if (!opts.dryRun) {
      log(opts, `Writing: ${opts.cloudbuildYamlPath.yellow}`);
      fs.writeFileSync(opts.cloudbuildYamlPath, template);
    } else {
      log(opts, `Printing: ${opts.cloudbuildYamlPath.yellow}\n${template}`);
    }

    // Start the build
    let buildCmd = `gcloud container builds submit . --config 'cloudbuild.yaml' --project '${opts.builderProjectId}'`;
    if (opts.async) {
      buildCmd += ' --async';
    } else {
      log(opts, `Will wait for build to complete.`);
    }
    log(opts, `Build command: ${buildCmd.yellow}`);
    if (!opts.dryRun) {
      try {
        execSync(buildCmd, {
          cwd: opts.localPath,
          stdio: 'inherit',
          timeout: 20 * 60 * 1000
        });
        // Remove temp files
        cleanup(opts);
      } catch (err) {
        // Remove temp files
        cleanup();
        process.exit(err.status);
      }
    }
  } catch (err) {
    error(opts, err);
    cleanup(opts);
    throw err;
  }

  if (opts.dryRun) {
    log(opts, 'Dry run complete.'.cyan);
  }
};

function cleanup (opts) {
  try {
    fs.unlinkSync(opts.cloudbuildYamlPath);
  } catch (err) {}
  try {
    fs.unlinkSync(opts.copiedKeyFilePath);
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
