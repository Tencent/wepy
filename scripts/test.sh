#!/bin/sh
set -e

if [ -z "$TEST_GREP" ]; then
   TEST_GREP=""
fi

node="node"

if [ "$TEST_DEBUG" ]; then
   node="node --inspect --debug-brk"
fi

eslint packages/*
istanbul cover ./node_modules/mocha/bin/_mocha -- -t 50000 --recursive  -R spec packages/*/test/