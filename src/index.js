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

const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const got = require('got');
const net = require('net');
const path = require('path');
const proxyquire = require('proxyquire').noPreserveCache();
const sinon = require(`sinon`);
const supertest = require('supertest');

const { install } = require('./api/testRunner');
const { onChange } = require('./webhook');

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
const triedPorts = {};

function getPort (config) {
  let port = config.port || portrange;

  triedPorts[port] = true;

  while (triedPorts[port]) {
    port += 1;
  }

  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => {
        resolve(port);
      });
      server.close();
    });
    server.on('error', () => {
      resolve(getPort(config));
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

exports.install = install;
exports.testInstallation = install;

exports.testLocalApp = (config, done) => {
  return new Promise((resolve, reject) => {
    log(config, 'GETTING PORT...');
    getPort(config).then((port) => {
      log(config, `GOT PORT ${port}...`);
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

      const proc = childProcess.spawn(config.cmd || 'npm', config.args || ['start'], opts);
      log(config, `PID: ${proc.pid}`);

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
        if (err) {
          log(config, `ERROR: ${err.message}`);
        } else {
          log(config, 'DONE');
        }

        try {
          process.kill(proc.pid, 'SIGKILL');
        } catch (err) {
          // Ignore error
        }
        try {
          proc.kill('SIGKILL');
        } catch (err) {
          // Ignore error
        }
        if (!calledDone) {
          calledDone = true;
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

exports.onChange = onChange;

exports.run = (cmd, cwd) => {
  return childProcess.execSync(cmd, { cwd: cwd }).toString().trim();
};

exports.runAsync = (cmd, cwd, cb) => {
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, { cwd: cwd }, (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }
      if (stdout) {
        resolve(stdout.toString().trim());
      } else {
        resolve(stdout);
      }
    });
  });
};

class Try {
  constructor (test) {
    this._maxTries = 10;
    this._maxDelay = 20000;
    this._timeout = 60000;
    this._iteration = 1;
    this._multiplier = 1.3;
    this._delay = 500;
    this._test = test;
  }

  execute () {
    if (this._iteration >= this._maxTries) {
      return this.reject(this._error || new Error('Reached maximum number of tries'));
    } else if ((Date.now() - this._start) >= this._timeout) {
      return this.reject(this._error || new Error('Test timed out'));
    }

    return Promise.resolve()
      .then(() => this._test(assert))
      .then(() => this.resolve())
      .catch((err) => {
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

  timeout (timeout) {
    this._timeout = timeout;
  }

  tries (maxTries) {
    this._maxTries = maxTries;
  }

  start () {
    this._start = Date.now();
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.execute().then(resolve, reject);
    });
    return this.promise;
  }
}

exports.tryTest = (test) => {
  return new Try(test);
};

exports.stubConsole = () => {
  if (typeof console.log.restore !== `function` && typeof console.error.restore !== `function`) {
    if (process.env.DEBUG) {
      sinon.spy(console, `error`);
      sinon.spy(console, `log`);
    } else {
      sinon.stub(console, `error`);
      sinon.stub(console, `log`).callsFake((a, b, c) => {
        if (typeof a === `string` && a.indexOf(`\u001b`) !== -1 && typeof b === `string`) {
          console.log.apply(console, arguments);
        }
      });
    }
  }
};

exports.restoreConsole = () => {
  if (typeof console.log.restore === `function`) {
    console.log.restore();
  }
  if (typeof console.error.restore === `function`) {
    console.error.restore();
  }
};

exports.checkCredentials = (t) => {
  if (t && typeof t.truthy === 'function') {
    t.truthy(process.env.GCLOUD_PROJECT, `Must set GCLOUD_PROJECT environment variable!`);
    t.truthy(process.env.GOOGLE_APPLICATION_CREDENTIALS, `Must set GOOGLE_APPLICATION_CREDENTIALS environment variable!`);
  } else {
    assert(process.env.GCLOUD_PROJECT, `Must set GCLOUD_PROJECT environment variable!`);
    assert(process.env.GOOGLE_APPLICATION_CREDENTIALS, `Must set GOOGLE_APPLICATION_CREDENTIALS environment variable!`);
  }
};
