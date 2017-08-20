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

const BASE = `https://cloud.google.com`;
const RE_DOCS_URL = /{{docs_url}}/gi;

class Product {
  constructor (id, name, shortName, docsUrl, description, apiId) {
    this.id = id;
    this.name = name;
    this.short_name = shortName;
    this.docs_url = docsUrl;
    this.description = description.replace(RE_DOCS_URL, docsUrl);
    this.api_id = apiId;
  }
}

const products = [
  new Product(
    `appengine`,
    `Google App Engine`,
    `App Engine`,
    `${BASE}/appengine/docs`,
    `[Google App Engine]({{docs_url}}) is a fully managed platform that completely abstracts away infrastructure so you focus only on code.`
  ),
  new Product(
    'appengine_flexible',
    'Google App Engine flexible environment',
    'App Engine flexible environment',
    `${BASE}/appengine/docs/flexible`,
    `Based on [Google Compute Engine](${BASE}/compute/docs/), the [App Engine flexible environment]({{docs_url}}) automatically scales your app up and down while balancing the load. Microservices, authorization, SQL and NoSQL databases, traffic splitting, logging, versioning, security scanning, and content delivery networks are all supported natively. In addition, the App Engine flexible environment allows you to customize your runtime and even the operating system of your virtual machine using Dockerfiles.`
  ),
  new Product(
    'appengine_standard',
    'Google App Engine standard environment',
    'App Engine standard environment',
    `${BASE}/appengine/docs/standard`,
    `The [App Engine standard environment]({{docs_url}}) is based on container instances running on Google's infrastructure. Containers are preconfigured with one of several available runtimes (Java 7, Python 2.7, Go and PHP). Each runtime also includes libraries that support App Engine Standard APIs. For many applications, the standard environment runtimes and libraries might be all you need.`
  ),
  new Product(
    `bigquery`,
    `Google BigQuery`,
    `BigQuery`,
    `${BASE}/bigquery/docs`,
    `[BigQuery]({{docs_url}}) is Google's fully managed, petabyte scale, low cost analytics data warehouse. BigQuery is NoOps—there is no infrastructure to manage and you don't need a database administrator—so you can focus on analyzing data to find meaningful insights, use familiar SQL, and take advantage of our pay-as-you-go model.`
  ),
  new Product(
    `bigquery_transfer`,
    `Google BigQuery Data Transfer Service`,
    `BigQuery Data Transfer Service`,
    `${BASE}`,
    `TODO(jdobry): BigQuery Data Transfer Service`
  ),
  new Product(
    `bigtable`,
    `Cloud Bigtable`,
    `Cloud Bigtable`,
    `${BASE}/bigtable/docs/`,
    `[Cloud Bigtable]({{docs_url}}) is Google's NoSQL Big Data database service. It's the same database that powers many core Google services, including Search, Analytics, Maps, and Gmail.`
  ),
  new Product(
    `cdn`,
    `Cloud Content Delivery Network`,
    `Cloud CDN`,
    `${BASE}`,
    `TODO(jdobry): Cloud CDN description`
  ),
  new Product(
    `cdn_keys`,
    `Custom Cache Keys for Cloud Content Delivery Network`,
    `Custom Cache Keys for Cloud CDN`,
    `${BASE}`,
    `TODO(jdobry): Custom Cache Keys for Cloud CDN description`
  ),
  new Product(
    `compute_engine`,
    `Google Compute Engine`,
    `Compute Engine`,
    `${BASE}/compute/docs/`,
    `[Compute Engine]({{docs_url}}) lets you create and run virtual machines on Google infrastructure. Compute Engine offers scale, performance, and value that allows you to easily launch large compute clusters on Google's infrastructure. There are no upfront investments and you can run thousands of virtual CPUs on a system that has been designed to be fast, and to offer strong consistency of performance.`
  ),
  new Product(
    `container_builder`,
    `Google Container Builder`,
    `Container Builder`,
    `${BASE}`,
    `TODO(jdobry): Container Builder description`
  ),
  new Product(
    `container_engine`,
    `Google Container Engine`,
    `Container Engine`,
    `${BASE}/container-engine/docs/`,
    `[Container Engine]({{docs_url}}) let's you run Docker containers on Google Cloud Platform, powered by Kubernetes.`
  ),
  new Product(
    `container_registry`,
    `Google Container Registry`,
    `Container Registry`,
    `${BASE}`,
    `TODO(jdobry): Container Registry description`
  ),
  new Product(
    `dataflow`,
    `Google Cloud Dataflow`,
    `Cloud Dataflow`,
    `${BASE}`,
    `TODO(jdobry): Cloud Dataflow description`
  ),
  new Product(
    `dataproc`,
    `Google Cloud Dataproc`,
    `Cloud Dataproc`,
    `${BASE}`,
    `TODO(jdobry): Cloud Dataproc description`
  ),
  new Product(
    `datastore`,
    `Google Cloud Datastore`,
    `Cloud Datastore`,
    `${BASE}/datastore/docs`,
    `[Cloud Datastore]({{docs_url}}) is a NoSQL document database built for automatic scaling, high performance, and ease of application development. While the Cloud Datastore interface has many of the same features as traditional databases, as a NoSQL database it differs from them in the way it describes relationships between data objects.`
  ),
  new Product(
    `debugger`,
    `Stackdriver Debugger`,
    `Stackdriver Debugger`,
    `${BASE}/debugger/docs/`,
    `[Stackdriver Debugger]({{docs_url}}) is a feature of Google Cloud Platform that lets you inspect the state of a Java, Python, or Go application, at any code location, without stopping or slowing down the running app. Stackdriver Debugger makes it easier to view the application state without adding logging statements.`
  ),
  new Product(
    `dlp`,
    `Google Cloud Data Loss Prevention (DLP) API`,
    `Data Loss Prevention (DLP) API`,
    `${BASE}/dlp/docs/`,
    `The [Data Loss Prevention API]({{docs_url}}) provides programmatic access to a powerful detection engine for personally identifiable information and other privacy-sensitive data in unstructured data streams.`
  ),
  new Product(
    `dns`,
    `Google Cloud DNS`,
    `Cloud DNS`,
    `${BASE}/dns/docs/`,
    `[Cloud DNS]({{docs_url}}) allows you to publish your domain names using Google's infrastructure for production-quality, high-volume DNS services. Google's global network of anycast name servers provide reliable, low-latency authoritative name lookups for your domains from anywhere in the world.`
  ),
  new Product(
    `endpoints`,
    `Google Cloud Endpoints`,
    `Cloud Endpoints`,
    `${BASE}/endpoints/docs/`,
    `[Cloud Endpoints]({{docs_url}}) helps you create, deploy, protect, monitor, analyze, and serve your APIs using the same infrastructure Google uses for its own APIs. Use any language and framework to write an API, add an OpenAPI specification, and Cloud Endpoints will monitor and protect your API.`
  ),
  new Product(
    `error_reporting`,
    `Stackdriver Error Reporting`,
    `Error Reporting`,
    `${BASE}/error-reporting/docs/`,
    `[Stackdriver Error Reporting]({{docs_url}}) aggregates and displays errors produced in your running cloud services.`
  ),
  new Product(
    `genomics`,
    `Google Genomics`,
    `Genomics`,
    `${BASE}`,
    `TODO(jdobry): Genomics description`
  ),
  new Product(
    `iam`,
    `Cloud Identity Access Management`,
    `Cloud IAM`,
    `${BASE}`,
    `TODO(jdobry): Cloud IAM description`
  ),
  new Product(
    `functions`,
    `Google Cloud Functions`,
    `Cloud Functions`,
    `${BASE}/functions/docs/`,
    `[Cloud Functions]({{docs_url}}) is a lightweight compute solution for developers to create single-purpose, stand-alone functions that respond to Cloud events without the need to manage a server or runtime environment.`
  ),
  new Product(
    `kms`,
    `Cloud Key Management Service`,
    `Cloud KMS`,
    `${BASE}/kms/docs/`,
    `[Cloud KMS]({{docs_url}}) allows you to keep encryption keys in one central cloud service, for direct use by other cloud resources and applications. With Cloud KMS you are the ultimate custodian of your data, you can manage encryption in the cloud the same way you do on-premises, and you have a provable and monitorable root of trust over your data.`
  ),
  new Product(
    `logging`,
    `Stackdriver Logging`,
    `Logging`,
    `${BASE}/logging/docs`,
    `[Stackdriver Logging]({{docs_url}}) allows you to store, search, analyze, monitor, and alert on log data and events from Google Cloud Platform and Amazon Web Services.`
  ),
  new Product(
    `ml`,
    `Cloud Machine Learning Engine`,
    `Cloud ML Engine`,
    `${BASE}`,
    `TODO(jdobry): Cloud ML Engine description`
  ),
  new Product(
    `monitoring`,
    `Stackdriver Monitoring`,
    `Monitoring`,
    `${BASE}/monitoring/docs`,
    `[Stackdriver Monitoring]({{docs_url}}) collects metrics, events, and metadata from Google Cloud Platform, Amazon Web Services (AWS), hosted uptime probes, application instrumentation, and a variety of common application components including Cassandra, Nginx, Apache Web Server, Elasticsearch and many others.`
  ),
  new Product(
    `nl`,
    `Google Cloud Natural Language API`,
    `Natural Language API`,
    `${BASE}/natural-language/docs`,
    `[Cloud Natural Language API]({{docs_url}}) provides natural language understanding technologies to developers, including sentiment analysis, entity analysis, and syntax analysis. This API is part of the larger Cloud Machine Learning API family.`
  ),
  new Product(
    `prediction`,
    `Google Prediction API`,
    `Prediction API`,
    `${BASE}/prediction/docs`,
    `The [Cloud Prediction API]({{docs_url}}) provides a RESTful API to build Machine Learning models.`
  ),
  new Product(
    `pubsub`,
    `Google Cloud Pub/Sub`,
    `Cloud Pub/Sub`,
    `${BASE}/pubsub/docs`,
    `[Cloud Pub/Sub]({{docs_url}}) is a fully-managed real-time messaging service that allows you to send and receive messages between independent applications.`
  ),
  new Product(
    `resource`,
    `Google Cloud Resource Manager API`,
    `Cloud Resource Manager API`,
    `${BASE}/resource-manager/docs/`,
    `Google Cloud Platform provides container resources such as Organizations and Projects, that allow you to group and hierarchically organize other Cloud Platform resources. This hierarchical organization lets you easily manage common aspects of your resources such as access control and configuration settings. The [Cloud Resource Manager API]({{docs_url}}) enables you to programmatically manage these container resources.`
  ),
  new Product(
    `spanner`,
    `Cloud Spanner`,
    `Cloud Spanner`,
    `${BASE}/spanner/docs/`,
    `[Cloud Spanner]({{docs_url}}) is a fully managed, mission-critical, relational database service that offers transactional consistency at global scale, schemas, SQL (ANSI 2011 with extensions), and automatic, synchronous replication for high availability.`
  ),
  new Product(
    `speech`,
    `Google Cloud Speech API`,
    `Speech API`,
    `${BASE}/speech/docs`,
    `The [Cloud Speech API]({{docs_url}}) enables easy integration of Google speech recognition technologies into developer applications. Send audio and receive a text transcription from the Cloud Speech API service.`
  ),
  new Product(
    `sql`,
    `Google Cloud SQL`,
    `Cloud SQL`,
    `${BASE}/sql/`,
    `[Cloud SQL]({{docs_url}}) is a fully-managed database service that makes it easy to set up, maintain, manage, and administer your relational PostgreSQL BETA and MySQL databases in the cloud.`
  ),
  new Product(
    `sql_mysql`,
    `Google Cloud SQL for MySQL`,
    `Cloud SQL for MySQL`,
    `${BASE}/sql/docs/mysql/`,
    `[Cloud SQL for MySQL]({{docs_url}}) is a fully-managed database service that makes it easy to set up, maintain, manage, and administer your MySQL relational databases on Google Cloud Platform.`
  ),
  new Product(
    `sql_postgresql`,
    `Google Cloud SQL for PostgreSQL`,
    `Cloud SQL for PostgreSQL`,
    `${BASE}/sql/docs/postgres/`,
    `[Cloud SQL for PostgreSQL]({{docs_url}}) is a fully-managed database service that makes it easy to set up, maintain, manage, and administer your PostgreSQL relational databases on Google Cloud Platform.`
  ),
  new Product(
    `storage`,
    `Google Cloud Storage`,
    `Cloud Storage`,
    `${BASE}/storage/docs`,
    `[Cloud Storage]({{docs_url}}) allows world-wide storage and retrieval of any amount of data at any time. You can use Google Cloud Storage for a range of scenarios including serving website content, storing data for archival and disaster recovery, or distributing large data objects to users via direct download.`,
    `storage-api.googleapis.com`
  ),
  new Product(
    `storage_transfer`,
    `Cloud Storage Transfer Service`,
    `Storage Transfer Service`,
    `${BASE}`,
    `TODO(jdobry): Storage Transfer Service description`
  ),
  new Product(
    `tasks`,
    `Google Cloud Tasks`,
    `Cloud Tasks`,
    `${BASE}`,
    `TODO(jdobry): Cloud Tasks description`
  ),
  new Product(
    `trace`,
    `Stackdriver Trace`,
    `Trace`,
    `${BASE}/trace/docs/`,
    `[Stackdriver Trace]({{docs_url}}) is a distributed tracing system for Google Cloud Platform that collects latency data from App Engine applications and displays it in near real time in the Google Cloud Platform Console.`
  ),
  new Product(
    `translate`,
    `Google Cloud Translation API`,
    `Cloud Translation API`,
    `${BASE}/translate/docs`,
    `The [Cloud Translation API]({{docs_url}}), can dynamically translate text between thousands of language pairs. The Cloud Translation API lets websites and programs integrate with the translation service programmatically. The Cloud Translation API is part of the larger Cloud Machine Learning API family.`
  ),
  new Product(
    `vision`,
    `Google Cloud Vision API`,
    `Vision API`,
    `${BASE}/vision/docs`,
    `The [Cloud Vision API]({{docs_url}}) allows developers to easily integrate vision detection features within applications, including image labeling, face and landmark detection, optical character recognition (OCR), and tagging of explicit content.`
  ),
  new Product(
    `video`,
    `Google Cloud Video Intelligence API`,
    `Video Intelligence API`,
    `${BASE}/video-intelligence`,
    `The [Cloud Video Intelligence API]({{docs_url}}) allows developers to use Google video analysis technology as part of their applications.`
  )
];

const productsObject = {};

products.forEach((product) => {
  productsObject[product.id] = product;
});

module.exports = productsObject;
