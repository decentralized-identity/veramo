# Changesets

This repo uses [changesets](https://github.com/changesets/changesets) for versioning and publishing.

## Adding a changeset (contributors)

When your PR changes any published `@veramo/*` package, run:

```sh
pnpm changeset
```

and commit the generated `.md` file in `.changeset/`. Describe the change and
select the appropriate bump type (`patch` / `minor` / `major`).

All `@veramo/*` packages are versioned in lockstep (see `fixed` in
`.changeset/config.json`) — adding a changeset for one package bumps and
re-publishes all of them at the same version.

## How releases happen

- **`main`**: CI (`.github/workflows/build-test-publish-on-push.yml`) opens/updates
  a "chore(release): version packages" PR. Merging it publishes all packages
  with the `latest` dist-tag, pushes git tags and creates GitHub releases.
- **`next` / `unstable`** (or any ref via manual dispatch): CI publishes a
  snapshot pre-release (e.g. `7.0.1-next-20260914153529`) with the matching
  dist-tag. No git tags or version commits are created. This requires at least
  one pending changeset.
