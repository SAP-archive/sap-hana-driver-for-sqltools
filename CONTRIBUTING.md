# Contribution Guide

This is the common top level contribution guide for this mono-repo.
A sub-package **may** have an additional CONTRIBUTING.md file if needed.

## Legal

All contributors must sign the CLA

- https://cla-assistant.io/SAP/sap-hana-driver-for-sqltools

This is managed automatically via https://cla-assistant.io/ pull request voter.

## Development Environment

### pre-requisites

- A [maintained version](https://nodejs.org/en/about/releases/) of node.js
  - This package is targeted and tested on modern/supported versions of node.js only.
    Which means 8/10/12/13 at the time of writing this document.
- [commitizen](https://github.com/commitizen/cz-cli#installing-the-command-line-tool) for managing commit messages.

### Initial Setup

The initial setup is trivial:

- clone this repo
- `npm install`

### Committing Changes

Use `git cz` to build conventional commit messages.

- requires [commitizen](https://github.com/commitizen/cz-cli#installing-the-command-line-tool) to be installed.

### Compiling

TypeScript is the main programming language used.

Use the following npm scripts at the repo's **root** to compile (excluding tests)
source code:

- `npm run compile`
- `npm run compile:watch` (will watch files for changes and re-compile as needed)

### Full Build

To run the full **C**ontinuous **I**ntegration build run `npm run ci`.

### Release Process

Releases are done as ["Github Releases"][gh-releases].

The process (on master branch).

- `git fetch && git rebase`
- Run `npm run version:suggest` to get the suggested releaseType which be used in the next step, 
- Run the [`npm version [patch|minor|major]`](https://docs.npmjs.com/cli/version) using the releaseType value
  command using the suggested version from above
- `git push`
- `git push --follow-tags`
- Inspect the [CircleCI `deploy` build](https://circleci.com/gh/SAP/sap-hana-driver-for-sqltools) for the latest version tag.
- Inspect the ["Github Releases"][gh-releases] and ensure the `.vsix` archive is attached to the latest version release.

[gh-releases]: https://github.com/SAP/sap-hana-driver-for-sqltools/releases
