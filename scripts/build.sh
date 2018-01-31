#!/bin/bash
set -e

if [ -z "$TEST_GREP" ]; then
   TEST_GREP=""
fi

node="node"

if [ "$TEST_DEBUG" ]; then
   node="node --inspect --debug-brk"
fi


cd packages/wepy/
babel --presets es2015,stage-1 src/ --out-dir lib/ --source-maps

cd ../wepy-cli/
babel --presets es2015,stage-1 src/ --out-dir lib/ --source-maps
