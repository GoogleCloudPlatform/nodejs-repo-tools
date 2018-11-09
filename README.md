# nodejs-repo-tools [![build status][travis_badge]][travis_link] [![coverage][coverage_badge]][coverage_link] [![Greenkeeper badge][greenkeeper_badge]][greenkeeper_link]

A tool used to maintain and test repositories in the GoogleCloudPlatform
organization.

**Table of contents**

* [Installation](#installation)
* [CLI usage](#cli-usage)
* [Programmatic usage](#programmatic-usage)
* [Language support](#language-support)
  * [Available build packs](#available-build-packs)
  * [Adding a build pack](#adding-a-build-pack)

## Installation

Via `npm`:

1.  `npm install -g @google-cloud/nodejs-repo-tools`
1.  `repo-tools --help`

Via download (Linux):

1.  `curl -O https://storage.googleapis.com/cloud-docs-samples/releases/latest/nodejs-repo-tools-linux`
1.  `mv ./nodejs-repo-tools-linux $HOME/bin/repo-tools`
1.  `chmod +x $HOME/bin/repo-tools`

Via download (Mac):

1.  `curl -O https://storage.googleapis.com/cloud-docs-samples/releases/latest/nodejs-repo-tools-macos`
1.  `mv ./nodejs-repo-tools-macos $HOME/bin/repo-tools`
1.  `chmod +x $HOME/bin/repo-tools`

Via download (Windows):

[Download link](https://storage.googleapis.com/cloud-docs-samples/releases/latest/nodejs-repo-tools-win.exe)

## CLI usage

Usage: `repo-tools --help` or `tools --help`

```
Commands:
  exec                  Run a given command in /Users/jdobry/projects/nodejs-repo-tools.
  generate <targets..>  Generate the given target(s) in /Users/jdobry/projects/nodejs-repo-tools.
  test                  Run a test sub-command.
  unify                 (Node.js only) Recursively add sub-directory dependencies to the top-level package.json file.

Options:
  --build-pack, -b  Choices: nodejs, python, ruby. Detected: nodejs. The build pack to use. The tool will attempt to
                    detect which build to use.                                                                  [string]
  --local-path, -l  Current: /Users/jdobry/projects/nodejs-repo-tools. Use this option to set the current working
                    directory of the command.                                                                   [string]
  --dry-run         Default: false. Print the actions that would be taken, but don't actually do anything.     [boolean]
  --silent          Default: false. If true, hide the output of shell commands.                                [boolean]
  --help            Show help                                                                                  [boolean]
  --version         Show version number                                                                        [boolean]

For more information, see https://github.com/GoogleCloudPlatform/nodejs-repo-tools
```

## Programmatic usage

1.  Install the tool:

        npm install --save @google-cloud/nodejs-repo-tools

1.  Then in your code:

        const tools = require('@google-cloud/nodejs-repo-tools');`

## Language support

Support for various programming languages is added via [build packs][]. A build
pack specifies language-specific config and commands that should be used when
performing the various Repo Tools tasks. Repo Tools does its best to infer the
build pack it should use, but when running a command to can specify a specific
build pack with `--build-pack [BUILD_PACK]` or `-b [BUILD_PACK]`.

### Available build packs

* [global][] - The default, global configuration for all build packs.
* [nodejs][] - Build pack for the Node.js programming language.
* [python][] - Build pack for the Python programming language.
* [ruby][] - Build pack for the Ruby programming language.

[global]: https://github.com/GoogleCloudPlatform/nodejs-repo-tools/blob/master/src/build_packs/build_pack.js
[nodejs]: https://github.com/GoogleCloudPlatform/nodejs-repo-tools/blob/master/src/build_packs/nodejs.js
[python]: https://github.com/GoogleCloudPlatform/nodejs-repo-tools/blob/master/src/build_packs/python.js
[ruby]: https://github.com/GoogleCloudPlatform/nodejs-repo-tools/blob/master/src/build_packs/ruby.js

### Adding a build pack

A build pack can be added by adding a `.js` file to the [src/build_packs][build_packs]
directory. This file should export a JavaScript object. You can see the
available options by perusing the existing build packs.

[build_packs]: https://github.com/GoogleCloudPlatform/nodejs-repo-tools/tree/master/src/build_packs

## Contributing

See [CONTRIBUTING.md](https://github.com/GoogleCloudPlatform/nodejs-repo-tools/blob/master/.github/CONTRIBUTING.md).

## License

Apache Version 2.0

See [LICENSE](https://github.com/GoogleCloudPlatform/nodejs-repo-tools/blob/master/LICENSE).

[travis_badge]: https://img.shields.io/travis/GoogleCloudPlatform/nodejs-repo-tools.svg
[travis_link]: https://travis-ci.org/GoogleCloudPlatform/nodejs-repo-tools
[coverage_badge]: https://img.shields.io/codecov/c/github/GoogleCloudPlatform/nodejs-repo-tools/master.svg
[coverage_link]: https://codecov.io/gh/GoogleCloudPlatform/nodejs-repo-tools
[greenkeeper_badge]: https://badges.greenkeeper.io/GoogleCloudPlatform/nodejs-repo-tools.svg
[greenkeeper_link]: https://greenkeeper.io/
