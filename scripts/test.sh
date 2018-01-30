#!/bin/sh
set -e

if [ -z "$TEST_GREP" ]; then
   TEST_GREP=""
fi

node="node"

if [ "$TEST_DEBUG" ]; then
   node="node --inspect --debug-brk"
fi

jsonlint -q ./docs/data/cases.json && echo 'cases.json ok.'
jsonlint -q ./docs/data/donate.json && echo 'donate.json ok.'

eslint packages/*
istanbul cover ./node_modules/mocha/bin/_mocha -- -t 50000 --recursive  -R spec packages/*/test/