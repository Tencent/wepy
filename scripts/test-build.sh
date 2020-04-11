#!/bin/bash

# test wepy new demo

# Start in tasks/ even if run from root directory
cd "$(dirname "$0")"

function cleanup() {
    echo 'Cleaning up.'
}


# Error messages are redirected to stderr
function handle_error() {
    echo "$(basename $0): ERROR! An error was encountered executing line $1." 1>&2;
    cleanup
    echo 'Exiting with error.' 1>&2;
    exit 1
}


function handle_exit() {
    cleanup
    echo 'Exiting without error.' 1>&2;
    exit
}


# Exit the script with a helpful error message when any error is encountered
trap 'set +x; handle_error $LINENO $BASH_COMMAND' ERR

# Cleanup before exit on any termination signal
trap 'set +x; handle_exit' SIGQUIT SIGTERM SIGINT SIGKILL SIGHUP

# Echo every command being executed
set -x


# Go to root
cd ..
root_path=$PWD


npm link packages/cli

wepy -v

wepy list

mkdir -p /tmp/templates/
cd /tmp/templates/

exps="${root_path}/scripts/exps"
for exp in ${exps}/*; do
    name=$(basename $exp .exp)
	expect "$root_path"/scripts/exps/"$name".exp "/tmp/templates/${name}"
    pwd
    ls -la
	cd "/tmp/templates/${name}"
	npm install
	node "$root_path"/packages/cli/bin/wepy.js build
done

# Build multiple version for standard project.
cd /tmp/templates/standard

node "$root_path"/packages/cli/bin/wepy.js build

# Test build demos
cd /tmp/templates

# node "$root_path"/packages/cli/bin/wepy.js init wepyjs/wepy-wechat-demo wepy-wechat-demo
git clone https://github.com/wepyjs/wepy-wechat-demo.git --branch 2.0

cd wepy-wechat-demo
npm install
npm run build

cd ..

# Cleanup
cleanup
