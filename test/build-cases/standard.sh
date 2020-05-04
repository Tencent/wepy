#!/bin/bash

name=$(basename "$0" .sh)
cd /tmp/templates/

wepy init standard $name --no-interactive --name test-interactive

cd "$name"
npm install
