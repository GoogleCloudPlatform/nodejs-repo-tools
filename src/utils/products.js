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
  appengine: {
    name: 'Google App Engine',
    description: `[Google App Engine](https://cloud.google.com/appengine) is a fully managed platform that completely abstracts away infrastructure so you focus only on code.`
  },
  appengine_flexible: {
    name: 'Google App Engine Flexible Environment',
    description: `Based on [Google Compute Engine](https://cloud.google.com/compute/docs/), the [App Engine flexible environment](https://cloud.google.com/appengine/docs/flexible/) automatically scales your app up and down while balancing the load. Microservices, authorization, SQL and NoSQL databases, traffic splitting, logging, versioning, security scanning, and content delivery networks are all supported natively. In addition, the App Engine flexible environment allows you to customize your runtime and even the operating system of your virtual machine using Dockerfiles.`
  },
  appengine_standard: {
    name: 'Google App Engine Standard Environment',
    description: `The ]App Engine standard environment](https://cloud.google.com/appengine/docs/standard/) is based on container instances running on Google's infrastructure. Containers are preconfigured with one of several available runtimes (Java 7, Python 2.7, Go and PHP). Each runtime also includes libraries that support App Engine Standard APIs. For many applications, the standard environment runtimes and libraries might be all you need.`
  },
  bigquery: {
    name: 'Google BigQuery',
    description: `[BigQuery](https://cloud.google.com/bigquery/docs) is Google's fully managed, petabyte scale, low cost analytics data warehouse. BigQuery is NoOps—there is no infrastructure to manage and you don't need a database administrator—so you can focus on analyzing data to find meaningful insights, use familiar SQL, and take advantage of our pay-as-you-go model.`
  },
  bigtable: {
    name: 'Google Cloud Bigtable',
    description: `[Cloud Bigtable](https://cloud.google.com/bigtable/docs/) is Google's NoSQL Big Data database service. It's the same database that powers many core Google services, including Search, Analytics, Maps, and Gmail.`
  },
  compute_engine: {
    name: 'Google Compute Engine',
    description: `[Compute Engine](https://cloud.google.com/compute/docs/) lets you create and run virtual machines on Google infrastructure. Compute Engine offers scale, performance, and value that allows you to easily launch large compute clusters on Google's infrastructure. There are no upfront investments and you can run thousands of virtual CPUs on a system that has been designed to be fast, and to offer strong consistency of performance.`
  },
  container_engine: {
    name: 'Google Container Engine',
    description: `[Container Engine](https://cloud.google.com/container-engine/docs/) let's you run Docker containers on Google Cloud Platform, powered by Kubernetes.`
  },
  datastore: {
    name: 'Google Cloud Datastore',
    description: `[Cloud Datastore](https://cloud.google.com/datastore/docs) is a NoSQL document database built for automatic scaling, high performance, and ease of application development. While the Cloud Datastore interface has many of the same features as traditional databases, as a NoSQL database it differs from them in the way it describes relationships between data objects.`
  },
  debugger: {
    name: 'Stackdriver Debugger',
    description: `[Stackdriver Debugger](https://cloud.google.com/debugger/docs/) is a feature of Google Cloud Platform that lets you inspect the state of a Java, Python, or Go application, at any code location, without stopping or slowing down the running app. Stackdriver Debugger makes it easier to view the application state without adding logging statements.`
  },
  dns: {
    name: 'Google Cloud DNS',
    description: `[Cloud DNS](https://cloud.google.com/dns/docs/) allows you to publish your domain names using Google's infrastructure for production-quality, high-volume DNS services. Google's global network of anycast name servers provide reliable, low-latency authoritative name lookups for your domains from anywhere in the world.`
  },
  endpoints: {
    name: 'Google Cloud Endpoints',
    description: `[Cloud Endpoints](https://cloud.google.com/endpoints/docs/) helps you create, deploy, protect, monitor, analyze, and serve your APIs using the same infrastructure Google uses for its own APIs. Use any language and framework to write an API, add an OpenAPI specification, and Cloud Endpoints will monitor and protect your API.`
  },
  error_reporting: {
    name: 'Stackdriver Error Reporting',
    description: `[Stackdriver Error Reporting](https://cloud.google.com/error-reporting/docs/) aggregates and displays errors produced in your running cloud services.`
  },
  functions: {
    name: 'Google Cloud Functions',
    description: `[Cloud Functions](https://cloud.google.com/functions/docs/) is a lightweight compute solution for developers to create single-purpose, stand-alone functions that respond to Cloud events without the need to manage a server or runtime environment.`
  },
  kms: {
    name: 'Google Cloud Key Management Service',
    description: `[Cloud KMS](https://cloud.google.com/kms/docs/) allows you to keep encryption keys in one central cloud service, for direct use by other cloud resources and applications. With Cloud KMS you are the ultimate custodian of your data, you can manage encryption in the cloud the same way you do on-premises, and you have a provable and monitorable root of trust over your data.`
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
    description: `[Cloud Natural Language API](https://cloud.google.com/natural-language/docs) provides natural language understanding technologies to developers, including sentiment analysis, entity analysis, and syntax analysis. This API is part of the larger Cloud Machine Learning API family.`
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
    description: `Google Cloud Platform provides container resources such as Organizations and Projects, that allow you to group and hierarchically organize other Cloud Platform resources. This hierarchical organization lets you easily manage common aspects of your resources such as access control and configuration settings. The [Cloud Resource Manager API](https://cloud.google.com/resource-manager/docs/) enables you to programmatically manage these container resources.`
  },
  spanner: {
    name: 'Google Cloud Spanner',
    description: `[Cloud Spanner](https://cloud.google.com/spanner/docs/) is a fully managed, mission-critical, relational database service that offers transactional consistency at global scale, schemas, SQL (ANSI 2011 with extensions), and automatic, synchronous replication for high availability.`
  },
  speech: {
    name: 'Google Cloud Speech API',
    description: `The [Cloud Speech API](https://cloud.google.com/speech/docs) enables easy integration of Google speech recognition technologies into developer applications. Send audio and receive a text transcription from the Cloud Speech API service.`
  },
  sql: {
    name: 'Google Cloud SQL',
    description: `[Cloud SQL](https://cloud.google.com/sql/) is a fully-managed database service that makes it easy to set up, maintain, manage, and administer your relational PostgreSQL BETA and MySQL databases in the cloud.`
  },
  sql_mysql: {
    name: 'Google Cloud SQL for MySQL',
    description: `[Cloud SQL for MySQL](https://cloud.google.com/sql/docs/mysql/) is a fully-managed database service that makes it easy to set up, maintain, manage, and administer your MySQL relational databases on Google Cloud Platform.`
  },
  sql_postgresql: {
    name: 'Google Cloud SQL for PostgreSQL',
    description: `[Cloud SQL for PostgreSQL](https://cloud.google.com/sql/docs/postgres/) is a fully-managed database service that makes it easy to set up, maintain, manage, and administer your PostgreSQL relational databases on Google Cloud Platform.`
  },
  storage: {
    name: 'Google Cloud Storage',
    description: `[Cloud Storage](https://cloud.google.com/storage/docs) allows world-wide storage and retrieval of any amount of data at any time. You can use Google Cloud Storage for a range of scenarios including serving website content, storing data for archival and disaster recovery, or distributing large data objects to users via direct download.`
  },
  trace: {
    name: 'Stackdriver Trace',
    description: `[Stackdriver Trace](https://cloud.google.com/trace/docs/) is a distributed tracing system for Google Cloud Platform that collects latency data from App Engine applications and displays it in near real time in the Google Cloud Platform Console.`
  },
  translate: {
    name: 'Google Cloud Translation API',
    description: `The [Cloud Translation API](https://cloud.google.com/translate/docs), can dynamically translate text between thousands of language pairs. The Cloud Translation API lets websites and programs integrate with the translation service programmatically. The Cloud Translation API is part of the larger Cloud Machine Learning API family.`
  },
  vision: {
    name: 'Google Cloud Vision API',
    description: `The [Cloud Vision API](https://cloud.google.com/vision/docs) allows developers to easily integrate vision detection features within applications, including image labeling, face and landmark detection, optical character recognition (OCR), and tagging of explicit content.`
  },
  video: {
    name: 'Google Cloud Video Intelligence API',
    description: `The [Cloud Video Intelligence API](https://cloud.google.com/video-intelligence) allows developers to use Google video analysis technology as part of their applications.`
  }
};
