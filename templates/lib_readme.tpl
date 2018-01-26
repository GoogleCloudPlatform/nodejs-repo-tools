<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# [{{name}}: {{display}} Client](https://github.com{{repoPath}})

{{release_quality release_quality}}
[![CircleCI](https://img.shields.io/circleci/project/github{{repoPath}}.svg?style=flat)](https://circleci.com/gh{{repoPath}})
[![AppVeyor](https://ci.appveyor.com/api/projects/status/github{{repoPath}}?branch=master&svg=true)](https://ci.appveyor.com/project{{repoPath}})
[![codecov](https://img.shields.io/codecov/c/github{{repoPath}}/master.svg?style=flat)](https://codecov.io/gh{{repoPath}})

> {{display}} idiomatic client for [{{short_name}}][product-docs].

{{description}}

{{#if deprecated}}
| :warning: Deprecated Module |
| --- |
| This library is **deprecated**. {{deprecated}} |
{{/if}}

* [{{short_name}} {{display}} Client API Reference][client-docs]
* [github.com{{repoPath}}](https://github.com{{repoPath}})
* [{{short_name}} Documentation][product-docs]

Read more about the client libraries for Cloud APIs, including the older
Google APIs Client Libraries, in [Client Libraries Explained][explained].

[explained]: https://cloud.google.com/apis/docs/client-libraries-explained

**Table of contents:**

* [Quickstart](#quickstart)
  * [Before you begin](#before-you-begin)
  * [Installing the client library](#installing-the-client-library)
  * [Using the client library](#using-the-client-library)
{{#if samples.length}}
* [Samples](#samples)
{{/if}}
* [Versioning](#versioning)
* [Contributing](#contributing)
* [License](#license)

## Quickstart

### Before you begin

1.  Select or create a Cloud Platform project.

    [Go to the projects page][projects]

{{#unless suppress_billing}}
1.  Enable billing for your project.

    [Enable billing][billing]

{{/unless}}
{{#if api_id}}
1.  Enable the {{name}} API.

    [Enable the API][enable_api]

{{/if}}
1.  [Set up authentication with a service account][auth] so you can access the
    API from your local workstation.

[projects]: https://console.cloud.google.com/project
{{#unless suppress_billing}}
[billing]: https://support.google.com/cloud/answer/6293499#enable-billing
{{/unless}}
[enable_api]: https://console.cloud.google.com/flows/enableapi?apiid={{api_id}}
[auth]: https://cloud.google.com/docs/authentication/getting-started

### Installing the client library

    {{lib_install_cmd}}

{{#if quickstart}}
### Using the client library

```{{syntax_highlighting_ext}}
{{{quickstart}}}
```
{{/if}}

{{#if samples.length}}
## Samples

Samples are in the [`samples/`](https://github.com{{repoPath}}/tree/master/samples) directory. The samples' `README.md`
has instructions for running the samples.

| Sample                      | Source Code                       | Try it |
| --------------------------- | --------------------------------- | ------ |
{{#each samples}}
| {{name}} | [source code](https://github.com{{../repoPath}}/blob/master/samples/{{file}}) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com{{../repoPath}}&page=editor&open_in_editor=samples/{{file}},samples/README.md) |
{{/each}}
{{/if}}

The [{{short_name}} {{display}} Client API Reference][client-docs] documentation
also contains samples.

## Versioning

This library follows [Semantic Versioning](http://semver.org/).

{{#if_eq release_quality 'ga'}}
This library is considered to be **General Availability (GA)**. This means it
is stable; the code surface will not change in backwards-incompatible ways
unless absolutely necessary (e.g. because of critical security issues) or with
an extensive deprecation period. Issues and requests against **GA** libraries
are addressed with the highest priority.
{{/if_eq}}
{{#if_eq release_quality 'beta'}}
This library is considered to be in **beta**. This means it is expected to be
mostly stable while we work toward a general availability release; however,
complete stability is not guaranteed. We will address issues and requests
against beta libraries with a high priority.
{{/if_eq}}
{{#if_eq release_quality 'alpha'}}
This library is considered to be in **alpha**. This means it is still a
work-in-progress and under active development. Any release is subject to
backwards-incompatible changes at any time.
{{/if_eq}}
{{#if_eq release_quality 'deprecated'}}
This library is **deprecated**. This means that it is no longer being
actively maintained and the only updates the library will receive will
be for critical security issues. {{#if deprecated}}{{deprecated}}{{/if}}
{{/if_eq}}

More Information: [Google Cloud Platform Launch Stages][launch_stages]

[launch_stages]: https://cloud.google.com/terms/launch-stages

## Contributing

Contributions welcome! See the [Contributing Guide](https://github.com{{repoPath}}/blob/master/.github/CONTRIBUTING.md).

## License

Apache Version 2.0

See [LICENSE](https://github.com{{repoPath}}/blob/master/LICENSE)

[client-docs]: {{client_reference_url}}
[product-docs]: {{docs_url}}
[shell_img]: http://gstatic.com/cloudssh/images/open-btn.png
