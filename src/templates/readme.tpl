<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# {{name}} Node.js Samples

{{description}}

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
{{#each samples}}
  * [{{name}}](#{{slugify name}})
{{/each}}

## Setup

1. Read [Prerequisites][prereq] and [How to run a sample][run] first.
1. Install dependencies:

        npm install

[prereq]: ../README.md#prerequisities
[run]: ../README.md#how-to-run-a-sample

## Samples
{{#each samples}}

### {{name}}

View the [documentation][{{id}}_{{@index}}_docs] or the [source code][{{id}}_{{@index}}_code].{{#if description}}

{{{description}}}{{/if}}{{#if usage}}

__Usage:__ `{{{usage.text}}}`
{{/if}}
{{#if help}}

```
{{{trim help}}}
```

{{/if}}
[{{id}}_{{@index}}_docs]: {{docs_link}}
[{{id}}_{{@index}}_code]: {{file}}
{{/each}}
