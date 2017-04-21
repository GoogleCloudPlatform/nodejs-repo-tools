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

exports.getUrl = (config) => {
  return `https://${config.test}-dot-${config.projectId}.appspot-preview.com`;
};

exports.finalize = (err, resolve, reject) => {
  if (err) {
    reject(err);
  } else {
    resolve();
  }
};

exports.error = (config, ...args) => {
  console.error(`${config.test.bold.red}:`, ...(args.map((arg) => {
    if (arg.red) {
      return arg.red;
    }
    return arg;
  })));
};

exports.log = (config, ...args) => {
  console.log(`${config.test.bold}:`, ...args);
};

let portrange = 45032;
const triedPorts = {};

exports.getPort = (config) => {
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
      resolve(exports.getPort(config));
    });
  });
};

exports.testRequest = (url, config, numTry) => {
  exports.log(config, 'Verifying', url.yellow);
  if (!numTry) {
    numTry = 1;
  }

  return got(url)
    .then((response) => {
      const EXPECTED_STATUS_CODE = config.code || 200;

      const body = response.body || '';
      const code = response.statusCode;

      if (code !== EXPECTED_STATUS_CODE) {
        throw new Error(`${config.test}: failed verification!\nExpected status code: ${EXPECTED_STATUS_CODE}\nActual: ${code}`);
      } else if (config.msg && !body.includes(config.msg)) {
        throw new Error(`${config.test}: failed verification!\nExpected body: ${config.msg}\nActual: ${body}`);
      } else if (config.testStr && !config.testStr.test(body)) {
        throw new Error(`${config.test}: failed verification!\nExpected body: ${config.testStr}\nActual: ${body}`);
      }
    }, (err) => {
      if (err && err.response) {
        const EXPECTED_STATUS_CODE = config.code || 200;

        const body = err.response.body || '';
        const code = err.response.statusCode;

        if (code !== EXPECTED_STATUS_CODE) {
          throw new Error(`${config.test}: failed verification!\nExpected status code: ${EXPECTED_STATUS_CODE}\nActual: ${code}`);
        } else if (config.msg && !body.includes(config.msg)) {
          throw new Error(`${config.test}: failed verification!\nExpected body: ${config.msg}\nActual: ${body}`);
        } else if (config.testStr && !config.testStr.test(body)) {
          throw new Error(`${config.test}: failed verification!\nExpected body: ${config.testStr}\nActual: ${body}`);
        }
      } else {
        return Promise.reject(err);
      }
    })
    .catch((err) => {
      if (numTry >= MAX_TRIES) {
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

exports.products = {
  bigquery: {
    name: 'BigQuery',
    description: '' +
    '[BigQuery][bigquery_docs] is Google\'s fully managed, petabyte scale, low cost\n' +
    'analytics data warehouse.\n\n' +
    '[bigquery_docs]: https://cloud.google.com/bigquery/docs/'
  },
  datastore: {
    name: 'Datastore',
    description: '' +
    '[Cloud Datastore][datastore_docs] is a NoSQL document database built for\n' +
    'automatic scaling, high performance, and ease of application development.\n\n' +
    '[datastore_docs]: https://cloud.google.com/datastore/docs/'
  },
  logging: {
    name: 'Stackdriver Logging',
    description: '' +
    '[Stackdriver Logging][logging_docs] allows you to store, search, analyze,\n' +
    'monitor, and alert on log data and events from Google Cloud Platform and Amazon\n' +
    'Web Services.\n\n' +
    '[logging_docs]: https://cloud.google.com/logging/docs/'
  },
  monitoring: {
    name: 'Stackdriver Monitoring',
    description: '' +
    '[Stackdriver Monitoring][monitoring_docs] collects metrics, events, and metadata\n' +
    'from Google Cloud Platform, Amazon Web Services (AWS), hosted uptime probes,\n' +
    'application instrumentation, and a variety of common application components\n' +
    'including Cassandra, Nginx, Apache Web Server, Elasticsearch and many others.\n\n' +
    '[monitoring_docs]: https://cloud.google.com/monitoring/docs/'
  },
  nl: {
    name: 'Google Cloud Natural Language API',
    description: '' +
    '[Cloud Natural Language API][language_docs] provides natural language\n' +
    'understanding technologies to developers, including sentiment analysis, entity\n' +
    'recognition, and syntax analysis. This API is part of the larger Cloud Machine\n' +
    'Learning API.\n\n' +
    '[language_docs]: https://cloud.google.com/natural-language/docs/'
  },
  prediction: {
    name: 'Google Cloud Prediction API',
    description: '' +
    'The [Cloud Prediction API][prediction_docs] provides a RESTful API to build\n' +
    'Machine Learning models.\n\n' +
    '[prediction_docs]: https://cloud.google.com/prediction/docs/'
  },
  pubsub: {
    name: 'Google Cloud Pub/Sub',
    description: '' +
    '[Cloud Pub/Sub][pubsub_docs] is a fully-managed real-time messaging service that\n' +
    'allows you to send and receive messages between independent applications.\n\n' +
    '[pubsub_docs]: https://cloud.google.com/pubsub/docs/'
  },
  resource: {
    name: 'Google Cloud Resource Manager API',
    description: '' +
    'Google Cloud Platform provides container resources such as Organizations and\n' +
    'Projects, that allow you to group and hierarchically organize other Cloud\n' +
    'Platform resources. This hierarchical organization lets you easily manage common\n' +
    'aspects of your resources such as access control and configuration settings. The\n' +
    '[Google Cloud Resource Manager API][resource_docs] enables you to\n' +
    'programmatically manage these container resources.\n\n' +
    '[resource_docs]: https://cloud.google.com/resource-manager/docs/'
  },
  speech: {
    name: 'Google Cloud Speech API',
    description: '' +
    'The [Cloud Speech API][speech_docs] enables easy integration of Google speech\n' +
    'recognition technologies into developer applications.\n\n' +
    '[speech_docs]: https://cloud.google.com/speech/'
  },
  storage: {
    name: 'Google Cloud Storage',
    description: '' +
    '[Cloud Storage][storage_docs] allows world-wide storage and retrieval of any\n' +
    'amount of data at any time.\n\n' +
    '[storage_docs]: https://cloud.google.com/storage/docs/'
  },
  translate: {
    name: 'Google Translate API',
    description: '' +
    'With the [Google Translate API][translate_docs], you can dynamically translate\n' +
    'text between thousands of language pairs.\n\n' +
    '[translate_docs]: https://cloud.google.com/translate/docs/'
  },
  vision: {
    name: 'Google Cloud Vision API',
    description: '' +
    'The [Cloud Vision API][vision_docs] allows developers to easily integrate vision\n' +
    'detection features within applications, including image labeling, face and\n' +
    'landmark detection, optical character recognition (OCR), and tagging of explicit\n' +
    'content.\n\n' +
    '[vision_docs]: https://cloud.google.com/vision/docs/'
  }
};
