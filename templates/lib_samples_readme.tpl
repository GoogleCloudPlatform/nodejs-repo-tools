[//]: # "This README.md file is auto-generated, all changes to this file will be lost."
[//]: # "To regenerate it, use `npm run generate-scaffolding`."
<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# {{name}}: {{display}} Samples

[![Open in Cloud Shell][shell_img]][shell_link]

{{description}}

## Table of Contents

* [Before you begin](#before-you-begin)
* [Samples](#samples)
{{#each samples}}
  * [{{name}}](#{{slugify name}})
{{/each}}

## Before you begin

Before running the samples, make sure you've followed the steps in the
[Before you begin section](../README.md#before-you-begin) of the client
library's README.

## Samples
{{#each samples}}

### {{name}}
{{#if body}}
{{body}}{{else}}
{{#if ref}}

View the [README]({{ref}}).

{{else}}
View the [source code][{{id}}_{{@index}}_code].

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com{{../repoPath}}&page=editor&open_in_editor=samples/{{file}},samples/README.md){{#if description}}

{{{description}}}{{/if}}{{#if usage}}

__Usage:__ `{{{usage.text}}}`
{{/if}}
{{#if help}}

```
{{{trim help}}}
```

{{/if}}
[{{id}}_{{@index}}_docs]: {{docs_link}}
[{{id}}_{{@index}}_code]: {{file}}{{/if}}{{/if}}
{{/each}}

[shell_img]: https://gstatic.com/cloudssh/images/open-btn.png
[shell_link]: https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com{{repoPath}}&page=editor&open_in_editor=samples/README.md
