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

const childProcess = require('child_process');
const fs = require('fs-extra');
const handlebars = require('handlebars');
const path = require('path');
const string = require('string');

const buildPacks = require('../../../build_packs');
const utils = require('../../../utils');

handlebars.registerHelper('slugify', (str) => string(str).slugify().s);
handlebars.registerHelper('trim', (str) => string(str).trim().s);

const tpl = path.join(__dirname, '../../../templates/cloudbuild.yaml.tpl');

const COMMAND = `samples test build ${'[options]'.yellow}`;
const DESCRIPTION = `Launch a Cloud Container build.`;
const USAGE = `Usage:
  ${COMMAND.bold}
Description:
  ${DESCRIPTION}

  By default the build will install dependencies and run the system/unit tests.
  Passing ${'--app'.bold} will cause the build to also run the web app tests.
  Passing ${'--deploy'.bold} will cause the build to also run the web app
  deployment test.

  Pass ${'--dry-run'.bold} to see what the cloudbuild.yaml file will look like.`;

exports.command = 'build';
exports.description = DESCRIPTION;
exports.builder = (yargs) => {
  yargs
    .usage(USAGE)
    .options({
      run: {
        default: true,
        description: `${'Default:'.bold} ${`true`.yellow}. Whether to run the system/unit test command.`,
        type: 'boolean'
      },
      app: {
        description: `${'Default:'.bold} ${`false`.yellow}. Whether to run the web app test command.`,
        type: 'boolean'
      },
      deploy: {
        description: `${'Default:'.bold} ${`false`.yellow}. Whether to run the deploy command.`,
        type: 'boolean'
      },
      'builder-project': {
        alias: 'bp',
        description: `${'Default:'.bold} ${`${buildPacks.config.test.build.builderProject}`.yellow}. The project in which the Cloud Container Build should execute.`,
        requiresArg: true,
        type: 'string'
      },
      'project': {
        alias: 'p',
        description: `${'Default:'.bold} ${`${buildPacks.config.global.project}`.yellow}. The project ID to use ${'inside'.italic} the build.`,
        requiresArg: true,
        type: 'string'
      },
      'key-file': {
        alias: 'k',
        description: `${'Default:'.bold} ${`${buildPacks.config.test.build.keyFile}`.yellow}. The path to the key to copy into the build.`,
        requiresArg: true,
        type: 'string'
      },
      config: {
        description: `${'Default:'.bold} ${`${buildPacks.config.global.config}`.yellow}. Specify a JSON config file to load. Options set in the config file supercede options set at the command line.`,
        requiresArg: true,
        type: 'string'
      },
      'config-key': {
        description: `${'Default:'.bold} ${`${buildPacks.config.global.configKey}`.yellow}. Specify the key under which options are nested in the config file.`,
        requiresArg: true,
        type: 'string'
      },
      async: {
        alias: 'a',
        description: `${'Default:'.bold} ${`${buildPacks.config.test.build.async}`.yellow}. Start the build, but don't wait for it to complete.`,
        type: 'boolean'
      },
      ci: {
        description: `${'Default:'.bold} ${`${buildPacks.config.test.build.ci || false}`.yellow}. Whether this is a CI environment.`,
        type: 'boolean'
      },
      timeout: {
        description: `${'Default:'.bold} ${`${buildPacks.config.test.build.timeout}`.yellow}. The maximum time allowed for the build.`,
        requiresArg: true,
        type: 'string'
      },
      'install-cmd': {
        description: `${'Default:'.bold} ${`${buildPacks.config.test.install.cmd}`.yellow}. The install command to use.`,
        requiresArg: true,
        type: 'string'
      },
      'install-args': {
        description: `${'Default:'.bold} ${`${buildPacks.config.test.install.args.join(' ')}`.yellow}. The arguments to pass to the install command.`,
        requiresArg: true,
        type: 'string'
      },
      // TODO: Copy env vars into build?
      'start-cmd': {
        description: `${'Default:'.bold} ${`${buildPacks.config.test.app.cmd}`.yellow}. The command the web app test will use to start the app.`,
        requiresArg: true,
        type: 'string'
      },
      'start-args': {
        description: `${'Default:'.bold} ${`${buildPacks.config.test.app.args.join(' ')}`.yellow}. The arguments to pass to the command used by the web app test.`,
        requiresArg: true,
        type: 'string'
      },
      'test-cmd': {
        description: `${'Default:'.bold} ${`${buildPacks.config.test.run.cmd}`.yellow}. The system/unit test command to use.`,
        requiresArg: true,
        type: 'string'
      },
      'test-args': {
        description: `${'Default:'.bold} ${`${buildPacks.config.test.run.args.join(' ')}`.yellow}. The arguments to pass to the system/unit test command.`,
        requiresArg: true,
        type: 'string'
      }
    })
    .example('samples test build -l=~/nodejs-docs-samples/appengine/cloudsql --app --deploy');
};

exports.handler = (opts) => {
  if (opts.dryRun) {
    utils.log('build', 'Beginning dry run...'.cyan);
  }

  buildPacks.expandConfig(opts);

  opts.keyFile || (opts.keyFile = buildPacks.config.test.build.keyFile);
  opts.installCmd || (opts.installCmd = buildPacks.config.test.install.cmd);
  if (opts.installArgs) {
    opts.installArgs = utils.parseArgs(opts.installArgs);
  } else {
    opts.installArgs = buildPacks.config.test.install.args;
  }
  opts.testCmd || (opts.testCmd = buildPacks.config.test.run.cmd);
  if (opts.testArgs) {
    opts.testArgs = utils.parseArgs(opts.testArgs);
  } else {
    opts.testArgs = buildPacks.config.test.run.args;
  }
  opts.startCmd || (opts.startCmd = buildPacks.config.test.app.cmd);
  if (opts.startArgs) {
    opts.startArgs = utils.parseArgs(opts.startArgs);
  } else {
    opts.startArgs = buildPacks.config.test.app.args;
  }
  if (opts.run === undefined) {
    opts.run = buildPacks.config.test.build.run;
  }

  opts.cloudbuildYamlPath = path.join(opts.localPath, 'repo-tools-cloudbuild.yaml');

  if (buildPacks.config.requiresKeyFile && !opts.keyFile) {
    utils.error('build', `Build target requires a key file but none was provided!`);
    process.exit(1);
  } else if (buildPacks.config.requiresProject && !opts.project) {
    utils.error('build', `Build target requires a project ID but none was provided!`);
    process.exit(1);
  }

  opts.repoPath = utils.getRepoPath(opts.repository, opts.localPath) || 'UNKNOWN';
  if (opts.repoPath) {
    utils.log('build', `Detected repository: ${opts.repoPath.magenta}`);
  }
  opts.sha = getHeadCommitSha(opts.localPath) || 'UNKNOWN';
  if (opts.sha) {
    utils.log('build', `Detected SHA: ${opts.sha.magenta}`);
  }
  if (opts.ci) {
    utils.log('build', `Detected CI: ${`${opts.ci}`.magenta}`);
  }

  try {
    // Setup key file, if any
    if (opts.keyFile && buildPacks.config.requiresKeyFile) {
      opts.keyFilePath = path.resolve(opts.keyFile);
      utils.log('build', `Copying: ${opts.keyFilePath.yellow}`);
      opts.keyFileName = path.parse(opts.keyFilePath).base;
      opts.copiedKeyFilePath = path.join(opts.localPath, path.parse(opts.keyFilePath).base);
      if (!opts.dryRun) {
        fs.copySync(opts.keyFilePath, path.join(opts.localPath, path.parse(opts.keyFilePath).base));
      }
    }
    // Setup project ID, if any
    if (opts.project) {
      utils.log('build', `Setting build project ID to: ${opts.project.yellow}`);
    }

    // Generate the cloudbuild.yaml file
    utils.log('build', `Compiling: ${opts.cloudbuildYamlPath.yellow}`);
    const template = handlebars.compile(fs.readFileSync(tpl, 'utf8'))(opts);
    if (!opts.dryRun) {
      utils.log('build', `Writing: ${opts.cloudbuildYamlPath.yellow}`);
      fs.writeFileSync(opts.cloudbuildYamlPath, template);
    } else {
      utils.log('build', `Printing: ${opts.cloudbuildYamlPath.yellow}\n${template}`);
    }

    // Start the build
    let buildCmd = `gcloud container builds submit . --config 'repo-tools-cloudbuild.yaml' --project '${opts.builderProject}'`;
    if (opts.async) {
      buildCmd += ' --async';
    } else {
      utils.log('build', `Will wait for build to complete.`);
    }
    utils.log('build', `Build command: ${buildCmd.yellow}`);
    if (!opts.dryRun) {
      try {
        childProcess.execSync(buildCmd, {
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
    utils.error('opts', err);
    cleanup(opts);
    throw err;
  }

  if (opts.dryRun) {
    utils.log('build', 'Dry run complete.'.cyan);
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

function getHeadCommitSha (cwd) {
  if (process.env.CIRCLE_SHA1) {
    return process.env.CIRCLE_SHA1;
  }
  const stdout = childProcess.execSync('git log -n 1 --pretty=format:"%H"', {
    cwd,
    stdout: 'ignore',
    timeout: 20 * 60 * 1000
  });
  return stdout.toString().trim();
}
