<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# {{name}}: {{display}} Client

{{release_quality release_quality}}
[![CircleCI](https://img.shields.io/circleci/project/github{{repoPath}}.svg?style=flat)](https://circleci.com/gh{{repoPath}})
[![codecov](https://img.shields.io/codecov/c/github{{repoPath}}/repo-migration.svg?style=flat)](https://codecov.io/gh{{repoPath}})

> Node.js idiomatic client for [{{short_name}}][product-docs].

{{description}}

* [{{short_name}} {{display}} Client API Reference][client-docs]
* [{{short_name}} Documentation][product-docs]

Read more about the client libraries for Cloud APIs, including the older
Google APIs Client Libraries, in [Client Libraries Explained][explained].

[explained]: https://cloud.google.com/apis/docs/client-libraries-explained

**Table of contents:**

* [QuickStart](#quickstart)
  * [Before you begin](#before-you-begin)
  * [Installing the client library](#installing-the-client-library)
  * [Using the client library](#using-the-client-library)
{{#if samples.length}}
* [Samples](#samples)
{{/if}}
{{#each samples}}
  * [{{name}}](#{{slugify name}})
{{/each}}
* [Versioning](#versioning)
* [Contributing](#contributing)
* [License](#license)

## Quickstart

### Before you begin

1.  Select or create a Cloud Platform project.

    [Go to the projects page][projects]

1.  Enable billing for your project.

    [Enable billing][billing]

1.  Enable the {{name}} API.

    [Enable the API][enable_api]

1.  [Set up authentication with a service account][auth] so you can access the
    API from your local workstation.

[projects]: https://console.cloud.google.com/project
[billing]: https://support.google.com/cloud/answer/6293499#enable-billing
[enable_api]: https://console.cloud.google.com/flows/enableapi?apiid={{api_id}}
[auth]: https://cloud.google.com/docs/authentication/getting-started

### Installing the client library

    {{lib_install_cmd}}

{{#if quickstart}}
### Using the client library

    {{{quickstart}}}
{{/if}}

{{#if samples.length}}
## Samples

Samples are in the [`samples/`](samples) directory. The samples' `README.md`
has instructions for running the samples.
{{#each samples}}

### {{name}}
{{#if ref}}

View the [README](samples/{{ref}}).

{{else}}
View the [documentation][{{id}}_{{@index}}_docs] or the [source code][{{id}}_{{@index}}_code].{{#if description}}

{{{description}}}{{/if}}

[{{id}}_{{@index}}_docs]: {{docs_link}}
[{{id}}_{{@index}}_code]: samples/{{file}}{{/if}}
{{/each}}
{{/if}}

## Versioning

This library follows [Semantic Versioning](http://semver.org/).

Please note it is currently under active development. Any release versioned
`0.x.y` is subject to backwards-incompatible changes at any time.

**GA**: Libraries defined at the **General Availability (GA)** quality level are
stable. The code surface will not change in backwards-incompatible ways unless
absolutely necessary (e.g. because of critical security issues) or with an
extensive deprecation period. Issues and requests against **GA** libraries are
addressed with the highest priority.

Please note that the auto-generated portions of the **GA** libraries (the ones
in modules such as `v1` or `v2`) are considered to be of **Beta** quality, even
if the libraries that wrap them are **GA**.

**Beta**: Libraries defined at the **Beta** quality level are expected to be
mostly stable, while we work towards their release candidate. We will address
issues and requests with a higher priority.

**Alpha**: Libraries defined at the **Alpha** quality level are still a
work-in-progress and are more likely to get backwards-incompatible updates.

See also: [Google Cloud Platform Launch Stages][launch_stages]

[launch_stages]: https://cloud.google.com/terms/launch-stages

## Contributing

Contributions welcome! See the [Contributing Guide](.github/CONTRIBUTING.md).

## License

Apache Version 2.0

See [LICENSE](LICENSE)

[client-docs]: {{client_reference_url}}
[product-docs]: {{docs_url}}
