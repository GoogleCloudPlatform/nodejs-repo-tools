<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# {{name}}: {{display}} Samples

[![Build](https://storage.googleapis.com/{{badgeUri}}.svg)]()

{{description}}

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
{{#each samples}}
  * [{{name}}](#{{slugify name}})
{{/each}}
* [Running the tests](#running-the-tests)

## Setup
{{readme.setup}}

## Samples
{{#each samples}}

### {{name}}
{{#if body}}
{{body}}{{else}}
{{#if ref}}

View the [README]({{ref}}).

{{else}}
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
[{{id}}_{{@index}}_code]: {{file}}{{/if}}{{/if}}
{{/each}}

## Running the tests
{{readme.tests}}
