#!/usr/bin/env bash
# Publishes a snapshot (canary-style) pre-release of all @veramo packages.
# Usage: pnpm run release:snapshot <preid>    (e.g. next, unstable)
set -euo pipefail

preid="${1:?Usage: release-snapshot.sh <preid> (e.g. next, unstable)}"

# Allow-list check: npm dist-tags are limited to a small charset, and this also
# rules out anything shell- or flag-like reaching the changeset CLI.
if ! [[ "$preid" =~ ^[a-z0-9][a-z0-9._-]*$ ]]; then
  echo "Invalid pre-release tag: '$preid'" >&2
  exit 1
fi

cd "$(dirname "$0")/.."

# 'changeset version --snapshot' errors when there are no pending changesets.
# In that case there is nothing to release, so exit cleanly instead of failing CI.
if [ -z "$(find .changeset -maxdepth 1 -name '*.md' ! -name 'README.md' -print -quit)" ]; then
  echo "No pending changesets — skipping '$preid' snapshot release."
  exit 0
fi

# Stamps all packages (they are versioned in lockstep via the 'fixed' config)
# with a '<next-version>-<preid>-<datetime>' version and rewrites their
# inter-dependencies. This does not consume the changesets and does not create
# commits, changelog entries or git tags.
pnpm exec changeset version --snapshot "$preid"

# Publishes every package at the snapshot version with the given dist-tag.
# --no-git-tag keeps release branches free of git tags (only @latest releases
# from main create tags, and those are pushed by the changesets action).
pnpm exec changeset publish --tag "$preid" --no-git-tag
