#!/usr/bin/env bash

yarn build
cd test
yarn
rm -r node_modules/esenum
(cd node_modules && ln -s ../../dist esenum)
yarn tsc --project tsconfig.json
yarn tsc --project tsconfig.global.json
