##### 3.3.0 - 13 May 2019

- Update dependencies

##### 3.2.0 - 14 February 2019

- Update dependencies

##### 3.1.0 - 03 December 2018

- fix: fix: update badges on default readme (#175)
- fix: update eslint and jsdoc templates (#174)
- fix: remove contributors code (#173)

##### 3.0.0 - 09 November 2018

###### Breaking changes
- Removed the `lint` command and dependency on `semistandard`

##### 2.3.6 - 07 November 2018

###### Backwards compatible changes
- Updated dependencies
- Use new `gcloud builds` command
- Switch `semistandard` to being a non-dev dependency
- Respect URLs specified in build packs

##### 2.3.5 - 27 September 2018

###### Backwards compatible changes
- Updated dependencies

##### 2.3.3 - 27 July 2018

###### Backwards compatible changes
- Updated Readme template

##### 2.3.2 - 23 July 2018

###### Backwards compatible changes
- Added Cloud IoT Core product
- Added Cloud AutoML product

##### 2.3.1 - 11 July 2018

###### Backwards compatible changes
- Added Cloud Tasks product

##### 2.3.0 - 06 April 2018

###### Backwards compatible changes
- Added a Node.js-only "bump" command (thanks @alexander-fenster)

##### 2.2.6 - 28 March 2018

- Add Text-to-Speech product info

###### Bug fixes
- Fix link to open in cloud shell button image

##### 2.2.5 - 22 March 2018

- Added comments in Node.js README templates that the files are autogenerated.

##### 2.2.4 - 16 March 2018

###### Bug fixes
- Add missing lines to `.gitignore` Node.js template
- Add missing configuration for two products

##### 2.2.3 - 14 March 2018

###### Bug fixes
- Fix link to "Open in Cloud Shell" button image

##### 2.2.2 - 13 March 2018

###### Bug fixes
- Un-ignore package-lock.json files in Node.js .gitignore template

##### 2.2.1 - 21 February 2018

###### Bug fixes
- Removed broken links from Node.js issue template

##### 2.2.0 - 26 January 2018

###### Backwards compatible changes
- Improved Python support
- Upgraded dependencies

##### 2.1.4 - 17 January 2018

- Updated a product name

##### 2.1.3 - 17 November 2017

###### Backwards compatible changes
- #81 - Add ability to specify test url in config file

##### 2.1.2 - 08 November 2017

###### Backwards compatible changes
- Added `yaml` flag to the `test deploy` command.

##### 2.1.1 - 01 November 2017

###### Bug fixes
- Fix issue with `getUrl`

##### 2.1.0 - 27 October 2017

###### Bug fixes
- #59 - Link to license and contributing files in lib_readme are wrong.
- #60 - Add link to the library's repo in its readme
- #61 - Compatible when sample directory does not exist
- #67 - Samples link broken in the docs

###### Backwards compatible changes
- #56 - Successfully ignore the new package-lock.json-12345 files.
- #63 - Add --except option to generate command to be used in combination with the "all" target
- #65 - Support deprecated release level.
- Add Open in Cloud Shell button to readmes.
- Dogfood repo-tools on repo-tools. Switched to eslint + prettier.

###### Other
- Updated dependencies

##### 2.0.11 - 22 October 2017

###### Bug fixes
- Fix to `spawnAsyncWithIO`

##### 2.0.10 - 17 October 2017

###### Backwards compatible changes
- Fixed wrong samples link in lib_readme.tpl
- #52 - Make alpha release level badges orange.
- #54 - Remove the autogen beta disclaimer.

###### Other
- Upgraded dependencies

##### 2.0.9 - 12 October 2017

###### Backwards compatible changes
- Updated eslintrc_systemtest.tpl

##### 2.0.8 - 12 October 2017

###### Backwards compatible changes
- Added support for generating and updating a package.json file.
- Added support for generating a CONTRIBUTORS file.

##### 2.0.7 - 03 October 2017

###### Bug fixes
- Fix Firestore docs link

##### 2.0.6 - 03 October 2017

###### Backwards compatible changes
- #43 - Fix "quickstart" capitalization
- #45 - Add `.prettierignore`
- Use official Apache 2.0 license template.
- Provide a mechanism to suppress the billing instruction.
- Add Cloud Firestore product information.
- #46 - Codecov badges should use master branch.

##### 2.0.5 - 02 October 2017

###### Other
- Tweaked library readme
- Fix for JSDoc config

##### 2.0.4 - 22 September 2017

###### Backwards compatible changes
- #39 - Add ability to hide "Enable API" if api_id doesn't exist
- #40 - Add all API IDs to src/utils/products.js

##### 2.0.3 - 22 September 2017

###### Bug fixes
- Fixed --help and --version flags

##### 2.0.2 - 22 September 2017

###### Backwards compatible changes
- Made command logs more consistent

##### 2.0.1 - 22 September 2017

###### Backwards compatible changes
- #36 - Automatically write a JavaScript appropriate .gitignore

###### Bug fixes
- Fixed release script

###### Other
- Updated contributing guide

##### 2.0.0 - 22 September 2017

Stable 2.0.0 release

###### Bug fixes
- #35 - Fix logger stutter

##### 2.0.0-beta.12 - 20 September 2017

###### Breaking changes
- Changed signature of `lint` command to match that of the `test` commands, i.e. using `--cmd` and `--` for args.

###### Other
- Improved repository URL handling
- Upgraded dependencies

##### 2.0.0-beta.11 - 19 September 2017

- Small tweak to the `lib_readme` template.

##### 2.0.0-beta.10 - 18 September 2017

- Fixed typo in `lib_readme` template.

##### 2.0.0-beta.9 - 18 September 2017

- Make `lib_readme` quickstart sample region tag configurable.
- Improve the look of the samples list in `lib_readme`.

##### 2.0.0-beta.8 - 18 September 2017

- Updates to `templates/nodejs/jsdoc.tpl`

##### 2.0.0-beta.7 - 07 September 2017

- Added 6 new targets to the `generate` command.
- Added `shell: true` to improve stability of CLI commands.

##### 2.0.0-beta.6 - 29 August 2017

- Added `templates/` to distribution (it was missing)

##### 2.0.0-beta.5 - 29 August 2017

- Fix Release Quality badge in lib_readme
- #23 - Add syntax highlighting to quickstart sample in lib_readme
- Fix relative Github links in lib_readme
- #22 - Add support for year ranges in the license file.

##### 2.0.0-beta.4 - 23 August 2017

- Fix: `utils.fatal` => `utils.logger.fatal`

##### 2.0.0-beta.3 - 21 August 2017

- Added `yargs-parser` to list of dependencies.

##### 2.0.0-beta.2 - 21 August 2017

- Add use of babel-preset-env to prepublish step to product a Node.js v4
  version of Repo Tools.
- Added `tools exec -- <cmd> [args..]` command.
- Now testing on more Node.js version (though the testing on Node.js v4 is just
  a smoke test).

##### 2.0.0-beta.1 - 21 August 2017

- Add support for generating client lib files.
- Upgraded dependencies.
- Refactored build pack objects to classes
- Improved README and added contributing guide