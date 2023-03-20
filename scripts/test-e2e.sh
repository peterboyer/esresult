#!/usr/bin/env bash

cd test
yarn
yarn tsc index.ts
yarn tsc index-global.ts
