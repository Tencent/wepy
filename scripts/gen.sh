#!/bin/sh


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


npm link packages/wepy-cli


wepy -v

wepy new demo

wepy new emptydemo --empty

wepy new reduxdemo --redux

wepy new nolintdemo --no-lint

cd demo
wepy build

cd ../emptydemo
wepy build

cd ../nolintdemo
wepy build

cd ../reduxdemo
wepy build


cd ..
# Test build demos

git clone git@github.com:wepyjs/wepy-wechat-demo.git

cd wepy-wechat-demo

npm install

wepy build


# Cleanup
cleanup