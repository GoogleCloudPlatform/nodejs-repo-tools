# Use the base gcloud image, based on ubuntu:trusty
FROM gcr.io/cloud-docs-samples/gcloud

# Install updates and dependencies
RUN apt-get update -y && \
    apt-get install --no-install-recommends -y -q curl python build-essential git ca-certificates libkrb5-dev imagemagick && \
    apt-get clean && \
    rm /var/lib/apt/lists/*_*

# Install the latest LTS release of nodejs
RUN mkdir /nodejs && curl https://nodejs.org/dist/v8.12.0/node-v8.12.0-linux-x64.tar.gz | tar xvzf - -C /nodejs --strip-components=1
ENV PATH $PATH:/nodejs/bin

# Install the Repo Tools binary
RUN curl -O https://storage.googleapis.com/cloud-docs-samples/releases/latest/nodejs-repo-tools-linux \
    && mv ./nodejs-repo-tools-linux /usr/local/bin/repo-tools \
    && chmod +x /usr/local/bin/repo-tools \
    && ln -s /usr/local/bin/repo-tools /usr/local/bin/samples \
    && ln -s /usr/local/bin/repo-tools /usr/local/bin/tools
ENV PATH $PATH:/usr/local/bin

# Install the Cloud SQL Proxy
RUN curl -o /usr/local/bin/cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 \
    && chmod +x /usr/local/bin/cloud_sql_proxy

ENTRYPOINT ["gcloud"]
