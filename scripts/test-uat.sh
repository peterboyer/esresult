#!/usr/bin/env bash

./scripts/build.sh

cleanup() {
  rm -rf node_modules/esresult
  mv package.json.ignore package.json
  mv dist/package.json.ignore dist/package.json
}

trap "cleanup" EXIT

mkdir -p node_modules/esresult
cp -r dist/* node_modules/esresult
mv package.json package.json.ignore
mv dist/package.json dist/package.json.ignore

# filter to only acceptance, remove ignore pattern set in config
jest --testRegex=__tests__ --testPathIgnorePatterns=
