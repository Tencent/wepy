## 1.1.6 (2016-12-02)
* 添加了对小程序页面所有响应事件的支持
* 修改wepy.config.js支持plugins。
* 添加UglifyJsPlugin，在编译时对生成的所有JS文件进行压缩。
* 添加ImageMinPlugin(不推荐使用，处理大图片时还有问题)，
* 添加`wepy build --no-cache`参数，编译时会重新编译所有依赖文件。
* `wepy new demo`时，由在当前目录下生成项目改为创建demo目录，然后再生成项目。
* 更新生成demo支持最新功能。

## 1.1.4 (2016-12-01)

* 添加了小程序其它页面事件的支持
* 修改默认配置文件.wepyrc为wepy.config.js，方便以后功能扩展。（兼容老配置文件）

## 1.1.3 (2016-11-28)

* 修复SASS编译异常导致watch结束的BUG
* 修复子组件修改时不会触发父组件更新的BUG
* 修复`$invoke('../')`的BUG
* 修复页面onLoad事件中传参的BUG

## 1.1.1 (2016-11-23)

* 添加了对sass/scss的编译支持
* .wepyrc中加入对less/sass的配置支持
* .wepyrc中添加`wpyExt`选项
* 更新生成模板