steps:
- name: 'gcr.io/$PROJECT_ID/{{buildPack}}'
  env: [
    'CLOUD_BUILD=true',
    'SHA={{sha}}',
    'REPO_PATH={{repoPath}}',
    'CI={{ci}}',
    'CONTEXT={{name}}',
    'GOOGLE_APPLICATION_CREDENTIALS={{keyFileName}}',
    'GCLOUD_PROJECT={{project}}',
    'GOOGLE_CLOUD_PROJECT={{project}}',
    {{#each requiredEnvVars}}
    '{{key}}={{value}}',
    {{/each}}
  ]
  entrypoint: 'samples'
  args: ['test', 'install', '--cmd', '{{installCmd}}', '--', {{#each installArgs}}'{{this}}'{{#if @last}}{{else}}, {{/if}}{{/each}}]
{{#if run}}- name: 'gcr.io/$PROJECT_ID/{{buildPack}}'
  env: [
    'CLOUD_BUILD=true',
    'GOOGLE_APPLICATION_CREDENTIALS={{keyFileName}}',
    'GCLOUD_PROJECT={{project}}',
    'GOOGLE_CLOUD_PROJECT={{project}}',
    {{#each requiredEnvVars}}
    '{{key}}={{value}}',
    {{/each}}
  ]
  entrypoint: 'samples'
  args: ['test', 'run', '--cmd', '{{testCmd}}', '--', {{#each testArgs}}'{{this}}'{{#if @last}}{{else}}, {{/if}}{{/each}}]{{/if}}
{{#if app}}- name: 'gcr.io/$PROJECT_ID/{{buildPack}}'
  env: [
    'CLOUD_BUILD=true',
    'GOOGLE_APPLICATION_CREDENTIALS={{keyFileName}}',
    'GCLOUD_PROJECT={{project}}',
    'GOOGLE_CLOUD_PROJECT={{project}}',
    {{#each requiredEnvVars}}
    '{{key}}={{value}}',
    {{/each}}
  ]
  entrypoint: 'samples'
  args: ['test', 'app', '--cmd', '{{startCmd}}', '--', {{#each startArgs}}'{{this}}'{{#if @last}}{{else}}, {{/if}}{{/each}}]{{/if}}
{{#if deploy}}- name: 'gcr.io/$PROJECT_ID/{{buildPack}}'
  env: [
    'CLOUD_BUILD=true',
    'GOOGLE_APPLICATION_CREDENTIALS={{keyFileName}}',
    'GCLOUD_PROJECT={{project}}',
    'GOOGLE_CLOUD_PROJECT={{project}}',
    {{#each requiredEnvVars}}
    '{{key}}={{value}}',
    {{/each}}
  ]
  entrypoint: 'samples'
  args: ['test', 'deploy']{{/if}}
