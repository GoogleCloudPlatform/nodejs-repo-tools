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
const samplePath = path.join(toolsPath, 'test/samples/nodejs/snippet');
const NodejsBuildPack = require(toolsPath).buildPacks.NodejsBuildPack;
const buildPack = new NodejsBuildPack();

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
      `install: Running: ${buildPack.config.test.install
        .cmd} ${buildPack.config.test.install.args.join(' ')}`
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
      `install: Running: ${buildPack.config.test.install
        .cmd} ${buildPack.config.test.install.args.join(' ')}`
    )
  );
  t.regex(output, new RegExp(`install: Success!`));
});

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
      `run: Running: ${buildPack.config.test.run
        .cmd} ${buildPack.config.test.run.args.join(' ')}`
    )
  );
  t.regex(output, new RegExp(`run: Dry run complete.`));
});

test.serial('should run test with defaults', async t => {
  const output = await tools.runAsync(`${binPath} test run`, samplePath);

  t.regex(output, new RegExp(`run: Executing tests in: ${samplePath}`));
  t.regex(
    output,
    new RegExp(
      `run: Running: ${buildPack.config.test.run
        .cmd} ${buildPack.config.test.run.args.join(' ')}`
    )
  );
  t.regex(output, new RegExp(`run: Success!`));
});

test.serial('should run test with overrides', async t => {
  const cmd = 'npm';
  const args = 'run test --foo="bar"';

  const output = await tools.runAsync(
    `${binPath} test run --cmd=${cmd} -- ${args}`,
    samplePath
  );

  t.regex(output, new RegExp(`run: Executing tests in: ${samplePath}`));
  t.regex(output, new RegExp(`run: Running: ${cmd} run test --foo=bar`));
  t.regex(output, new RegExp(`run: Success!`));
});
