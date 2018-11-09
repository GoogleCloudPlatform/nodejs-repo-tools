# Tool builder: `gcr.io/cloud-builders/nodejs`

This Container Builder build step runs the `node` tool.

It also installs Yarn, nyc, and codecov.

## Building this builder

To build this builder, run the following command in this directory.

    $ gcloud builds submit . --config=cloudbuild.yaml
