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
node "$root_path"/packages/wepy-cli/bin/wepy.js build

node "$root_path"/packages/wepy-cli/bin/wepy.js build --output web

node "$root_path"/packages/wepy-cli/bin/wepy.js build --output web --platform qq

node "$root_path"/packages/wepy-cli/bin/wepy.js build --output web --platform wechat

node "$root_path"/packages/wepy-cli/bin/wepy.js build --output ant

cd ../emptydemo
node "$root_path"/packages/wepy-cli/bin/wepy.js build

cd ../nolintdemo
node "$root_path"/packages/wepy-cli/bin/wepy.js build

cd ../reduxdemo
node "$root_path"/packages/wepy-cli/bin/wepy.js build


cd ..
# Test build demos

git clone https://github.com/wepyjs/wepy-wechat-demo.git

cd wepy-wechat-demo
npm install
node "$root_path"/packages/wepy-cli/bin/wepy.js build
npm run build

cd ..
git clone https://github.com/wepyjs/wepy-weui-demo.git
cd wepy-weui-demo
npm install
node "$root_path"/packages/wepy-cli/bin/wepy.js build
npm run build

# Cleanup
cleanup