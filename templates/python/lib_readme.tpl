.. image:: https://avatars2.githubusercontent.com/u/2810941?v=3&s=96
   :height: 96px
   :width: 96px
   :alt: Google Cloud Platform logo
   :align: right

`{{name}}: {{display}} Client <https://github.com{{repoPath}}>`__
=========================================================================

|release level| |CircleCI| |AppVeyor| |codecov|

    {{display}} idiomatic client for
    `{{short_name}} <{{docs_url}}>`__.

{{description}}

{{#if deprecated}}
\| :warning: Deprecated Module \|
\| — \|
\| This library is **deprecated**. {{deprecated}} \|
{{/if}}

-  `{{short_name}} {{display}} Client API Reference <{{client_reference_url}}>`__
-  `github.com{{repoPath}} <https://github.com{{repoPath}}>`__
-  `{{short_name}} Documentation <{{docs_url}}>`__

Read more about the client libraries for Cloud APIs, including the older
Google APIs Client Libraries, in `Client Libraries
Explained <https://cloud.google.com/apis/docs/client-libraries-explained>`__.

**Table of contents:**

-  `Quickstart <#quickstart>`__

   -  `Before you begin <#before-you-begin>`__
   -  `Installing the client library <#installing-the-client-library>`__
   -  `Using the client library <#using-the-client-library>`__

{{#if samples.length}}
-  `Samples <#samples>`__
{{/if}}
-  `Versioning <#versioning>`__
-  `Contributing <#contributing>`__
-  `License <#license>`__

Quickstart
----------

Before you begin
~~~~~~~~~~~~~~~~

1. Select or create a Cloud Platform project.

  `Go to the projects page`_

{{#unless suppress_billing}}
1. Enable billing for your project.

  `Enable billing`_
{{/unless}}

{{#if api_id}}
1. Enable the {{name}} API.

  `Enable the API`_
{{/if}}

1. `Set up authentication with a service account`_ so you
can access the API from your local workstation.

.. _Go to the projects page: https://console.cloud.google.com/project
.. _Enable billing: https://support.google.com/cloud/answer/6293499#enable-billing
.. _Enable the API: https://console.cloud.google.com/flows/enableapi?apiid={{api_id}}
.. _Set up authentication with a service account: https://cloud.google.com/docs/authentication/getting-started


Installing the client library
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    {{lib_install_cmd}}

.. note::

    We highly recommend that you install this library in a
    `virtualenv <https://virtualenv.pypa.io/en/latest/>`_.

{{#if quickstart}}

Using the client library
~~~~~~~~~~~~~~~~~~~~~~~~

.. code:: {{syntax_highlighting_ext}}

{{{quickstart}}}
{{/if}}

{{#if samples.length}}

Samples
~~~~~~~

Samples are in the `samples\ <https://github.com{{repoPath}}/tree/master/samples>`__
directory. The samples’ ``README.md`` has instructions for running the
samples.

+--------+-------------+--------+
| Sample | Source Code | Try it |
+========+=============+========+
+--------+-------------+--------+

{{#each samples}}
\| {{name}} \| `source code <https://github.com{{../repoPath}}/blob/master/samples/{{file}}>`__ \| |Open in Cloud Shell {{name}}| \|

.. |Open in Cloud Shell {{name}}| image:: https://gstatic.com/cloudssh/images/open-btn.png
   :target: https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com{{../repoPath}}&page=editor&open_in_editor=samples/{{file}},samples/README.md

{{/each}}
{{/if}}

The `{{short_name}} {{display}} Client API
Reference <{{client_reference_url}}>`__ documentation also
contains samples.

Versioning
----------

This library follows `Semantic Versioning <http://semver.org/>`__.

{{#if_eq release_quality ‘ga’}}
This library is considered to be
**General Availability (GA)**. This means it is stable; the code surface
will not change in backwards-incompatible ways unless absolutely
necessary (e.g. because of critical security issues) or with an
extensive deprecation period. Issues and requests against **GA**
libraries are addressed with the highest priority.
{{/if_eq}}
{{#if_eq release_quality ‘beta’}}
This library is considered to be in **beta**.
This means it is expected to be mostly stable while we work toward a
general availability release; however, complete stability is not
guaranteed. We will address issues and requests against beta libraries
with a high priority.
{{/if_eq}}
{{#if_eq release_quality ‘alpha’}}
This library is considered to be in **alpha**. This means it is still a
work-in-progress and under active development. Any release is subject to
backwards-incompatible changes at any time.
{{/if_eq}}
{{#if_eq release_quality ‘deprecated’}} This library is **deprecated**. This means that it is no longer being actively maintained and the only
updates the library will receive will be for critical security issues.{{#if deprecated}}{{deprecated}}{{/if}}
{{/if_eq}}

More Information: `Google Cloud Platform Launch
Stages <https://cloud.google.com/terms/launch-stages>`__

Contributing
------------

Contributions welcome! See the `Contributing
Guide <https://github.com{{repoPath}}/blob/master/.github/CONTRIBUTING.md>`__.

License
-------

Apache Version 2.0

See
`LICENSE <https://github.com{{repoPath}}/blob/master/LICENSE>`__


.. |release level| image:: https://img.shields.io/badge/release%20level-general%20availability%20%28GA%29-brightgreen.svg?style=flat
   :target: https://cloud.google.com/terms/launch-stages
.. |CircleCI| image:: https://img.shields.io/circleci/project/github{{repoPath}}.svg?style=flat
   :target: https://circleci.com/gh{{repoPath}}
.. |AppVeyor| image:: https://ci.appveyor.com/api/projects/status/github{{repoPath}}?branch=master&svg=true
   :target: https://ci.appveyor.com/project{{repoPath}}
.. |codecov| image:: https://img.shields.io/codecov/c/github{{repoPath}}/master.svg?style=flat
   :target: https://codecov.io/gh{{repoPath}}
