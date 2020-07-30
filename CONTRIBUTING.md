# Contribution Guide

This is the common top level contribution guide for this mono-repo.
A sub-package **may** have an additional `CONTRIBUTING.md` file, if needed.

## Legal

All contributors must sign the CLA.

- https://cla-assistant.io/SAP/sap-hana-driver-for-sqltools

This is managed automatically via https://cla-assistant.io/ pull request voter.

## Development Environment

### Prerequisites

- You have a [maintained version](https://nodejs.org/en/about/releases/) of Node.js.
  This package is targeted and tested on modern/supported versions of Node.js only.
  This means 8/10/12/13 at the time of writing this document.
- You have [commitizen](https://github.com/commitizen/cz-cli#installing-the-command-line-tool) installed for managing commit messages.

### Initial Setup

To perform setup:

1. Clone this repositroy.
2. Perfom `npm install`.

### Committing Changes

Use `git cz` to build conventional commit messages.

### Compiling

TypeScript is the main programming language used.

Use the following npm scripts at the repo's **root** to compile the source code (excluding tests):

1. `npm run compile`
2. `npm run compile:watch` (This will watch files for changes and re-compile as needed.)

### Full Build

To run the full **C**ontinuous **I**ntegration build, run `npm run ci`.

### Release Process

Releases are done as ["Github Releases"][gh-releases].

To release on master branch:

1. Perform `git fetch` and `git rebase`.
2. Run `npm run version:suggest` to get the suggested releaseType which will be used in the next step.
3. Run the [`npm version [patch|minor|major]`](https://docs.npmjs.com/cli/version) using the releaseType value
  command and with the version suggested in the previous step.
4. Perform `git push`.
5. Perform `git push --follow-tags`
6. Inspect the [CircleCI `deploy` build](https://circleci.com/gh/SAP/sap-hana-driver-for-sqltools) for the latest version tag.
7. Inspect the ["Github Releases"][gh-releases] and ensure the `.vsix` archive is attached to the latest version release.

[gh-releases]: https://github.com/SAP/sap-hana-driver-for-sqltools/releases
