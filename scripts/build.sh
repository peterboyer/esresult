#!/usr/bin/env bash

rm -rf dist \
  && tsc --project tsconfig.build.json \
  && cp package.json LICENSE README.md dist \
  && dot-json dist/package.json main index.js \
  && dot-json dist/package.json types index.d.ts \
  && dot-json dist/package.json scripts --delete \
  && dot-json dist/package.json devDependencies --delete
