[![CircleCI](https://circleci.com/gh/sap-staging/sap-hana-driver-for-sqltools.svg?style=svg)](https://circleci.com/gh/sap-staging/sap-hana-driver-for-sqltools)
# SAP HANA Driver for SQLTools
A Visual Studio Code extension which extends SQLTools extension, with a driver to work with SAP HANA Database. It supports Tables and Views and running queries on a SAP HANA Database.

## Creating connection schema for the assistant

We are using `@rjsf/core` to render the forms, so in order to add you driver to the connection assistant,
edit `connection.schema.json` and `ui.schema.json`.

See https://react-jsonschema-form.readthedocs.io/en/latest/ for more instructions.

## Publish the driver

See https://code.visualstudio.com/api/working-with-extensions/publishing-extension

webpack branch
