# Use the base App Engine Docker image, based on debian jessie.
FROM gcr.io/google-appengine/debian8

# Install updates and dependencies
RUN apt-get update -y && \
    apt-get install --no-install-recommends -y -q curl python build-essential git ca-certificates libkrb5-dev imagemagick && \
    apt-get clean && \
    rm /var/lib/apt/lists/*_*

# Install the latest LTS release of nodejs
RUN mkdir /nodejs && curl https://nodejs.org/dist/v6.10.2/node-v6.10.2-linux-x64.tar.gz | tar xvzf - -C /nodejs --strip-components=1
ENV PATH $PATH:/nodejs/bin

# Install Yarn
ENV YARN_VERSION 0.22.0

RUN set -ex \
  && for key in \
    6A010C5166006599AA17F08146C2130DFD2497F5 \
  ; do \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key" || \
    gpg --keyserver pgp.mit.edu --recv-keys "$key" || \
    gpg --keyserver keyserver.pgp.com --recv-keys "$key" ; \
  done \
  && curl -fSL -o yarn.js "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-legacy-$YARN_VERSION.js" \
  && curl -fSL -o yarn.js.asc "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-legacy-$YARN_VERSION.js.asc" \
  && gpg --batch --verify yarn.js.asc yarn.js \
  && rm yarn.js.asc \
  && mv yarn.js /usr/local/bin/yarn \
  && chmod +x /usr/local/bin/yarn

RUN yarn global add nyc codecov @google-cloud/nodejs-repo-tools

ENTRYPOINT ["node"]
