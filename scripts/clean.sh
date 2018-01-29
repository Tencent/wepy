#!/bin/sh
set -e

if [ -z "$TEST_GREP" ]; then
   TEST_GREP=""
fi

node="node"

if [ "$TEST_DEBUG" ]; then
   node="node --inspect --debug-brk"
fi

rm -rf node_modules
rm -rf yarn.lock
rm -rf package-lock.json
rm -rf packages/*/node_modules
rm -rf packages/*/lib
rm -rf packages/*/yarn.lock
rm -rf packages/*/package-lock.json
