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

const fs = require('fs');
const path = require('path');
const test = require('ava');

const toolsPath = path.join(__dirname, '../../../');
const tools = require(toolsPath);

const binPath = path.join(toolsPath, 'bin/tools');
const samplePath = path.join(toolsPath, 'test/samples/nodejs/bump');
const appName = 'test-samples-nodejs-app';

function setVersion(version, withSamples) {
  let packageJson = JSON.parse(
    fs.readFileSync(path.join(samplePath, 'package.json.default'))
  );
  packageJson['version'] = version;
  packageJson['name'] = appName;
  fs.writeFileSync(
    path.join(samplePath, 'package.json'),
    JSON.stringify(packageJson, null, '  ')
  );

  if (withSamples) {
    let samplesPackageJson = JSON.parse(
      fs.readFileSync(path.join(samplePath, 'samples', 'package.json.default'))
    );
    samplesPackageJson['dependencies'][appName] = version;
    fs.writeFileSync(
      path.join(samplePath, 'samples', 'package.json'),
      JSON.stringify(samplesPackageJson, null, '  ')
    );
  }
}

test.serial('should do a dry run bump patch with samples', async t => {
  setVersion('1.2.3', true);
  const output = await tools.runAsync(
    `${binPath} bump patch --dry-run`,
    samplePath
  );

  t.regex(output, new RegExp(`bump: Beginning dry run.`));
  t.regex(
    output,
    new RegExp(`bump: Version will be bumped from 1.2.3 to 1.2.4.`)
  );
  t.regex(
    output,
    new RegExp(`bump: Version in package.json will be set to 1.2.4.`)
  );
  t.regex(
    output,
    new RegExp(
      `bump: samples/package.json will depend on '${appName}': '1.2.4'.`
    )
  );
  t.regex(output, new RegExp(`bump: Dry run complete.`));

  // dry run should not change version
  let packageJson = JSON.parse(
    fs.readFileSync(path.join(samplePath, 'package.json'))
  );
  let samplesPackageJson = JSON.parse(
    fs.readFileSync(path.join(samplePath, 'samples', 'package.json'))
  );
  t.deepEqual('1.2.3', packageJson['version']);
  t.deepEqual('1.2.3', samplesPackageJson['dependencies'][appName]);
});

test.serial('should do a dry run bump minor with samples', async t => {
  setVersion('1.2.3', true);
  const output = await tools.runAsync(
    `${binPath} bump minor --dry-run`,
    samplePath
  );

  t.regex(output, new RegExp(`bump: Beginning dry run.`));
  t.regex(
    output,
    new RegExp(`bump: Version will be bumped from 1.2.3 to 1.3.0.`)
  );
  t.regex(
    output,
    new RegExp(`bump: Version in package.json will be set to 1.3.0.`)
  );
  t.regex(
    output,
    new RegExp(
      `bump: samples/package.json will depend on '${appName}': '1.3.0'.`
    )
  );
  t.regex(output, new RegExp(`bump: Dry run complete.`));

  // dry run should not change version
  let packageJson = JSON.parse(
    fs.readFileSync(path.join(samplePath, 'package.json'))
  );
  let samplesPackageJson = JSON.parse(
    fs.readFileSync(path.join(samplePath, 'samples', 'package.json'))
  );
  t.deepEqual('1.2.3', packageJson['version']);
  t.deepEqual('1.2.3', samplesPackageJson['dependencies'][appName]);
});

test.serial('should do a dry run bump major with samples', async t => {
  setVersion('1.2.3', true);
  const output = await tools.runAsync(
    `${binPath} bump major --dry-run`,
    samplePath
  );

  t.regex(output, new RegExp(`bump: Beginning dry run.`));
  t.regex(
    output,
    new RegExp(`bump: Version will be bumped from 1.2.3 to 2.0.0.`)
  );
  t.regex(
    output,
    new RegExp(`bump: Version in package.json will be set to 2.0.0.`)
  );
  t.regex(
    output,
    new RegExp(
      `bump: samples/package.json will depend on '${appName}': '2.0.0'.`
    )
  );
  t.regex(output, new RegExp(`bump: Dry run complete.`));

  // dry run should not change version
  let packageJson = JSON.parse(
    fs.readFileSync(path.join(samplePath, 'package.json'))
  );
  let samplesPackageJson = JSON.parse(
    fs.readFileSync(path.join(samplePath, 'samples', 'package.json'))
  );
  t.deepEqual('1.2.3', packageJson['version']);
  t.deepEqual('1.2.3', samplesPackageJson['dependencies'][appName]);
});

test.serial('should bump patch with samples', async t => {
  setVersion('1.2.3', true);
  const output = await tools.runAsync(`${binPath} bump patch`, samplePath);

  t.regex(
    output,
    new RegExp(`bump: Version will be bumped from 1.2.3 to 1.2.4.`)
  );
  t.regex(
    output,
    new RegExp(`bump: Version in package.json will be set to 1.2.4.`)
  );
  t.regex(
    output,
    new RegExp(
      `bump: samples/package.json will depend on '${appName}': '1.2.4'.`
    )
  );

  let packageJson = JSON.parse(
    fs.readFileSync(path.join(samplePath, 'package.json'))
  );
  let samplesPackageJson = JSON.parse(
    fs.readFileSync(path.join(samplePath, 'samples', 'package.json'))
  );
  t.deepEqual('1.2.4', packageJson['version']);
  t.deepEqual('1.2.4', samplesPackageJson['dependencies'][appName]);
});

test.serial('should bump minor with samples', async t => {
  setVersion('1.2.3', true);
  const output = await tools.runAsync(`${binPath} bump minor`, samplePath);

  t.regex(
    output,
    new RegExp(`bump: Version will be bumped from 1.2.3 to 1.3.0.`)
  );
  t.regex(
    output,
    new RegExp(`bump: Version in package.json will be set to 1.3.0.`)
  );
  t.regex(
    output,
    new RegExp(
      `bump: samples/package.json will depend on '${appName}': '1.3.0'.`
    )
  );

  let packageJson = JSON.parse(
    fs.readFileSync(path.join(samplePath, 'package.json'))
  );
  let samplesPackageJson = JSON.parse(
    fs.readFileSync(path.join(samplePath, 'samples', 'package.json'))
  );
  t.deepEqual('1.3.0', packageJson['version']);
  t.deepEqual('1.3.0', samplesPackageJson['dependencies'][appName]);
});

test.serial('should bump major with samples', async t => {
  setVersion('1.2.3', true);
  const output = await tools.runAsync(`${binPath} bump major`, samplePath);

  t.regex(
    output,
    new RegExp(`bump: Version will be bumped from 1.2.3 to 2.0.0.`)
  );
  t.regex(
    output,
    new RegExp(`bump: Version in package.json will be set to 2.0.0.`)
  );
  t.regex(
    output,
    new RegExp(
      `bump: samples/package.json will depend on '${appName}': '2.0.0'.`
    )
  );

  let packageJson = JSON.parse(
    fs.readFileSync(path.join(samplePath, 'package.json'))
  );
  let samplesPackageJson = JSON.parse(
    fs.readFileSync(path.join(samplePath, 'samples', 'package.json'))
  );
  t.deepEqual('2.0.0', packageJson['version']);
  t.deepEqual('2.0.0', samplesPackageJson['dependencies'][appName]);
});

test.serial('should work without samples', async t => {
  setVersion('1.2.3', false);
  const output = await tools.runAsync(`${binPath} bump major`, samplePath);

  t.regex(
    output,
    new RegExp(`bump: Version will be bumped from 1.2.3 to 2.0.0.`)
  );
  t.regex(
    output,
    new RegExp(`bump: Version in package.json will be set to 2.0.0.`)
  );

  let packageJson = JSON.parse(
    fs.readFileSync(path.join(samplePath, 'package.json'))
  );
  t.deepEqual('2.0.0', packageJson['version']);
});
