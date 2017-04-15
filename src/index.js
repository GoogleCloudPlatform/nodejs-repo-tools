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

require('colors');

const childProcess = require('child_process');
const fs = require('fs');
const got = require('got');
const net = require('net');
const path = require('path');
const proxyquire = require('proxyquire').noPreserveCache();
const supertest = require('supertest');

const MAX_TRIES = 8;
const PROJECT_ID = process.env.GCLOUD_PROJECT;

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

function log (config, msg) {
  console.log(`${config.test.bold}: ${msg}`);
}

// Retry the request using exponential backoff up to a maximum number of tries.
function makeRequest (url, numTry) {
  if (!numTry) {
    numTry = 1;
  }

  return got(url)
    .catch((err) => {
      if (numTry >= MAX_TRIES) {
        return Promise.reject(err);
      }

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          makeRequest(url, numTry + 1).then(resolve, reject);
        }, 500 * Math.pow(numTry, 2));
      });
    });
}

// Send a request to the given url and test that the response body has the
// expected value
function testRequest (url, config) {
  log(config, `VERIFYING: ${url}`);

  return makeRequest(url)
    .then((response) => {
      const EXPECTED_STATUS_CODE = config.code || 200;

      const body = response.body || '';
      const code = response.statusCode;

      if (code !== EXPECTED_STATUS_CODE) {
        throw new Error(`${config.test}: failed verification!\nExpected status code: ${EXPECTED_STATUS_CODE}\nActual: ${code}`);
      } else if (!body.includes(config.msg)) {
        throw new Error(`${config.test}: failed verification!\nExpected body: ${config.msg}\nActual: ${body}`);
      } else if (config.testStr && !config.testStr.test(body)) {
        throw new Error(`${config.test}: failed verification!\nExpected body: ${config.testStr}\nActual: ${body}`);
      }
    });
}

function getUrl (config) {
  return `https://${config.test}-dot-${PROJECT_ID}.appspot-preview.com`;
}

let portrange = 45032;
// Only let one client request a port at a time
let portAccess = false;

function getPort () {
  if (portAccess) {
    return new Promise((resolve) => {
      setTimeout(() => getPort().then(resolve), 500);
    });
  }
  portAccess = true;
  const port = portrange;
  portrange += 1;
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => {
        portAccess = false;
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
  return new Promise((resolve, reject) => {
    log(config, 'DELETING DEPLOYMENT...');
    // Keep track off whether "done" has been called yet
    let calledDone = false;

    const args = [
      `app`,
      `versions`,
      `delete`,
      config.test,
      `--project=${PROJECT_ID}`,
      `-q`
    ];

    const child = childProcess.spawn(`gcloud`, args, {
      cwd: config.cwd,
      // Shouldn't take more than 4 minutes to delete a deployed version
      timeout: 4 * 60 * 1000
    });

    log(config, `gcloud ${args.join(' ')}`);

    child.on('error', finish);

    child.stdout.on('data', (data) => {
      const str = data.toString();
      if (str.includes('\n')) {
        process.stdout.write(`${config.test.bold}: ${str}`);
      } else {
        process.stdout.write(str);
      }
    });
    child.stderr.on('data', (data) => {
      const str = data.toString();
      if (str.includes('\n')) {
        process.stderr.write(`${config.test.bold}: ${str}`);
      } else {
        process.stderr.write(str);
      }
    });

    child.on('exit', (code) => {
      if (code !== 0) {
        finish(new Error(`${config.test}: failed to delete deployment!`));
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

exports.getRequest = (config) => {
  if (process.env.E2E_TESTS) {
    return supertest(getUrl(config));
  }
  return supertest(proxyquire(path.join(config.cwd, 'app'), {}));
};

exports.testInstallation = (config, done) => {
  return new Promise((resolve, reject) => {
    log(config, 'TESTING INSTALLATION...');
    // Keep track off whether "done" has been called yet
    let calledDone = false;

    const proc = childProcess.spawn('yarn', ['install'], {
      cwd: config.cwd
    });

    proc.on('error', finish);

    proc.stdout.on('data', (data) => {
      process.stdout.write(`${config.test.bold}: ${data.toString()}`);
    });
    proc.stderr.on('data', (data) => {
      process.stderr.write(`${config.test.bold}: ${data.toString()}`);
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
      opts.env.PORT = opts.env.PORT || config.port || port;

      const proc = childProcess.spawn(config.cmd || 'yarn', config.args || ['start'], opts);

      proc.on('error', finish);

      proc.stdout.on('data', (data) => {
        process.stdout.write(`${config.test.bold}: ${data.toString()}`);
      });
      proc.stderr.on('data', (data) => {
        process.stderr.write(`${config.test.bold}: ${data.toString()}`);
      });

      let requestErr;

      proc.on('exit', (code, signal) => {
        if (code !== 0 && signal !== 'SIGKILL') {
          finish(new Error(`${config.test}: failed to run!`));
        } else {
          finish(requestErr);
        }
      });

      // Give the server time to start up
      setTimeout(() => {
        // Test that the app is working
        testRequest(config.url || `http://localhost:${config.port || port}`, config)
          .then(() => finish(), (err) => {
            requestErr = err;
            finish(requestErr);
          });
      }, 3000);

      // Exit helper so we don't call "cb" more than once
      function finish (err) {
        if (!calledDone) {
          calledDone = true;
          try {
            proc.kill('SIGKILL');
          } catch (err) {
            // Ignore error
          }
          setTimeout(() => finalize(err, resolve, reject, done), 1000);
        }
      }
    });
  });
};

function changeScaling (config, yamlName) {
  const oldYamlPath = path.join(config.cwd, yamlName);
  const newYamlPath = path.join(config.cwd, `${config.test}-${config.now}.yaml`);

  let yaml = fs.readFileSync(oldYamlPath, 'utf8');

  yaml += `\n\nmanual_scaling:\n  instances: 1\n`;

  fs.writeFileSync(newYamlPath, yaml, 'utf8');

  return newYamlPath;
}

exports.testDeploy = (config, done) => {
  return new Promise((resolve, reject) => {
    config.now = Date.now();
    log(config, 'DEPLOYING...');
    // Keep track off whether "done" has been called yet
    let calledDone = false;
    // Keep track off whether the logs have fully flushed
    let logFinished = false;

    // Manually set # of instances to 1
    const tmpAppYaml = changeScaling(config, config.yaml || 'app.yaml');

    const args = [
      'app',
      'deploy',
      path.parse(tmpAppYaml).base,
      // Skip prompt
      '-q',
      `--project=${PROJECT_ID}`,
      // Deploy over existing version so we don't have to clean up
      `--version=${config.test}`,
      '--no-promote'
    ];

    const logFile = path.join(config.cwd, `${config.test}-${config.now}.log`);
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });

    // Don't use "npm run deploy" because we need extra flags
    const proc = childProcess.spawn('gcloud', args, {
      cwd: config.cwd,
      shell: true
    });

    log(config, `gcloud ${args.join(' ')}`);

    // Exit helper so we don't call "done" more than once
    function finish (err) {
      try {
        fs.unlinkSync(tmpAppYaml);
      } catch (err) {
        // Ignore error
      }

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

      proc.stdout.on('data', (data) => {
        const str = data.toString();
        if (str.includes('\n')) {
          process.stdout.write(`${config.test.bold}: ${str}`);
        } else {
          process.stdout.write(str);
        }
      });
      proc.stderr.on('data', (data) => {
        const str = data.toString();
        if (str.includes('\n')) {
          process.stderr.write(`${config.test.bold}: ${str}`);
        } else {
          process.stderr.write(str);
        }
      });

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
            testRequest(demoUrl, config)
              .then(() => {
                log(config, 'Success!');
                finish();
              }, finish);
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
