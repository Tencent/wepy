## Contribute

我们提倡您通过提issue和pull request方式来促进wepy的发展。

​                 

## Acknowledgements

非常感谢以下几位贡献者对于 WePY 的做出的贡献：

- dlhandsome [awsomeduan@gmail.com](mailto:awsomeduan@gmail.com)
- dolymood [dolymood@gmail.com](mailto:dolymood@gmail.com)
- baisheng [baisheng@gmail.com](mailto:baisheng@gmail.com)

其中特别致谢 dlhandsome 提交的38个 commits, 对 WePY 做出了1,350增加和362处删减(截止02/28/18日)。

WePy 持续招募贡献者，即使是在 Issues 中回答问题，或者做一些简单的 bugfix ，也会给 WePY 带来很大的帮助。

Wepy已开发近一年，在此感谢所有开发者对于 WePY 的喜欢和支持，希望你能够成为 WePY 的核心贡献者，加入 WePY ，共同打造一个更棒的小程序开发框架！🍾🎉

​                       

## Issues提交

#### 对于贡献者

在提issue前请确保满足一下条件：

- 必须是一个bug或者功能新增。
- 必须是WePY相关问题，原生小程序问题去[开发者论坛](https://developers.weixin.qq.com/)。
- 已经在issue中搜索过，并且没有找到相似的issue或者解决方案。
- 完善下面模板中的信息

如果已经满足以上条件，我们提供了issue的标准模版，请按照模板填写。

​             

##  Pull requests

我们除了希望听到您的反馈和建议外，我们也希望您接受代码形式的直接帮助，对我们的GitHub发出pull request请求。

以下是具体步骤：

#### Fork仓库

1. 将需要参与的项目仓库fork到自己的github中；

#### git clone这个fork的项目

1. 将自己的github中，找到fork下来的项目，git clone 到本地。

#### 添加wepy仓库

1. 接着上一步，在该项目中，执行以下操作，将上游仓库连接到本地仓库，即我们fork的地址：

```
git remote add <name> <url>
//例如：
git remote add wepy https://github.com/Tencent/wepy.git
```

#### 保持与wepy仓库的同步

1. 更新上游仓库

```
git pull --rebase <name> <branch>
//等同于以下两条命令
git fetch <name> <branch>
git rebase <name>/<branch>
```

#### commit信息提交

`commit`信息请遵循[commit消息约定](./CONTRIBUTING_COMMIT.md)，以便可以自动生成`changelogs`。具体格式请参考commit文档规范。



#### 开发调试代码

```
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