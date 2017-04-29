# Tool builder: `gcr.io/cloud-builders/base`

This Container Builder build step runs the `gcloud` tool.

It also install Node.js and @google-cloud/nodejs-repo-tools.

## Building this builder

To build this builder, run the following command in this directory.

    $ gcloud container builds submit . --config=cloudbuild.yaml
