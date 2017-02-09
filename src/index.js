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

'use strict';

const fs = require('fs');
const path = require('path');
const request = require('request');
const childProcess = require('child_process');
const net = require('net');
const spawn = childProcess.spawn;
const exec = childProcess.exec;
const supertest = require('supertest');
const proxyquire = require('proxyquire').noPreserveCache();

const projectId = process.env.GCLOUD_PROJECT;

function finalize (err, resolve, reject, done) {
  if (err) {
    reject(err);
    if (typeof done === 'function') {
      done(err);
    }
  } else {
    resolve();
    if (typeof done === 'function') {
      done();
    }
  }
}

// Retry the request using exponential backoff up to a maximum number of tries.
function makeRequest (url, numTry, maxTries, cb) {
  request(url, (err, res, body) => {
    if (err) {
      if (numTry >= maxTries) {
        cb(err);
        return;
      }
      setTimeout(() => {
        makeRequest(url, numTry + 1, maxTries, cb);
      }, 500 * Math.pow(numTry, 2));
    } else {
      cb(null, res, body);
    }
  });
}

// Send a request to the given url and test that the response body has the
// expected value
function testRequest (url, config, cb) {
  log(config, `VERIFYING: ${url}`);
  // Try up to 8 times
  makeRequest(url, 1, 8, (err, res, body) => {
    if (err) {
      // Request error
      cb(err);
      return;
    }
    if (body && body.indexOf(config.msg) !== -1 &&
          (res.statusCode === 200 || res.statusCode === config.code) &&
          (!config.testStr || config.testStr.test(body))) {
      // Success
      cb();
      return;
    }
    // Short-circuit app test
    const message = `${config.dir}: failed verification!
                  Expected: ${config.msg}
                  Actual: ${body}`;

    // Response body did not match expected
    cb(new Error(message));
  });
}

function getUrl (config) {
  return `https://${config.test}-dot-${projectId}.appspot-preview.com`;
}

function log (config, msg) {
  console.log(`${config.test}: ${msg}`);
}

let portrange = 45032;

function getPort () {
  return new Promise((resolve, reject) => {
    const port = portrange;
    portrange += 1;

    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => {
        resolve(port);
      });
      server.close();
    });
    server.on('error', () => {
      resolve(getPort());
    });
  });
}

// Delete an App Engine version
exports.deleteVersion = (config, done) => {
  return new Promise((resolve) => {
    log(config, 'DELETING DEPLOYMENT...');
    exec(`gcloud app versions delete ${config.test} --project ${projectId} -q`, {
      cwd: config.cwd
    }, (err, result) => {
      console.log(err);
      // Ignore error
      finalize(null, resolve, null, done);
    });
  });
};

exports.getRequest = (config) => {
  if (process.env.E2E_TESTS) {
    return supertest(getUrl(config));
  }
  return supertest(proxyquire(path.join(config.cwd, 'app'), {}));
};

exports.testInstallation = (config, done) => {
  return new Promise((resolve, reject) => {
    console.log(`${config.test}: TESTING INSTALLATION...`);
    // Keep track off whether "done" has been called yet
    let calledDone = false;

    const proc = spawn('yarn', ['install'], {
      cwd: config.cwd
    });

    proc.on('error', finish);

    proc.stdout.on('data', (data) => {
      process.stdout.write(`${config.test}: ${data.toString()}`);
    });
    proc.stderr.on('data', (data) => {
      process.stderr.write(`${config.test}: ${data.toString()}`);
    });

    proc.on('exit', (code) => {
      if (code !== 0) {
        finish(new Error(`${config.test}: failed to install dependencies!`));
      } else {
        finish();
      }
    });

    // Exit helper so we don't call "cb" more than once
    function finish (err) {
      if (!calledDone) {
        calledDone = true;
        finalize(err, resolve, reject, done);
      }
    }
  });
};

exports.testLocalApp = (config, done) => {
  return new Promise((resolve, reject) => {
    getPort().then((port) => {
      log(config, 'TESTING LOCAL APP...');
      let calledDone = false;

      const opts = {
        cwd: config.cwd
      };

      opts.env = Object.assign({}, process.env);
      if (config.env) {
        Object.assign(opts.env, config.env);
      }
      opts.env.PORT = config.port || port;

      const proc = spawn(config.cmd || 'yarn', config.args || ['start'], opts);

      proc.on('error', finish);

      proc.stdout.on('data', (data) => {
        process.stdout.write(`${config.test}: ${data.toString()}`);
      });
      proc.stderr.on('data', (data) => {
        process.stderr.write(`${config.test}: ${data.toString()}`);
      });

      let requestErr;

      proc.on('exit', (code, signal) => {
        if (code !== 0 && signal !== 'SIGKILL') {
          finish(new Error(`${config.test}: failed to run!`));
          return;
        } else {
          finish(requestErr);
          return;
        }
      });

      // Give the server time to start up
      setTimeout(() => {
        // Test that the app is working
        testRequest(config.url || `http://localhost:${config.port || port}`, config, (err) => {
          requestErr = err;
          proc.kill('SIGKILL');
          setTimeout(() => {
            finish(requestErr);
          }, 1000);
        });
      }, 3000);

      // Exit helper so we don't call "cb" more than once
      function finish (err) {
        if (!calledDone) {
          calledDone = true;
          finalize(err, resolve, reject, done);
        }
      }
    });
  });
};

exports.testDeploy = (config, done) => {
  return new Promise((resolve, reject) => {
    log(config, 'DEPLOYING...');
    // Keep track off whether "done" has been called yet
    let calledDone = false;
    // Keep track off whether the logs have fully flushed
    let logFinished = false;

    // Manually set # of instances to 1
    // changeScaling(config.test);

    const args = [
      'app',
      'deploy',
      config.yaml || 'app.yaml',
      // Skip prompt
      '-q',
      `--project=${projectId}`,
      // Deploy over existing version so we don't have to clean up
      `--version=${config.test}`,
      '--no-promote'
    ];

    const logFile = path.join(config.cwd, `${config.test}-${Date.now()}.log`);
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });

    // Don't use "npm run deploy" because we need extra flags
    const proc = spawn('gcloud', args, {
      cwd: config.cwd,
      shell: true
    });

    log(config, `gcloud ${args.join(' ')}`);

    // Exit helper so we don't call "done" more than once
    function finish (err) {
      if (!calledDone) {
        calledDone = true;
        if (err) {
          finalize(err, resolve, reject, done);
          return;
        }
        if (logFinished) {
          finalize(null, resolve, reject, done);
          return;
        }
        const intervalId = setInterval(() => {
          if (logFinished) {
            clearInterval(intervalId);
            finalize(null, resolve, reject, done);
          }
        }, 1000);
      }
    }

    let numEnded = 0;

    function finishLogs () {
      numEnded++;
      if (numEnded === 2) {
        logStream.end();
        log(config, `Saved logfile to ${logFile}`);
      }
    }

    try {
      logStream.on('finish', () => {
        if (!logFinished) {
          logFinished = true;
        }
      });

      proc.stdout.pipe(logStream, { end: false });
      proc.stderr.pipe(logStream, { end: false });

      proc.stdout.on('end', finishLogs);
      proc.stderr.on('end', finishLogs);

      // This is called if the process fails to start. "error" event may or may
      // not be fired in addition to the "exit" event.
      proc.on('error', finish);

      // Process has completed
      proc.on('exit', (code, signal) => {
        if (signal === 'SIGKILL') {
          log(config, 'SIGKILL received!');
        }
        if (code !== 0 && signal !== 'SIGKILL') {
          // Deployment failed
          log(config, `ERROR ${code} ${signal}`);

          // Pass error as second argument so we don't short-circuit the
          // parallel tasks
          finish(new Error(`${config.test}: failed to deploy!`));
          return;
        } else {
          // Deployment succeeded
          log(config, 'App deployed...');

          // Give apps time to start
          setTimeout(() => {
            // Test versioned url of "default" module
            let demoUrl = getUrl(config);

            if (config.demoUrl) {
              demoUrl = config.demoUrl;
            }

            // Test that app is running successfully
            log(config, `Testing ${demoUrl}`);
            testRequest(demoUrl, config, (err) => {
              if (!err) {
                log(config, 'Success!');
              }
              finish(err);
            });
          }, 5000);
        }
      });
    } catch (err) {
      if (proc) {
        proc.kill('SIGKILL');
      }
      finish(err);
    }
  });
};
