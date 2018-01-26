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

const fs = require('fs-extra');
const path = require('path');
const test = require('ava');

const toolsPath = path.join(__dirname, '../../../../');
const tools = require(toolsPath);

const binPath = path.join(toolsPath, 'bin/tools');
const samplePath = path.join(toolsPath, 'test/samples/nodejs/app');
const NodejsBuildPack = require(toolsPath).buildPacks.NodejsBuildPack;
const buildPack = new NodejsBuildPack();

// test install

test.serial('should do a dry run install', async t => {
  const output = await tools.runAsync(
    `${binPath} test install --dry-run`,
    samplePath
  );

  t.regex(output, new RegExp(`install: Beginning dry run.`));
  t.regex(
    output,
    new RegExp(`install: Installing dependencies in: ${samplePath}`)
  );
  t.regex(
    output,
    new RegExp(
      `install: Running: ${
        buildPack.config.test.install.cmd
      } ${buildPack.config.test.install.args.join(' ')}`
    )
  );
  t.regex(output, new RegExp(`install: Dry run complete.`));
});

test.serial('should install with overrides', async t => {
  const cmd = 'npm';
  const args = 'install --no-optional --dry-run';

  await fs.remove(path.join(samplePath, 'node_modules'));
  const output = await tools.runAsync(
    `${binPath} test install --cmd=${cmd} -- ${args}`,
    samplePath
  );

  t.regex(
    output,
    new RegExp(`install: Installing dependencies in: ${samplePath}`)
  );
  t.regex(output, new RegExp(`install: Running: ${cmd} ${args}`));
  t.regex(output, new RegExp(`install: Success!`));
});

test.serial('should install with defaults', async t => {
  await fs.remove(path.join(samplePath, 'node_modules'));
  const output = await tools.runAsync(`${binPath} test install`, samplePath);

  t.regex(
    output,
    new RegExp(`install: Installing dependencies in: ${samplePath}`)
  );
  t.regex(
    output,
    new RegExp(
      `install: Running: ${
        buildPack.config.test.install.cmd
      } ${buildPack.config.test.install.args.join(' ')}`
    )
  );
  t.regex(output, new RegExp(`install: Success!`));
});

// test run

test.serial('should do a dry run test', async t => {
  const output = await tools.runAsync(
    `${binPath} test run --dry-run`,
    samplePath
  );

  t.regex(output, new RegExp(`run: Beginning dry run.`));
  t.regex(output, new RegExp(`run: Executing tests in: ${samplePath}`));
  t.regex(
    output,
    new RegExp(
      `run: Running: ${
        buildPack.config.test.run.cmd
      } ${buildPack.config.test.run.args.join(' ')}`
    )
  );
  t.regex(output, new RegExp(`run: Dry run complete.`));
});

test.serial('should run test with defaults', async t => {
  const results = await tools.spawnAsyncWithIO(
    binPath,
    ['test', 'run'],
    samplePath
  );

  t.regex(results.output, new RegExp(`run: Executing tests in: ${samplePath}`));
  t.regex(
    results.output,
    new RegExp(
      `run: Running: ${
        buildPack.config.test.run.cmd
      } ${buildPack.config.test.run.args.join(' ')}`
    )
  );
  t.regex(results.output, new RegExp(`run: Success!`));
});

test.serial('should run test with overrides', async t => {
  const cmd = 'npm';
  const results = await tools.spawnAsyncWithIO(
    binPath,
    ['test', 'run', `--cmd=${cmd}`, '--', 'run', 'test', '--foo="bar"'],
    samplePath
  );

  t.regex(results.output, new RegExp(`run: Executing tests in: ${samplePath}`));
  t.regex(results.output, new RegExp(`run: Running: npm run test --foo=bar`));
  t.regex(results.output, new RegExp(`run: Success!`));
});

// test app

test.serial('should do a dry run web app test', async t => {
  const results = await tools.spawnAsyncWithIO(
    binPath,
    ['test', 'app', '--dry-run'],
    samplePath
  );

  t.regex(results.output, new RegExp(`app: Starting app in: ${samplePath}`));
  t.regex(results.output, new RegExp(`app: Using port:`));
  t.regex(
    results.output,
    new RegExp(
      `app: Running: ${
        buildPack.config.test.app.cmd
      } ${buildPack.config.test.app.args.join(' ')}`
    )
  );
  t.regex(results.output, new RegExp(`app: Verifying: http://localhost:`));
  t.regex(results.output, new RegExp(`app: Dry run complete.`));
});

test.serial('should test web app with defaults', async t => {
  const results = await tools.spawnAsyncWithIO(
    binPath,
    ['test', 'app'],
    samplePath
  );

  t.regex(results.output, new RegExp(`app: Starting app in: ${samplePath}`));
  t.regex(results.output, new RegExp(`app: Using port:`));
  t.regex(
    results.output,
    new RegExp(
      `app: Running: ${
        buildPack.config.test.app.cmd
      } ${buildPack.config.test.app.args.join(' ')}`
    )
  );
  t.regex(results.output, new RegExp(`app: Verifying: http://localhost:`));
  t.regex(results.output, new RegExp(`app: Success!`));
});

test.serial('should test web app with overrides', async t => {
  const cmd = 'node';
  const results = await tools.spawnAsyncWithIO(
    binPath,
    ['test', 'app', `--cmd=${cmd}`, '--', 'app.js', '--foo', '"bar"'],
    samplePath
  );

  t.regex(results.output, new RegExp(`app: Starting app in: ${samplePath}`));
  t.regex(results.output, new RegExp(`app: Using port:`));
  t.regex(results.output, new RegExp(`app: Running: node app.js --foo bar`));
  t.regex(results.output, new RegExp(`app: Verifying: http://localhost:`));
  t.regex(results.output, new RegExp(`app: Success!`));
});

// test build

test.serial('should do a dry run build with defaults', async t => {
  const results = await tools.spawnAsyncWithIO(
    binPath,
    [
      'test',
      'build',
      '--dry-run',
      '--config',
      'package.json',
      '--config-key',
      'cloud-repo-tools',
    ],
    samplePath
  );
  let keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const output = results.output;

  if (keyFilePath) {
    keyFilePath = path.parse(keyFilePath).base;
  }

  t.regex(
    output,
    new RegExp(
      `build: Detected repository: /GoogleCloudPlatform/nodejs-repo-tools`
    )
  );
  t.regex(output, new RegExp(`build: Detected SHA:`));
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    t.regex(
      output,
      new RegExp(
        `build: Copying: ${path.resolve(
          process.env.GOOGLE_APPLICATION_CREDENTIALS
        )}`
      )
    );
  }
  if (process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT) {
    t.regex(
      output,
      new RegExp(
        `build: Setting build project ID to: ${process.env.GCLOUD_PROJECT ||
          process.env.GOOGLE_CLOUD_PROJECT}`
      )
    );
  }
  t.regex(
    output,
    new RegExp(
      `build: Compiling: ${path.join(samplePath, 'repo-tools-cloudbuild.yaml')}`
    )
  );
  t.regex(
    output,
    new RegExp(
      `build: Printing: ${path.join(samplePath, 'repo-tools-cloudbuild.yaml')}`
    )
  );
  t.regex(output, new RegExp(`steps:`));
  t.is(output.includes(`- name: 'gcr.io/$PROJECT_ID/nodejs'`), true);
  t.is(output.includes(`  env: [`), true);
  t.regex(output, new RegExp(`    'CLOUD_BUILD=true',`));
  t.regex(output, new RegExp(`    'SHA=`));
  t.regex(
    output,
    new RegExp(`    'REPO_PATH=/GoogleCloudPlatform/nodejs-repo-tools',`)
  );
  t.regex(output, new RegExp(`    'CI=`));
  t.regex(output, new RegExp(`    'CONTEXT=test-samples-nodejs-app',`));
  t.regex(
    output,
    new RegExp(`    'GOOGLE_APPLICATION_CREDENTIALS=${keyFilePath || ''}',`)
  );
  t.regex(
    output,
    new RegExp(
      `    'GCLOUD_PROJECT=${process.env.GCLOUD_PROJECT ||
        process.env.GOOGLE_CLOUD_PROJECT ||
        ''}',`
    )
  );
  t.regex(
    output,
    new RegExp(
      `    'GOOGLE_CLOUD_PROJECT=${process.env.GCLOUD_PROJECT ||
        process.env.GOOGLE_CLOUD_PROJECT ||
        ''}'`
    )
  );
  t.is(output.includes(`  ]`), true);
  t.regex(output, new RegExp(`  entrypoint: 'samples'`));
  t.is(
    output.includes(
      `  args: ['test', 'install', '--cmd', 'npm', '--', 'install']`
    ),
    true
  );
  t.is(output.includes(`- name: 'gcr.io/$PROJECT_ID/nodejs'`), true);
  t.is(output.includes(`  env: [`), true);
  t.regex(output, new RegExp(`    'CLOUD_BUILD=true',`));
  t.regex(
    output,
    new RegExp(`    'GOOGLE_APPLICATION_CREDENTIALS=${keyFilePath || ''}',`)
  );
  t.regex(
    output,
    new RegExp(
      `    'GCLOUD_PROJECT=${process.env.GCLOUD_PROJECT ||
        process.env.GOOGLE_CLOUD_PROJECT ||
        ''}',`
    )
  );
  t.regex(
    output,
    new RegExp(
      `    'GOOGLE_CLOUD_PROJECT=${process.env.GCLOUD_PROJECT ||
        process.env.GOOGLE_CLOUD_PROJECT ||
        ''}'`
    )
  );
  t.is(output.includes(`  ]`), true);
  t.regex(output, new RegExp(`  entrypoint: 'samples'`));
  t.is(
    output.includes(`  args: ['test', 'run', '--cmd', 'npm', '--', 'test']`),
    true
  );
  t.regex(output, new RegExp(`build: Dry run complete.`));
});
