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

module.exports = {
  global: {
    dryRun: false,
    localPath: process.cwd(),
    project: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT
  },
  lint: {
    args: []
  },
  test: {
    app: {},
    build: {
      builderProject: 'cloud-docs-samples',
      ci: process.env.CI,
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      timeout: '20m'
    },
    deploy: {
      cmd: 'gcloud',
      yaml: 'app.yaml',
      tries: 1
    },
    install: {},
    run: {}
  }
};
