### Release Process

Releases are done as ["Github Releases"][gh-releases].

The process (on master branch).

- `git fetch && git rebase`
- Update CHANGELOG.md manually & commit it - TODO: can it be done with 1 commit
- Run the [`npm version [patch|minor|major]`](https://docs.npmjs.com/cli/version)
  command using the suggested version from above
- `git push`


- `git push --tags` - TODD: Avoid - push single tag
- Inspect the [CircleCI `deploy` build](https://circleci.com/gh/SAP/sap-hana-driver-for-sqltools) for the latest version tag.
- Inspect the ["Github Releases"][gh-releases] and ensure the `.vsix` archive is attached to the latest version release.

[gh-releases]: https://github.com/SAP/vscode-mta-tools/releases
