steps:
- name: 'gcr.io/$PROJECT_ID/nodejs'
  env: [
    'CLOUD_BUILD=true',
    'SHA={{sha}}',
    'REPO_PATH={{repoPath}}',
    'CI={{ci}}',
    'CONTEXT={{test}}',
    'GOOGLE_APPLICATION_CREDENTIALS={{keyFileName}}',
    'GCLOUD_PROJECT={{project}}',
    'GOOGLE_CLOUD_PROJECT={{project}}'
  ]
  entrypoint: 'samples'
  args: ['test', 'install', '--cmd', '{{installCmd}}', '--args', '{{installArgs}}']
{{#if run}}- name: 'gcr.io/$PROJECT_ID/nodejs'
  env: [
    'CLOUD_BUILD=true',
    'GOOGLE_APPLICATION_CREDENTIALS={{keyFileName}}',
    'GCLOUD_PROJECT={{project}}',
    'GOOGLE_CLOUD_PROJECT={{project}}'
  ]
  entrypoint: 'samples'
  args: ['test', 'run', '--cmd', '{{testCmd}}', '--args', '{{testArgs}}']{{/if}}
{{#if app}}- name: 'gcr.io/$PROJECT_ID/nodejs'
  env: [
    'CLOUD_BUILD=true',
    'GOOGLE_APPLICATION_CREDENTIALS={{keyFileName}}',
    'GCLOUD_PROJECT={{project}}',
    'GOOGLE_CLOUD_PROJECT={{project}}'
  ]
  entrypoint: 'samples'
  args: ['test', 'app', '--cmd', '{{webCmd}}', '--args', '{{webArgs}}']{{/if}}
{{#if deploy}}- name: 'gcr.io/$PROJECT_ID/nodejs'
  env: [
    'CLOUD_BUILD=true',
    'GOOGLE_APPLICATION_CREDENTIALS={{keyFileName}}',
    'GCLOUD_PROJECT={{project}}',
    'GOOGLE_CLOUD_PROJECT={{project}}'
  ]
  entrypoint: 'samples'
  args: ['test', 'deploy']{{/if}}
