// Copyright 2015-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var fs = require('fs');
var path = require('path');
var request = require('request');
var spawn = require('child_process').spawn;
var supertest = require('supertest');
var proxyquire = require('proxyquire').noPreserveCache();

var cwd = process.cwd();
var projectId = process.env.GCLOUD_PROJECT;

function getPath (dir) {
  return path.join(cwd, dir);
}

// Retry the request using exponential backoff up to a maximum number of tries.
function makeRequest (url, numTry, maxTries, cb) {
  request(url, function (err, res, body) {
    if (err) {
      if (numTry >= maxTries) {
        return cb(err);
      }
      setTimeout(function () {
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
  // Try up to 8 times
  makeRequest(url, 1, 8, function (err, res, body) {
    if (err) {
      // Request error
      return cb(err);
    }
    if (body && body.indexOf(config.msg) !== -1 &&
          (res.statusCode === 200 || res.statusCode === config.code) &&
          (!config.testStr || config.testStr.test(body))) {
      // Success
      return cb();
    }
    // Short-circuit app test
    var message = config.dir + ': failed verification!\n' +
                  'Expected: ' + config.msg + '\n' +
                  'Actual: ' + body;

    // Response body did not match expected
    cb(new Error(message));
  });
}

function getUrl (config) {
  return 'http://' + config.test + '-dot-' + projectId + '.appspot.com';
}

exports.getRequest = function (config) {
  if (process.env.E2E_TESTS) {
    return supertest(getUrl(config));
  }
  return supertest(proxyquire(path.join(config.cwd, 'app'), {}));
};

exports.testInstallation = function testInstallation (config, done) {
  // Keep track off whether "done" has been called yet
  var calledDone = false;

  var proc = spawn('npm', ['install', '--update-binary'], {
    cwd: config.cwd
  });

  proc.on('error', finish);

  proc.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  proc.on('exit', function (code) {
    if (code !== 0) {
      finish(new Error(config.test + ': failed to install dependencies!'));
    } else {
      finish();
    }
  });

  // Exit helper so we don't call "cb" more than once
  function finish (err) {
    if (!calledDone) {
      calledDone = true;
      done(err);
    }
  }
};

exports.testLocalApp = function testLocalApp (config, done) {
  var calledDone = false;

  var opts = {
    cwd: config.cwd
  };
  if (config.env) {
    opts.env = {};
    for (var key in process.env) {
      if (process.env.hasOwnProperty(key)) {
        opts.env[key] = process.env[key];
      }
    }
    for (key in config.env) {
      if (config.env.hasOwnProperty(key)) {
        opts.env[key] = config.env[key];
      }
    }
  }
  var proc = spawn(config.cmd, config.args, opts);

  proc.on('error', finish);

  if (!process.env.TRAVIS) {
    proc.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });
  }

  var requestErr;

  proc.on('exit', function (code, signal) {
    if (code !== 0 && signal !== 'SIGKILL') {
      return finish(new Error(config.test + ': failed to run!'));
    } else {
      return finish(requestErr);
    }
  });

  // Give the server time to start up
  setTimeout(function () {
    // Test that the app is working
    testRequest(config.url || 'http://localhost:8080', config, function (err) {
      requestErr = err;
      proc.kill('SIGKILL');
      setTimeout(function () {
        return finish(requestErr);
      }, 1000);
    });
  }, 3000);

  // Exit helper so we don't call "cb" more than once
  function finish (err) {
    if (!calledDone) {
      calledDone = true;
      done(err);
    }
  }
};

exports.testDeploy = function (config, done) {
  // Keep track off whether "done" has been called yet
  var calledDone = false;
  // Keep track off whether the logs have fully flushed
  var logFinished = false;

  // Manually set # of instances to 1
  // changeScaling(config.test);

  var args = [
    'preview',
    'app',
    'deploy',
    config.yaml || 'app.yaml',
    // Skip prompt
    '-q',
    '--project',
    projectId,
    // Deploy over existing version so we don't have to clean up
    '--version',
    config.test,
    config.promote ? '--promote' : '--no-promote',
    // Build locally, much faster
    // '--docker-build',
    // 'local',
    '--verbosity',
    'debug'
  ];

  var logFile = path.join(cwd, config.test + '-' + new Date().getTime()) + '.txt';
  var logStream = fs.createWriteStream(logFile, { flags: 'a' });

  // Don't use "npm run deploy" because we need extra flags
  var proc = spawn('gcloud', args, {
    cwd: config.cwd
  });

  console.log(config.test + ': Deploying app...');
  console.log(config.test + ': ' + config.cwd);
  console.log(config.test + ': ', args.join(' '));
  // Exit helper so we don't call "done" more than once
  function finish (err) {
    if (!calledDone) {
      calledDone = true;
      if (err) {
        return done(err);
      }
      if (logFinished) {
        return done();
      }
      var intervalId = setInterval(function () {
        if (logFinished) {
          clearInterval(intervalId);
          done();
        }
      }, 1000);
    }
  }

  var numEnded = 0;

  function finishLogs () {
    numEnded++;
    if (numEnded === 2) {
      logStream.end();
      console.log(config.test + ': Saved logfile: ' + logFile);
    }
  }

  try {
    logStream.on('finish', function () {
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
    proc.on('exit', function (code, signal) {
      if (signal === 'SIGKILL') {
        console.log(config.test + ': SIGKILL received!');
      }
      if (code !== 0 && signal !== 'SIGKILL') {
        // Deployment failed
        console.log(config.test + ': ERROR', code, signal);

        // Pass error as second argument so we don't short-circuit the
        // parallel tasks
        return finish(new Error(config.test + ': failed to deploy!'));
      } else {
        // Deployment succeeded
        console.log(config.test + ': App deployed...');

        // Give apps time to start
        setTimeout(function () {
          // Test versioned url of "default" module
          var demoUrl = 'http://' + config.test + '-dot-' + projectId +
            '.appspot.com';

          if (config.demoUrl) {
            demoUrl = config.demoUrl;
          }

          // Test that app is running successfully
          console.log(config.test + ': Testing ' + demoUrl);
          testRequest(demoUrl, config, function (err) {
            if (!err) {
              console.log(config.test + ': Success!');
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
};
