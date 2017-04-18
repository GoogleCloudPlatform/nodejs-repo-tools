# Deploy

1.  Create a `settings.json` file:

        {
          "accessToken": "YOUR_GITHUB_ACCESS_TOKEN"
        }

1. Deploy:

        gcloud beta functions deploy onChange --trigger-topic=cloud-builds --stage-bucket=artifacts.cloud-docs-samples.appspot.com
