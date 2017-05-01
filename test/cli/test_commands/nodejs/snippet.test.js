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
const samplePath = path.join(toolsPath, 'test/samples/nodejs/snippet');
const nodejs = require(path.join(toolsPath, 'src/build_packs/nodejs'));

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
