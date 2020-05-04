#!/bin/bash

name=$(basename "$0" .sh)
cd /tmp/templates/

wepy init empty $name --no-interactive

cd "$name"
npm install
