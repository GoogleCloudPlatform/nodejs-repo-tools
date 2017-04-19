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

const got = require('got');
const path = require('path');
const url = require('url');

/**
 * Helper method for making requests to the GitHub API.
 *
 * @param {string} uri
 * @param {object} [options]
 */
function makeRequest (uri, options) {
  const settings = require('../../settings.json');

  options || (options = {});

  // Add appropriate headers
  options.headers || (options.headers = {});
  options.headers.Accept = 'application/vnd.github.black-cat-preview+json,application/vnd.github.v3+json';

  // Send and accept JSON
  options.json = true;
  if (options.body) {
    options.headers['Content-Type'] = 'application/json';
    if (typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
  }

  // Add authentication
  const parts = url.parse(uri);
  parts.auth = `dpebot:${settings.accessToken}`;

  // Make the request
  return got(parts, options).then((res) => res.body);
}

/**
 * Create a build status.
 *
 * @param {object} config
 */
function createStatus (config) {
  console.log(`Updating status to ${config.STATE}.`);
  console.log(config);

  const statusUrl = `https://api.github.com/${path.join('repos', config.REPO_PATH, 'statuses', config.SHA)}`;

  const body = {
    state: config.STATE,
    target_url: config.LOG_URL,
    description: config.DESCRIPTION,
    context: config.CONTEXT
  };
  return makeRequest(statusUrl, {
    method: 'POST',
    body
  });
}

const STATUS_MAP = {
  STATUS_UNKNOWN: 'pending',
  QUEUED: 'pending',
  WORKING: 'pending',
  SUCCESS: 'success',
  FAILURE: 'failure',
  INTERNAL_ERROR: 'failure',
  TIMEOUT: 'failure',
  CANCELLED: 'failure'
};

const DESCRIPTION_MAP = {
  STATUS_UNKNOWN: 'Build in limbo',
  QUEUED: 'Build queued',
  WORKING: 'Build in progress',
  SUCCESS: 'Build succeeded',
  FAILURE: 'Build failed',
  INTERNAL_ERROR: 'Build failed',
  TIMEOUT: 'Build exceeded timeout',
  CANCELLED: 'Build cancelled'
};

function detectRepoConfig (build = {}) {
  const steps = build.steps || [];
  const config = {};

  steps.forEach((step) => {
    const env = step.env || [];
    env.forEach((pair) => {
      const matches = pair.match(/^([A-Z_]+)=(.+)$/);
      if (matches) {
        config[matches[1]] = matches[2];
      }
    });
  });

  return config;
}

exports.onChange = (event) => {
  const pubsubMessage = event.data;
  const jsonStr = Buffer.from(pubsubMessage.data, 'base64').toString();
  const build = JSON.parse(jsonStr);
  const config = detectRepoConfig(build);

  config.STATE = STATUS_MAP[pubsubMessage.attributes.status];
  config.DESCRIPTION = DESCRIPTION_MAP[pubsubMessage.attributes.status];
  config.LOG_URL = build.logUrl;

  if (config.CI && config.CI !== 'false' && config.LOG_URL &&
    config.STATE && config.DESCRIPTION && config.REPO_PATH && config.SHA &&
    config.REPO_PATH !== 'UNKNOWN' && config.SHA !== 'UNKNOWN') {
    return createStatus(config);
  }

  return Promise.resolve();
};
