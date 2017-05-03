# Use the base gcloud image, based on ubuntu:trusty
FROM gcr.io/cloud-docs-samples/base

# Install Ruby
RUN apt-get update -y && \
    apt-get install -y -q --no-install-recommends \
        apt-utils \
        autoconf \
        build-essential \
        ca-certificates \
        cmake \
        curl \
        git \
        file \
        imagemagick \
        libcurl3 \
        libcurl3-gnutls \
        libcurl4-openssl-dev \
        libffi-dev \
        libgdbm-dev \
        libgit2-dev \
        libgmp-dev \
        libicu-dev \
        libmagickwand-dev \
        libmysqlclient-dev \
        libncurses5-dev \
        libpq-dev \
        libqdbm-dev \
        libreadline6-dev \
        libsqlite3-dev \
        libssl-dev \
        libxml2-dev \
        libxslt-dev \
        libyaml-dev \
        libz-dev \
        systemtap

# Install rbenv
ENV RBENV_ROOT /rbenv
RUN git clone https://github.com/sstephenson/rbenv.git $RBENV_ROOT && \
    git clone https://github.com/sstephenson/ruby-build.git $RBENV_ROOT/plugins/ruby-build
ENV PATH $RBENV_ROOT/shims:$RBENV_ROOT/bin:$PATH

# Preinstalled default ruby version.
ENV DEFAULT_RUBY_VERSION 2.4.0
ENV BUNDLER_VERSION 1.14.6

# Set ruby runtime distribution
ARG RUNTIME_DISTRIBUTION="ruby-runtime-jessie"

# Install the default ruby binary and bundler.
RUN (echo "deb http://packages.cloud.google.com/apt ${RUNTIME_DISTRIBUTION} main" \
      | tee /etc/apt/sources.list.d/ruby-runtime-jessie.list) && \
    (curl https://packages.cloud.google.com/apt/doc/apt-key.gpg \
      | apt-key add -) && \
    apt-get update -y && \
    apt-get install -y -q gcp-ruby-$DEFAULT_RUBY_VERSION && \
    rbenv rehash && \
    rbenv global $DEFAULT_RUBY_VERSION && \
    gem install -q --no-rdoc --no-ri bundler --version $BUNDLER_VERSION && \
    rbenv rehash

# Tell nokogiri >=1.6 to install using system libraries, for faster builds
RUN bundle config build.nokogiri --use-system-libraries
ENV NOKOGIRI_USE_SYSTEM_LIBRARIES 1

# Clean up apt
RUN apt-get clean && rm -f /var/lib/apt/lists/*_*

ENTRYPOINT ["ruby"]
