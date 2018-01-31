#!/bin/bash
set -e

node="node"

if [ "$TEST_DEBUG" ]; then
   node="node --inspect --debug-brk"
fi

node ./node_modules/jsonlint/lib/cli.js -q ./docs/data/cases.json && echo 'cases.json ok.'
node ./node_modules/jsonlint/lib/cli.js -q ./docs/data/donate.json && echo 'donate.json ok.'

node ./node_modules/eslint/bin/eslint.js packages/*
node ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha -- -t 50000 --recursive  -R spec packages/*/test/
