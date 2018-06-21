# Contributing


欢迎任意形式的贡献。

## Issues


* BUG 上报
如果 WePY 不工作或者异常，确认是 WePY 本身问题并且在 Issue 中搜索未找到答案时，欢迎提 Issue 讨论。

* 新功能支持
如果你觉得 WePY 存在不足的地方，或者有更好的 idea，欢迎提 Issue 讨论。

* 问题讨论
如果你对 WePY 存在疑问或者不确定的地方，欢迎提 Issue 讨论。


## Pull requests

* 开发调试代码

```
# Download code
git clone git@github.com:wepyjs/wepy.git

cd wepy

# Start
# This command will generate `wepy-dev` and `wepy-debug` command for you
npm run bootstrap

# You can either use `bootstrap` or `bootstrap:prod`, `bootstrap:prod` will generate a pure npm package for you. `devDependences` won't be installed, that means you can not run build or test cases.
# npm run bootstrap:prod


# Build code
npm run build

# Watch
npm run watch

# Run test cases
npm run test

# Useage
wepy build # Global wepy you installed by npm

wepy-dev build # Local wepy you compiled by your local repository

wepy-debug build # Debug local wepy using node --inspect
```
