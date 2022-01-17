#!/usr/bin/env bash

# TAG= env variable not-empty, then git tag with version.
TAG=$(env | grep TAG)
SHA=$(env | grep SHA)

PKG_NAME=$(dot-json package.json name)
PKG_VERSION_MAJOR=$(dot-json package.json version)

echo "[*] MAJOR: $PKG_VERSION_MAJOR"

# Get latest version sub-version for major version.
NPM_VERSIONS=$(npm info $PKG_NAME@\>=$PKG_VERSION_MAJOR version 2>/dev/null)

if [[ -z $NPM_VERSIONS ]]; then
  echo "[!] No deployments found >=$PKG_VERSION_MAJOR. New major deployment!"

  echo "[!] Version: $PKG_VERSION_MAJOR"

  PKG_VERSION_NEXT=$PKG_VERSION_MAJOR

else
  echo "[!] Existing deployments found."

  # Get last word from NPM_VERSIONS and remove quotes.
  NPM_VERSION=$(echo $NPM_VERSIONS | awk '{print $NF}' | tr -d "'")

  # Write the latest existing deployment version to bump from.
  dot-json dist/package.json version $NPM_VERSION

  echo "[*] FROM Version: $NPM_VERSION"

  # Get last deployment tag.
  FROM_TAG=$(git describe --tags --abbrev=0 2>/dev/null)

  # If no tags (failed).
  if [[ "$?" != "0" ]]; then
    echo "[!] fatal: No tags found, despite having existing deployments!"
    exit 1
  fi

  echo "[*] FROM Tag: $FROM_TAG"

  # Assert that $TAG_NAME == v$NPM_VERSION.
  if [[ "$FROM_TAG" != "v$NPM_VERSION" ]]; then
    echo "[!] fatal: 'FROM Version' incompatible with 'FROM Tag'!"
    exit 1
  fi

  # Get SHA of deployment tag.
  FROM_SHA=$(git rev-parse "$FROM_TAG^0" 2>/dev/null)

  # If can't get SHA (failed).
  if [[ "$?" != "0" ]]; then
    echo "[!] fatal: Unable to get SHA of tag $FROM_TAG!"
    exit 1
  fi

  echo "[*] FROM: $FROM_SHA"

  # Get SHA of HEAD.
  HEAD_SHA=$(git rev-parse HEAD)

  # If can't get SHA (failed).
  if [[ "$?" != "0" ]]; then
    echo "[!] fatal: Unable to get SHA of HEAD!"
    exit 1
  fi

  echo "[*] HEAD: $HEAD_SHA"

  # Get any matches for 'feat' bump (MINOR).
  LOG_MATCH=$(git log $FROM_SHA..$HEAD_SHA --oneline | grep -E "^(\w)* feat(:|\()")

  # If match for MINOR.
  if [[ -n $LOG_MATCH ]]; then
    BUMP=minor
  fi

  # If BUMP not set yet, attempt PATCH.
  if [[ -z $BUMP ]]; then
    # Get any matches for 'fix' bump (PATCH).
    LOG_MATCH=$(git log $FROM_SHA..$HEAD_SHA --oneline | grep -E "^(\w)* fix(:|\()")

    if [[ -n $LOG_MATCH ]]; then
      BUMP=patch
    fi
  fi

  # If BUMP not set yet (failed).
  if [[ -z $BUMP ]]; then
    echo "[!] fatal: Found no feat/fix messages for a new version!"
    exit 1
  fi

  echo "[*] BUMP: $BUMP"

  # Apply the new version according to BUMP.
  (cd dist && yarn version --$BUMP --no-git-tag-version 1>/dev/null)

  PKG_VERSION_NEXT=$(dot-json dist/package.json version)

  echo "[!] Version: $NPM_VERSION => $PKG_VERSION_NEXT"

  # If next version is the same as the last/current version.
  if [[ $PKG_VERSION_NEXT == $NPM_VERSION ]]; then
    echo "[!] fatal: Attempting to deploy an existing version!"
    exit 1
  fi
fi

if [[ -n $SHA ]]; then
  SHA=$(git rev-parse --short HEAD)
  PKG_VERSION_NEXT="$PKG_VERSION_NEXT-sha.$SHA"

  # Apply the new version.
  (cd dist && yarn version --new-version $PKG_VERSION_NEXT --no-git-tag-version 1>/dev/null)

  echo "[!] Version: SHA $PKG_VERSION_NEXT"
fi

# Tag repo with vVERSION tag on commit.
if [[ -n $TAG ]]; then
  GIT_TAG=v$PKG_VERSION_NEXT
  git tag $GIT_TAG
  echo "[*] Tagged: $PKG_VERSION_NEXT"
fi
