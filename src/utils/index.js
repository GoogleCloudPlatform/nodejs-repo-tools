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

'use strict';

require('colors');

const childProcess = require('child_process');
const got = require('got');
const net = require('net');
const url = require('url');

const {spawn} = require('child_process');

const MAX_TRIES = 8;

exports.parseArgs = (args = '') => {
  if (Array.isArray(args)) {
    return args;
  }

  const parsed = [];
  let arg = '';
  let inQuote = false;
  let quoteChar = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === `'`) {
      if (inQuote) {
        if (args[i - 1] === `\\`) {
          arg += args[i];
        } else {
          if (quoteChar === `'`) {
            arg += args[i];
            inQuote = false;
            quoteChar = null;
          } else {
            arg += args[i];
          }
        }
      } else {
        if (args[i - 1] === `\\`) {
          arg += args[i];
        } else {
          arg += args[i];
          quoteChar = `'`;
          inQuote = true;
        }
      }
    } else if (args[i] === `"`) {
      if (inQuote) {
        if (args[i - 1] === `\\`) {
          arg += args[i];
        } else {
          if (quoteChar === `"`) {
            arg += args[i];
            inQuote = false;
            quoteChar = null;
          } else {
            arg += args[i];
          }
        }
      } else {
        if (args[i - 1] === `\\`) {
          arg += args[i];
        } else {
          arg += args[i];
          quoteChar = `"`;
          inQuote = true;
        }
      }
    } else if (/\s/.test(args[i])) {
      if (inQuote) {
        arg += args[i];
      } else if (arg) {
        parsed.push(arg);
        arg = ``;
      } else {
        args = ``;
      }
    } else {
      arg += args[i];
    }

    if (i === args.length - 1) {
      if (inQuote) {
        throw new Error(`Unclosed quote in: ${args}`);
      } else if (arg) {
        parsed.push(arg);
      }
    }
  }

  return parsed;
};

exports.getUrl = opts => {
  return `https://${opts.version}-dot-${opts.project}.appspot.com`;
};

exports.finalize = (err, resolve, reject) => {
  if (err) {
    reject(err);
  } else {
    resolve();
  }
};

const logger = {
  error(config, ...args) {
    // eslint-disable-next-line no-console
    console.error(
      `${(typeof config === 'string' ? config : config.test).bold.red}:`,
      ...args.map(arg => {
        if (arg.red) {
          return arg.red;
        }
        return arg;
      })
    );
  },

  fatal(...args) {
    this.error(...args);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  },

  log(config, ...args) {
    // eslint-disable-next-line no-console
    console.log(
      `${(typeof config === 'string' ? config : config.test).bold}:`,
      ...args
    );
  },

  debug(...args) {
    if (process.argv.indexOf('--debug') !== -1) {
      // eslint-disable-next-line no-console
      console.log('debug'.bold, ...args);
    }
  },
};

exports.logger = logger;

exports.getRepoPath = (repository, cwd) => {
  repository || (repository = {});
  if (typeof repository === 'string') {
    repository = {
      url: repository,
    };
  }

  if (!repository.url) {
    let pushUrl = childProcess
      .execSync('git remote get-url --push origin', {
        cwd,
        stdout: 'silent',
      })
      .toString()
      .trim();
    const start = pushUrl.indexOf('github.com');
    if (start >= 0) {
      pushUrl = pushUrl.substring(start + 11);
      if (pushUrl) {
        return `/${pushUrl.replace('.git', '')}`;
      }
    }
  }

  const result = url.parse(repository.url).path.replace('.git', ''); // eslint-disable-line node/no-deprecated-api
  if (!result.startsWith('/')) {
    return `/${result}`;
  }
  return result;
};

exports.getTimeTaken = start => {
  let timeTaken = (Date.now() - start) / 1000;
  if (timeTaken <= 100) {
    timeTaken = timeTaken.toPrecision(3);
  } else if (timeTaken >= 100) {
    timeTaken = Math.floor(timeTaken);
  }
  return `${timeTaken}s`.cyan;
};

/**
 * Generates a markdown badge for displaying a "Release Quality'.
 *
 * @param {string} releaseQuality One of: (ga, beta, alpha, eap, deprecated).
 * @returns {string} The markdown badge.
 */
exports.createReleaseQualityBadge = releaseQuality => {
  releaseQuality = releaseQuality.toUpperCase();
  let badge = '';
  if (releaseQuality === 'GA') {
    badge = 'general%20availability%20%28GA%29-brightgreen';
  } else if (releaseQuality === 'BETA') {
    badge = 'beta-yellow';
  } else if (releaseQuality === 'ALPHA') {
    badge = 'alpha-orange';
  } else if (releaseQuality === 'EAP') {
    badge = 'EAP-yellow';
  } else if (releaseQuality === 'DEPRECATED') {
    badge = 'deprecated-red';
  } else {
    logger.error(
      'generate',
      `Expected "release_quality" to be one of: (ga, beta, alpha, eap, deprecated)! Actual: "${releaseQuality}"`
    );
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
  return `[![release level](https://img.shields.io/badge/release%20level-${badge}.svg?style=flat)](https://cloud.google.com/terms/launch-stages)`;
};

let portrange = 45032;
const triedPorts = {};

exports.getPort = config => {
  let port = config.port || portrange;

  while (triedPorts[port]) {
    port += 1;
  }

  triedPorts[port] = true;

  return new Promise(resolve => {
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
  logger.log('app', `Verifying: ${url.yellow}`);
  if (!numTry) {
    numTry = 1;
  }

  let canTryAgain = false;

  return got(url, {
    timeout: 10000,
  })
    .then(
      response => {
        const EXPECTED_STATUS_CODE = config.code || 200;

        const body = response.body || '';
        const code = response.statusCode;

        if (code !== EXPECTED_STATUS_CODE) {
          canTryAgain = true;
          throw new Error(
            `failed verification!\nExpected status code: ${EXPECTED_STATUS_CODE}\nActual: ${code}`
          );
        } else if (config.msg && !body.includes(config.msg)) {
          throw new Error(
            `failed verification!\nExpected body: ${
              config.msg
            }\nActual: ${body}`
          );
        } else if (config.testStr && !config.testStr.test(body)) {
          throw new Error(
            `failed verification!\nExpected body: ${
              config.testStr
            }\nActual: ${body}`
          );
        }
      },
      err => {
        canTryAgain = true;
        if (err && err.response) {
          const EXPECTED_STATUS_CODE = config.code || 200;

          const body = err.response.body || '';
          const code = err.response.statusCode;

          if (code !== EXPECTED_STATUS_CODE) {
            throw new Error(
              `failed verification!\nExpected status code: ${EXPECTED_STATUS_CODE}\nActual: ${code}`
            );
          } else if (config.msg && !body.includes(config.msg)) {
            throw new Error(
              `failed verification!\nExpected body: ${
                config.msg
              }\nActual: ${body}`
            );
          } else if (config.testStr && !config.testStr.test(body)) {
            throw new Error(
              `failed verification!\nExpected body: ${
                config.testStr
              }\nActual: ${body}`
            );
          }
        } else {
          return Promise.reject(err);
        }
      }
    )
    .catch(err => {
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
exports.deleteVersion = config => {
  return new Promise((resolve, reject) => {
    const cmd = config.deleteCmd || 'gcloud';

    logger.log(config, 'Deleting deployment...');
    // Keep track off whether "done" has been called yet
    let calledDone = false;

    const args = [
      `app`,
      `versions`,
      `delete`,
      config.test,
      `--project=${config.projectId}`,
      `-q`,
    ];

    const child = spawn(cmd, args, {
      cwd: config.cwd,
      // Shouldn't take more than 4 minutes to delete a deployed version
      timeout: 4 * 60 * 1000,
    });

    logger.log(
      config,
      `Delete command: ${(cmd + ' ' + args.join(' ')).yellow}`
    );

    child.on('error', finish);

    child.stdout.on('data', data => {
      const str = data.toString();
      if (str.includes('\n')) {
        process.stdout.write(`${config.test.bold}: ${str}`);
      } else {
        process.stdout.write(str);
      }
    });
    child.stderr.on('data', data => {
      const str = data.toString();
      if (str.includes('\n')) {
        process.stderr.write(`${config.test.bold}: ${str}`);
      } else {
        process.stderr.write(str);
      }
    });

    child.on('exit', code => {
      if (code !== 0) {
        finish(new Error(`${config.test}: failed to delete deployment!`));
      } else {
        finish();
      }
    });

    // Exit helper so we don't call "cb" more than once
    function finish(err) {
      if (!calledDone) {
        calledDone = true;
        exports.finalize(err, resolve, reject);
      }
    }
  });
};
