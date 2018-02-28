# Contributing

欢迎任意形式的贡献。

## Acknowledgements

非常感谢以下几位贡献者对于 WePY 的做出的贡献：

* dlhandsome <awsomeduan@gmail.com>
* dolymood <dolymood@gmail.com>
* baisheng <baisheng@gmail.com>

其中特别致谢 dlhandsome 提交的38个 commits, 对 WePY 做出了1,350增加和362处删减(截止02/28/18日)。

WePy 持续招募贡献者，即使是在 Issues 中回答问题，或者做一些简单的 bugfix ，也会给 WePY 带来很大的帮助。

Wepy已开发近一年，在此感谢所有开发者对于 WePY 的喜欢和支持，希望你能够成为 WePY 的核心贡献者，加入 WePY ，共同打造一个更棒的小程序开发框架！🍾🎉

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
# npm run botstrap:prod


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
