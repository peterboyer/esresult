#!/usr/bin/env bash

yarn conventional-changelog -p angular -i CHANGELOG.md -s
git add CHANGELOG.md
git commit -m "chore: update changelog"
