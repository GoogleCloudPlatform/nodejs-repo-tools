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

const path = require('path');
const test = require('ava');

const toolsPath = path.join(__dirname, '../../../');
const tools = require(toolsPath);

const binPath = path.join(toolsPath, 'bin/tools');
const samplePath = path.join(toolsPath, 'test/samples/nodejs/snippet');
const NodejsBuildPack = require(toolsPath).buildPacks.NodejsBuildPack;
const buildPack = new NodejsBuildPack();

test.serial('should do a dry run lint', async (t) => {
  const output = await tools.runAsync(`${binPath} lint --dry-run`, samplePath);

  t.regex(output, new RegExp(`lint: Beginning dry run.`));
  t.regex(output, new RegExp(`lint: Linting files in: ${samplePath}`));
  t.regex(output, new RegExp(`lint: Running: ${buildPack.config.lint.cmd}`));
  t.regex(output, new RegExp(`lint: Dry run complete.`));
});

test.serial('should lint with files', async (t) => {
  try {
    await tools.runAsyncWithIO(`${binPath} lint -b nodejs -- ${samplePath}/lint_error.js`, path.join(samplePath, '..'));
  } catch (err) {
    t.regex(err.stdout, new RegExp(`lint: Linting files in: ${path.join(samplePath, '..')}`));
    t.regex(err.stdout, new RegExp(`lint: Running: ${buildPack.config.lint.cmd}`));
    t.regex(err.stderr, new RegExp(`lint: Oh no!`));
    return;
  }
  t.fail('Should have entered catch');
});

test.serial('should lint with defaults', async (t) => {
  try {
    await tools.runAsyncWithIO(`${binPath} lint -b nodejs`, path.join(samplePath, '..'));
  } catch (err) {
    t.regex(err.stdout, new RegExp(`lint: Linting files in: ${path.join(samplePath, '..')}`));
    t.regex(err.stdout, new RegExp(`lint: Running: ${buildPack.config.lint.cmd}`));
    t.regex(err.stderr, new RegExp(`lint: Oh no!`));
    return;
  }
  t.fail('Should have entered catch');
});

test.serial('should lint with overrides', async (t) => {
  const result = await tools.runAsyncWithIO(`${binPath} lint -b nodejs --cmd echo -- foo`, path.join(samplePath, '..'));
  t.regex(result.output, new RegExp(`lint: Linting files in: ${path.join(samplePath, '..')}`));
  t.regex(result.output, new RegExp(`lint: Running: echo foo`));
  t.regex(result.output, new RegExp(`lint: Success!`));
});
