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
  bigquery: {
    name: 'BigQuery',
    description: `[BigQuery](https://cloud.google.com/bigquery/docs) is Google's fully managed, petabyte scale, low cost analytics data warehouse.`
  },
  datastore: {
    name: 'Datastore',
    description: `[Cloud Datastore](https://cloud.google.com/datastore/docs) is a NoSQL document database built for automatic scaling, high performance, and ease of application development.`
  },
  logging: {
    name: 'Stackdriver Logging',
    description: `[Stackdriver Logging](https://cloud.google.com/logging/docs) allows you to store, search, analyze, monitor, and alert on log data and events from Google Cloud Platform and Amazon Web Services.`
  },
  monitoring: {
    name: 'Stackdriver Monitoring',
    description: `[Stackdriver Monitoring](https://cloud.google.com/monitoring/docs) collects metrics, events, and metadata from Google Cloud Platform, Amazon Web Services (AWS), hosted uptime probes, application instrumentation, and a variety of common application components including Cassandra, Nginx, Apache Web Server, Elasticsearch and many others.`
  },
  nl: {
    name: 'Google Cloud Natural Language API',
    description: `[Cloud Natural Language API](https://cloud.google.com/natural-language/docs) provides natural language understanding technologies to developers, including sentiment analysis, entity recognition, and syntax analysis. This API is part of the larger Cloud Machine Learning API.`
  },
  prediction: {
    name: 'Google Cloud Prediction API',
    description: `The [Cloud Prediction API](https://cloud.google.com/prediction/docs) provides a RESTful API to build Machine Learning models.`
  },
  pubsub: {
    name: 'Google Cloud Pub/Sub',
    description: `[Cloud Pub/Sub](https://cloud.google.com/pubsub/docs) is a fully-managed real-time messaging service that allows you to send and receive messages between independent applications.`
  },
  resource: {
    name: 'Google Cloud Resource Manager API',
    description: `Google Cloud Platform provides container resources such as Organizations and Projects, that allow you to group and hierarchically organize other Cloud Platform resources. This hierarchical organization lets you easily manage common aspects of your resources such as access control and configuration settings. The [Google Cloud Resource Manager API](https://cloud.google.com/resource-manager/docs) enables you to programmatically manage these container resources.`
  },
  speech: {
    name: 'Google Cloud Speech API',
    description: `The [Cloud Speech API](https://cloud.google.com/speech/docs) enables easy integration of Google speech recognition technologies into developer applications.`
  },
  storage: {
    name: 'Google Cloud Storage',
    description: `[Cloud Storage](https://cloud.google.com/storage/docs) allows world-wide storage and retrieval of any amount of data at any time.`
  },
  translate: {
    name: 'Google Translate API',
    description: `With the [Google Translate API](https://cloud.google.com/translate/docs), you can dynamically translate text between thousands of language pairs.`
  },
  vision: {
    name: 'Google Cloud Vision API',
    description: `The [Cloud Vision API](https://cloud.google.com/vision/docs) allows developers to easily integrate vision detection features within applications, including image labeling, face and landmark detection, optical character recognition (OCR), and tagging of explicit content.`
  }
};
