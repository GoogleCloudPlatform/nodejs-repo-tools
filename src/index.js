/**
 * Copyright 2018, Google LLC.
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

const colors = require('colors');

const assert = require('assert');
const childProcess = require('child_process');
const path = require('path');
const proxyquire = require('proxyquire').noPreserveCache();
const sinon = require('sinon');
const supertest = require('supertest');

const utils = (exports.utils = require('./utils'));

exports.buildPacks = require('./build_packs');

exports.getRequest = config => {
  if (process.env.TEST_URL || config.testUrl) {
    return supertest(process.env.TEST_URL || config.testUrl);
  } else if (process.env.E2E_TESTS) {
    return supertest(utils.getUrl(config));
  }
  return supertest(
    proxyquire(path.join(config.cwd, config.cmd || 'app'), {
      process: {
        env: config.env || process.env,
      },
    })
  );
};

exports.run = (cmd, cwd) => {
  const output = childProcess
    .execSync(cmd, {cwd: cwd, shell: true})
    .toString()
    .trim();
  try {
    return colors.strip(output);
  } catch (err) {
    return output;
  }
};

exports.runAsync = (cmd, cwd) => {
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, {cwd: cwd, shell: true}, (err, stdout) => {
      if (err) {
        reject(err);
        return;
      }
      if (stdout) {
        const output = stdout.toString().trim();
        try {
          resolve(colors.strip(output));
        } catch (err) {
          resolve(output);
        }
      } else {
        resolve(stdout);
      }
    });
  });
};

exports.runAsyncWithIO = (cmd, cwd) => {
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, {cwd: cwd, shell: true}, (err, stdout, stderr) => {
      const result = {
        err: err,
        stdout: stdout ? stdout.toString().trim() : null,
        stderr: stderr ? stderr.toString().trim() : null,
      };
      result.output = (result.stdout || '') + (result.stderr || '');
      if (err) {
        reject(result);
        return;
      }
      try {
        if (result.stderr) {
          result.stderr = colors.strip(result.stderr);
        }
        if (result.stdout) {
          result.stdout = colors.strip(result.stdout);
        }
        if (result.output) {
          result.output = colors.strip(result.output);
        }
        resolve(result);
      } catch (err) {
        resolve(result);
      }
    });
  });
};

exports.spawnAsyncWithIO = (cmd, args, cwd, debug) => {
  args || (args = []);
  let opts = debug;
  if (typeof opts === 'boolean') {
    opts = {debug: true};
  }
  opts || (opts = {});
  return new Promise((resolve, reject) => {
    let done = false;
    let stdout = '';
    let stderr = '';

    function finish(err) {
      if (!done) {
        done = true;
        const results = {
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          output: stdout.trim() + stderr.trim(),
          err: err,
        };
        try {
          if (results.stderr) {
            results.stderr = colors.strip(results.stderr);
          }
          if (results.stdout) {
            results.stdout = colors.strip(results.stdout);
          }
          if (results.output) {
            results.output = colors.strip(results.output);
          }
        } catch (err) {
          // Do nothing
        }
        if (err) {
          reject(results);
        } else {
          resolve(results);
        }
      }
    }

    if (debug || (debug !== false && process.env.DEBUG)) {
      utils.logger.log('CMD', cmd, ...args);
    }
    const child = childProcess.spawn(cmd, args, {cwd: cwd, shell: true});
    child.stdout.on('data', chunk => {
      if (debug || (debug !== false && process.env.DEBUG)) {
        utils.logger.log('stdout', chunk.toString());
      }
      stdout += chunk.toString();
    });
    child.stderr.on('data', chunk => {
      utils.logger.error('stderr', chunk.toString());
      stderr += chunk.toString();
    });
    child
      .on('error', finish)
      .on('close', () => {
        finish();
      })
      .on('exit', () => {
        finish();
      });
  });
};

class Try {
  constructor(test) {
    this._maxTries = 10;
    this._maxDelay = 20000;
    this._timeout = 60000;
    this._iteration = 1;
    this._multiplier = 1.3;
    this._delay = 500;
    this._test = test;
  }

  execute() {
    if (this._iteration >= this._maxTries) {
      return this.reject(
        this._error || new Error('Reached maximum number of tries')
      );
    } else if (Date.now() - this._start >= this._timeout) {
      return this.reject(this._error || new Error('Test timed out'));
    }

    return Promise.resolve()
      .then(() => this._test(assert))
      .then(() => this.resolve())
      .catch(err => {
        this._error = err;
        this._iteration++;
        this._delay = Math.min(this._delay * this._multiplier, this._maxDelay);
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            Promise.resolve()
              .then(() => this.execute())
              .then(resolve, reject);
          }, this._delay);
        });
      });
  }

  timeout(timeout) {
    this._timeout = timeout;
  }

  tries(maxTries) {
    this._maxTries = maxTries;
  }

  start() {
    this._start = Date.now();
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.execute().then(resolve, reject);
    });
    return this.promise;
  }
}

exports.tryTest = test => {
  return new Try(test);
};

exports.stubConsole = () => {
  /* eslint-disable no-console */
  if (
    typeof console.log.restore !== `function` &&
    typeof console.error.restore !== `function`
  ) {
    if (process.env.DEBUG) {
      sinon.spy(console, `error`);
      sinon.spy(console, `log`);
    } else {
      sinon.stub(console, `error`);
      sinon.stub(console, `log`).callsFake((a, b) => {
        if (
          typeof a === `string` &&
          a.indexOf(`\u001b`) !== -1 &&
          typeof b === `string`
        ) {
          console.log.apply(console, arguments);
        }
      });
    }
  }
  /* eslint-enable no-console */
};

exports.restoreConsole = () => {
  /* eslint-disable no-console */
  if (typeof console.log.restore === `function`) {
    console.log.restore();
  }
  if (typeof console.error.restore === `function`) {
    console.error.restore();
  }
  /* eslint-enable no-console */
};

exports.checkCredentials = t => {
  if (t && typeof t.truthy === 'function') {
    t.truthy(
      process.env.GCLOUD_PROJECT,
      `Must set GCLOUD_PROJECT environment variable!`
    );
    t.truthy(
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      `Must set GOOGLE_APPLICATION_CREDENTIALS environment variable!`
    );
  } else {
    assert(
      process.env.GCLOUD_PROJECT,
      `Must set GCLOUD_PROJECT environment variable!`
    );
    assert(
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      `Must set GOOGLE_APPLICATION_CREDENTIALS environment variable!`
    );
    if (typeof t === 'function') {
      t();
    }
  }
};
