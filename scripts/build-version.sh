#!/usr/bin/env bash

# get major version from local
pkgversion=$(dot-json package.json version)
pkgname=$(dot-json package.json name)
echo pkg $pkgversion

# get latest version after major from npm
npmversions=$(npm info $pkgname@\>=$pkgversion version 2>/dev/null)
echo npm $npmversions

# if no versions, default to first of local major version
# otherwise parse the npm response for version string
if [[ -z $npmversions ]]; then
  echo no versions on major
  firstversion=true
  version=$pkgversion
else
  echo has versions on major
  # get last word from versions, remove quotes
  version=$(echo $npmversions | awk '{print $NF}' | tr -d "'")
fi

# set package.json version to resolved version number before bump
echo latest $version
dot-json dist/package.json version $version

# bump if not firstversion
if [[ -z $firstversion ]]; then
  latesttag=$(git describe --tags --abbrev=0 2>/dev/null)
  echo latesttag $latesttag

  fromsha=$(git rev-parse "$latesttag^0" 2>/dev/null)
  if [[ "$?" != "0" ]]; then
    fromsha=""
  fi
  if [[ -z $fromsha ]]; then
    fromsha=$(git rev-list HEAD | tail -n 1)
  fi
  tosha=$(git rev-parse HEAD)

  echo from $fromsha
  echo to $tosha

  # doesn't support (scope)
  result=$(git log $fromsha..$tosha | grep feat:)
  if [[ -z $result ]]; then
    result=$(git log $fromsha..$tosha | grep fix:)
    if [[ ! -z $result ]]; then
      bump=patch
    fi
  else
    bump=minor
  fi

  echo bump $bump

  if [[ ! -z $bump ]]; then
    (cd dist && yarn version --$bump --no-git-tag-version)
  fi
fi

prevversion=$version
nextversion=$(dot-json dist/package.json version)

echo $prevversion vs $nextversion

# used in ci as output to determine if to continue artifact test/deploy/etc
if [[ $prevversion != $nextversion ]]; then
  echo continue
fi
