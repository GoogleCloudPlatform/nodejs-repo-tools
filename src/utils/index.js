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

const got = require('got');
const net = require('net');

const { spawn } = require('child_process');

const MAX_TRIES = 8;

exports.getUrl = (version, project) => {
  return `https://${version}-dot-${project}.appspot-preview.com`;
};

exports.finalize = (err, resolve, reject) => {
  if (err) {
    reject(err);
  } else {
    resolve();
  }
};

exports.error = (config, ...args) => {
  console.error(`${(typeof config === 'string' ? config : config.test).bold.red}:`, ...(args.map((arg) => {
    if (arg.red) {
      return arg.red;
    }
    return arg;
  })));
};

exports.log = (config, ...args) => {
  console.log(`${(typeof config === 'string' ? config : config.test).bold}:`, ...args);
};

let portrange = 45032;
const triedPorts = {};

exports.getPort = (config) => {
  let port = config.port || portrange;

  while (triedPorts[port]) {
    port += 1;
  }

  triedPorts[port] = true;

  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => {
        resolve(port);
      });
      server.close();
    });
    server.on('error', () => {
      resolve(exports.getPort(config));
    });
  });
};

exports.testRequest = (url, config, numTry) => {
  exports.log('app', 'Verifying', url.yellow);
  if (!numTry) {
    numTry = 1;
  }

  let canTryAgain = false;

  return got(url, {
    timeout: 10000
  })
    .then((response) => {
      const EXPECTED_STATUS_CODE = config.code || 200;

      const body = response.body || '';
      const code = response.statusCode;

      if (code !== EXPECTED_STATUS_CODE) {
        canTryAgain = true;
        throw new Error(`failed verification!\nExpected status code: ${EXPECTED_STATUS_CODE}\nActual: ${code}`);
      } else if (config.msg && !body.includes(config.msg)) {
        throw new Error(`failed verification!\nExpected body: ${config.msg}\nActual: ${body}`);
      } else if (config.testStr && !config.testStr.test(body)) {
        throw new Error(`failed verification!\nExpected body: ${config.testStr}\nActual: ${body}`);
      }
    }, (err) => {
      canTryAgain = true;
      if (err && err.response) {
        const EXPECTED_STATUS_CODE = config.code || 200;

        const body = err.response.body || '';
        const code = err.response.statusCode;

        if (code !== EXPECTED_STATUS_CODE) {
          throw new Error(`failed verification!\nExpected status code: ${EXPECTED_STATUS_CODE}\nActual: ${code}`);
        } else if (config.msg && !body.includes(config.msg)) {
          throw new Error(`failed verification!\nExpected body: ${config.msg}\nActual: ${body}`);
        } else if (config.testStr && !config.testStr.test(body)) {
          throw new Error(`failed verification!\nExpected body: ${config.testStr}\nActual: ${body}`);
        }
      } else {
        return Promise.reject(err);
      }
    })
    .catch((err) => {
      if (numTry >= MAX_TRIES || !canTryAgain) {
        return Promise.reject(err);
      }

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          exports.testRequest(url, config, numTry + 1).then(resolve, reject);
        }, 500 * Math.pow(numTry, 2));
      });
    });
};

// Delete an App Engine version
exports.deleteVersion = (config) => {
  return new Promise((resolve, reject) => {
    const cmd = config.deleteCmd || 'gcloud';

    exports.log(config, 'Deleting deployment...');
    // Keep track off whether "done" has been called yet
    let calledDone = false;

    const args = [
      `app`,
      `versions`,
      `delete`,
      config.test,
      `--project=${config.projectId}`,
      `-q`
    ];

    const child = spawn(cmd, args, {
      cwd: config.cwd,
      // Shouldn't take more than 4 minutes to delete a deployed version
      timeout: 4 * 60 * 1000
    });

    exports.log(config, `Delete command: ${(cmd + ' ' + args.join(' ')).yellow}`);

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
        exports.finalize(err, resolve, reject);
      }
    }
  });
};
