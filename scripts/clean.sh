#!/bin/bash
set -e

prod=$1

echo "Clear all dependences"


rm -rf node_modules
rm -rf yarn.lock
rm -rf package-lock.json
rm -rf packages/*/node_modules
rm -rf packages/*/yarn.lock
rm -rf packages/*/package-lock.json

