#!/bin/sh
set -e

info() {
    printf "\e[34m[➧]\e[0m ${1}\n"
}

error() {
    printf "\e[31m[✘]\e[0m ${1}\n"
}

success() {
    printf "\e[32m[✔]\e[0m ${1}\n"
}

function toWinPath() {
    echo "$1" | sed -e 's/^\///' -e 's/\//\\/g' -e 's/^./\0:/'
}

function toPosixPath() {
    echo "/$1" | sed -e 's/\\/\//g' -e 's/://'
}


globalDirForWin=$(npm config get prefix)
currentDirForPosix=$(pwd)

currentDirForWin=$(toWinPath $currentDirForPosix)
globalDirForPosix=$(toPosixPath $globalDirForWin)


# Generate dev and debug bin file
array=( dev debug )
for mod in "${array[@]}"
do
    params=""
    if [ "$mod"x = "debug"x ]; then
        params=" --inspect --debug-brk"
    fi

    cat > "$globalDirForPosix\wepy-$mod" <<- EOF
#!/bin/sh
basedir=\$(dirname "\$(echo "\$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
    *CYGWIN*) basedir=\`cygpath -w "\$basedir"\`;;
esac

if [ -x "\$basedir/node" ]; then
  "\$basedir/node"$params "$currentDirForPosix/packages/wepy-cli/bin/wepy.js" "\$@"
  ret=\$?
else 
  node$params "$currentDirForPosix/packages/wepy-cli/bin/wepy.js" "\$@"
  ret=\$?
fi
exit \$ret
EOF

success "generated: $globalDirForPosix/wepy-$mod"


    cat > "$globalDirForPosix\wepy-$mod.cmd" <<- EOF
@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"$params "$currentDirForWin\packages\wepy-cli\bin\wepy.js" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node$params "$currentDirForWin\packages\wepy-cli\bin\wepy.js" %*

)
EOF

success "generated: $globalDirForPosix/wepy-$mod.cmd"
done



cd $currentDirForPosix
npm install

# Run npm install for every packages
# Change to install wepy-cli only
packages=$(ls -1 ./packages | grep "wepy-cli")
for package in ${packages[@]}
do
    cd "$currentDirForPosix/packages/$package"
    info "install npm packages for $package"
    npm install
done