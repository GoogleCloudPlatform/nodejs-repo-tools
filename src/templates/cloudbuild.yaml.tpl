steps:
- name: 'gcr.io/$PROJECT_ID/nodejs'
  env: [
    'CLOUD_BUILD=true',
    'SHA={{sha}}',
    'REPO_PATH={{repoPath}}',
    'CI={{ci}}',
    'CONTEXT={{test}}',
    'GOOGLE_APPLICATION_CREDENTIALS={{keyFileName}}',
    'GCLOUD_PROJECT={{projectId}}',
    'GOOGLE_CLOUD_PROJECT={{projectId}}'
  ]
  entrypoint: '{{installCmd}}'
  args: [{{#each installArgs}}'{{this}}'{{#if @last}}{{else}},{{/if}}{{/each}}]
- name: 'gcr.io/$PROJECT_ID/nodejs'
  env: [
    'CLOUD_BUILD=true',
    'GOOGLE_APPLICATION_CREDENTIALS={{keyFileName}}',
    'GCLOUD_PROJECT={{projectId}}',
    'GOOGLE_CLOUD_PROJECT={{projectId}}'
  ]
  entrypoint: '{{testCmd}}'
  args: [{{#each testArgs}}'{{this}}'{{#if @last}}{{else}},{{/if}}{{/each}}]
{{#if deploy}}- name: 'gcr.io/$PROJECT_ID/nodejs'
  env: [
    'CLOUD_BUILD=true',
    'GOOGLE_APPLICATION_CREDENTIALS={{keyFileName}}',
    'GCLOUD_PROJECT={{projectId}}',
    'GOOGLE_CLOUD_PROJECT={{projectId}}'
  ]
  entrypoint: '{{deployCmd}}'
  args: [{{#each deployArgs}}'{{this}}'{{#if @last}}{{else}},{{/if}}{{/each}}]{{/if}}
