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

const binPath = path.join(toolsPath, 'bin/samples');
const samplePath = path.join(toolsPath, 'test/samples/nodejs/app');
const nodejs = require(path.join(toolsPath, 'src/build_packs/nodejs'));

// test install

test.serial('should do a dry run install', async (t) => {
  const output = await tools.runAsync(`${binPath} test install --dry-run`, samplePath);

  t.is(output.includes(`install: Beginning dry run.`), true);
  t.is(output.includes(`install: Installing dependencies in: ${samplePath}`), true);
  t.is(output.includes(`install: Running: ${nodejs.test.install.cmd} ${nodejs.test.install.args.join(' ')}`), true);
  t.is(output.includes(`install: Dry run complete.`), true);
});

test.serial('should install with overrides', async (t) => {
  const cmd = 'npm';
  const args = 'install --no-optional --dry-run';

  await fs.remove(path.join(samplePath, 'node_modules'));
  const output = await tools.runAsync(`${binPath} test install --cmd=${cmd} -- ${args}`, samplePath);

  t.is(output.includes(`install: Installing dependencies in: ${samplePath}`), true);
  t.is(output.includes(`install: Running: ${cmd} ${args}`), true);
  t.is(output.includes(`install: Installation complete.`), true);
});

test.serial('should install with defaults', async (t) => {
  await fs.remove(path.join(samplePath, 'node_modules'));
  const output = await tools.runAsync(`${binPath} test install`, samplePath);

  t.is(output.includes(`install: Installing dependencies in: ${samplePath}`), true);
  t.is(output.includes(`install: Running: ${nodejs.test.install.cmd} ${nodejs.test.install.args.join(' ')}`), true);
  t.is(output.includes(`install: Installation complete.`), true);
});

// test run

test.serial('should do a dry run test', async (t) => {
  const output = await tools.runAsync(`${binPath} test run --dry-run`, samplePath);

  t.is(output.includes(`run: Beginning dry run.`), true);
  t.is(output.includes(`run: Executing tests in: ${samplePath}`), true);
  t.is(output.includes(`run: Running: ${nodejs.test.run.cmd} ${nodejs.test.run.args.join(' ')}`), true);
  t.is(output.includes(`run: Dry run complete.`), true);
});

test.serial('should run test with defaults', async (t) => {
  const output = await tools.runAsync(`${binPath} test run`, samplePath);

  t.is(output.includes(`run: Executing tests in: ${samplePath}`), true);
  t.is(output.includes(`run: Running: ${nodejs.test.run.cmd} ${nodejs.test.run.args.join(' ')}`), true);
  t.is(output.includes(`run: Test complete.`), true);
});

test.serial('should run test with overrides', async (t) => {
  const cmd = 'npm';
  const args = 'run test --foo="bar"';

  const output = await tools.runAsync(`${binPath} test run --cmd=${cmd} -- ${args}`, samplePath);

  t.is(output.includes(`run: Executing tests in: ${samplePath}`), true);
  t.is(output.includes(`run: Running: ${cmd} run test --foo=bar`), true);
  t.is(output.includes(`run: Test complete.`), true);
});

// test app

test.serial('should do a dry run web app test', async (t) => {
  const output = await tools.runAsync(`${binPath} test app --dry-run`, samplePath);

  t.is(output.includes(`app: Starting app in: ${samplePath}`), true);
  t.is(output.includes(`app: Using port:`), true);
  t.is(output.includes(`app: Running: ${nodejs.test.app.cmd} ${nodejs.test.app.args.join(' ')}`), true);
  t.is(output.includes(`app: Verifying: http://localhost:`), true);
  t.is(output.includes(`app: Dry run complete.`), true);
});

test.serial('should test web app with defaults', async (t) => {
  const output = await tools.runAsync(`${binPath} test app`, samplePath);

  t.is(output.includes(`app: Starting app in: ${samplePath}`), true);
  t.is(output.includes(`app: Using port:`), true);
  t.is(output.includes(`app: Running: ${nodejs.test.app.cmd} ${nodejs.test.app.args.join(' ')}`), true);
  t.is(output.includes(`app: Verifying: http://localhost:`), true);
  t.is(output.includes(`app: Test complete.`), true);
});

test.serial('should test web app with overrides', async (t) => {
  const cmd = 'node';
  const args = 'app.js --foo "bar"';

  const output = await tools.runAsync(`${binPath} test app --cmd=${cmd} -- ${args}`, samplePath);

  t.is(output.includes(`app: Starting app in: ${samplePath}`), true);
  t.is(output.includes(`app: Using port:`), true);
  t.is(output.includes(`app: Running: ${cmd} app.js --foo bar`), true);
  t.is(output.includes(`app: Verifying: http://localhost:`), true);
  t.is(output.includes(`app: Test complete.`), true);
});

// test build

test.serial('should do a dry run build with defaults', async (t) => {
  const output = await tools.runAsync(`${binPath} test build --dry-run`, samplePath);
  let keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (keyFilePath) {
    keyFilePath = path.parse(keyFilePath).base;
  }

  t.is(output.includes(`build: Detected repository: /GoogleCloudPlatform/nodejs-repo-tools`), true);
  t.is(output.includes(`build: Detected SHA:`), true);
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    t.is(output.includes(`build: Copying: ${path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)}`), true);
  }
  if (process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT) {
    t.is(output.includes(`build: Setting build project ID to: ${process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT}`), true);
  }
  t.is(output.includes(`build: Compiling: ${path.join(samplePath, 'repo-tools-cloudbuild.yaml')}`), true);
  t.is(output.includes(`build: Printing: ${path.join(samplePath, 'repo-tools-cloudbuild.yaml')}`), true);
  t.is(output.includes(`steps:`), true);
  t.is(output.includes(`- name: 'gcr.io/$PROJECT_ID/nodejs'`), true);
  t.is(output.includes(`  env: [`), true);
  t.is(output.includes(`    'CLOUD_BUILD=true',`), true);
  t.is(output.includes(`    'SHA=`), true);
  t.is(output.includes(`    'REPO_PATH=/GoogleCloudPlatform/nodejs-repo-tools',`), true);
  t.is(output.includes(`    'CI=`), true);
  t.is(output.includes(`    'CONTEXT=test-samples-nodejs-app',`), true);
  t.is(output.includes(`    'GOOGLE_APPLICATION_CREDENTIALS=${keyFilePath || ''}',`), true);
  t.is(output.includes(`    'GCLOUD_PROJECT=${process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || ''}',`), true);
  t.is(output.includes(`    'GOOGLE_CLOUD_PROJECT=${process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || ''}'`), true);
  t.is(output.includes(`  ]`), true);
  t.is(output.includes(`  entrypoint: 'samples'`), true);
  t.is(output.includes(`  args: ['test', 'install', '--cmd', 'yarn', '--', 'install', '--mutex', 'file:/tmp/.yarn-mutex']`), true);
  t.is(output.includes(`- name: 'gcr.io/$PROJECT_ID/nodejs'`), true);
  t.is(output.includes(`  env: [`), true);
  t.is(output.includes(`    'CLOUD_BUILD=true',`), true);
  t.is(output.includes(`    'GOOGLE_APPLICATION_CREDENTIALS=${keyFilePath || ''}',`), true);
  t.is(output.includes(`    'GCLOUD_PROJECT=${process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || ''}',`), true);
  t.is(output.includes(`    'GOOGLE_CLOUD_PROJECT=${process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || ''}'`), true);
  t.is(output.includes(`  ]`), true);
  t.is(output.includes(`  entrypoint: 'samples'`), true);
  t.is(output.includes(`  args: ['test', 'run', '--cmd', 'yarn', '--', 'test']`), true);
  t.is(output.includes(`build: Dry run complete.`), true);
});
