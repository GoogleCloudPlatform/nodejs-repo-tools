steps:
- name: 'gcr.io/$PROJECT_ID/nodejs'
  env: [
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
    'GOOGLE_APPLICATION_CREDENTIALS={{keyFileName}}',
    'GCLOUD_PROJECT={{projectId}}',
    'GOOGLE_CLOUD_PROJECT={{projectId}}'
  ]
  entrypoint: '{{testCmd}}'
  args: [{{#each testArgs}}'{{this}}'{{#if @last}}{{else}},{{/if}}{{/each}}]
