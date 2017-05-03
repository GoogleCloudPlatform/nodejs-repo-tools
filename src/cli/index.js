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

const buildPacks = require('../build_packs');

buildPacks.detectBuildPack(process.argv);

module.exports = require('yargs')
  .demand(1)
  .commandDir('commands')
  .options({
    'build-pack': {
      alias: 'b',
      description: `${'Choices:'.bold} ${buildPacks.packs.filter((pack) => pack !== 'global').map((pack) => pack.yellow).join(', ')}. ${buildPacks.selected ? 'Selected:'.bold : 'Detected:'.bold} ${`${buildPacks.current}`.green}. The build pack to use. The tool will attempt to detect which build to use.`,
      global: true,
      requiresArg: true,
      type: 'string'
    },
    'local-path': {
      alias: 'l',
      description: `${'Current:'.bold} ${`${buildPacks.global.global.localPath}`.yellow}. Use this option to set the current working directory of the command.`,
      global: true,
      requiresArg: true,
      type: 'string'
    },
    'dry-run': {
      description: `${'Default:'.bold} ${`${buildPacks.global.global.dryRun}`.yellow}. Print the actions that ${'would'.italic} be taken, but don't actually do anything.`,
      global: true,
      type: 'boolean'
    },
    'silent': {
      description: `${'Default:'.bold} ${'false'.yellow}. If true, hide the output of shell commands.`,
      global: true,
      type: 'boolean'
    }
  })
  .wrap(120)
  .recommendCommands()
  .epilogue('For more information, see https://github.com/GoogleCloudPlatform/nodejs-repo-tools')
  .help()
  .strict()
  .version(require('../../package.json').version);
