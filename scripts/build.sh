#!/usr/bin/env bash

rm -rf dist \
  && tsc --project tsconfig.build.json \
  && cp package.json yarn.lock dist \
  && dot-json dist/package.json scripts --delete \
  && dot-json dist/package.json devDependencies --delete
