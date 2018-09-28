.. image:: https://avatars2.githubusercontent.com/u/2810941?v=3&s=96
   :height: 96px
   :width: 96px
   :alt: Google Cloud Platform logo
   :align: right

{{name}}: {{display}} Samples
=============================

|Open in Cloud Shell|

{{description}}

Table of Contents
-----------------

-  `Before you begin <#before-you-begin>`__
-  `Samples <#samples>`__
{{#each samples}}
   -  `{{name}} <#{{slugify name}}>`__
{{/each}}

Before you begin
----------------

Before running the samples, make sure you’ve followed the steps in the
`Before you begin section <../README.md#before-you-begin>`__ of the
client library’s README.

Samples
-------

{{#each samples}}

{{name}}
~~~~~~~~
{{#if body}}
{{body}}{{else}}
{{#if ref}}

View the `README <{{ref}}>`__.

{{else}}
View the `source code <{{file}}>`__.

|Open in Cloud Shell {{name}}|

.. |Open in Cloud Shell {{name}}| image:: //gstatic.com/cloudssh/images/open-btn.png
   :target: https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com{{../repoPath}}&page=editor&open_in_editor=samples/{{file}},samples/README.md


{{#if description}}

{{{description}}}{{/if}}{{#if usage}}

**Usage:** ``{{{usage.text}}}``
{{/if}}
{{#if help}}

::

    {{{trim help}}}

{{/if}}
{{/if}}
{{/if}}
{{/each}}

.. |Open in Cloud Shell| image:: https://gstatic.com/cloudssh/images/open-btn.png
   :target: https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com{{repoPath}}&page=editor&open_in_editor=samples/README.md
