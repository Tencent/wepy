## wepy-cli

> 适用于1.7.0之后的版本

## 安装 (Installation)

``` bash
npm install -g wepy-cli
wepy init standard my-project
```
## 使用 (Usage)

```bash
Commands:

    init [options] <template-name> [project-name]  generate a new project from a template
    build [options]                                build your project
    list [options]                                 list available official templates
    upgrade [options]                              upgrade to the latest version
    devtoool [options] <action-name> [action-value] commander for login, preview, upload and other operations.

```

## 拉取模板 (Pulling Templates)

```bash
Usage: init <template-name> [project-name]

  generate a new project from a template


  Options:

    -c --clone  use git clone
    --offline   use cached template
    -h, --help  output usage information

  Example:

   # create a new project with an official template
  $ wepy init standard my-project

   # create a new project straight from a github template
  $ wepy init username/repo my-project
```
![image](https://user-images.githubusercontent.com/16918885/36104960-64ac836e-104e-11e8-84de-c52f0a961464.png)

## 查找官方/第三方模板资源

``` bash
Usage: list [options]

  list available official templates


  Options:

    -g, --github  list all registered github projects
    -h, --help    output usage information
```

![image](https://user-images.githubusercontent.com/16918885/36105399-6efda388-104f-11e8-86a0-c659c9f1e595.png)

## 编译

```bash
Usage: build [options]

  build your project


  Options:

    -f, --file <file>      待编译wpy文件
    -s, --source <source>  源码目录
    -t, --target <target>  生成代码目录
    -o, --output <type>    编译类型：web，weapp。默认为weapp
    -p, --platform <type>  编译平台：browser, wechat，qq。默认为browser
    -w, --watch            监听文件改动
    --no-cache             对于引用到的文件，即使无改动也会再次编译
    -h, --help             output usage information
```

## 升级wepy-cli

``` bash
Usage: upgrade [options]

  upgrade to the latest version


  Options:

    --cli   upgrade wepy-cli
    --wepy  upgrade wepy
    -h, --help  output usage information
```

## 开发工具

``` bash
Usage: devtool [options] <action-name> [action-value]

  commander for login, preview, upload and other operations.
  
  
  Options:
  
    --login-qr-output [format[@path]]', '指定二维码输出形式.
    --preview-qr-output [format[@path]]', '指定二维码输出形式，语义同登录用的选项 --login-qr-output.
    --upload-desc <desc>', '上传代码时的备注.
    
  
  Example:
  
    # 打开开发工具
    wepy devtool open
    
    # 打开路径 /Users/username/demo 下的项目
    wepy devtool open /Users/username/demo
    
    
    # 登录，在终端中打印登录二维码
    wepy devtool login
    
    # 登录，在终端中打印登录 base64 形式的二维码
    wepy devtool login --login-qr-output base64
    
    # 登录，二维码转成 base64 并存到文件 /Users/username/code.txt 
     wepy devtool login --login-qr-output base64@/Users/username/code.txt
    
    
    
    # 预览，在终端中打印登录二维码
    wepy devtool preview /Users/username/demo
    
    # 预览，二维码转成 base64 并存到文件 /Users/username/code.txt
    wepy devtool preview /Users/username/demo --preview-qr-output base64@/Users/username/code.txt
    
    
    
    # 上传路径 /Users/username/demo 下的项目，指定版本号为 1.0.0，版本备注为 initial release
    wepy devtool upload 1.0.0@/Users/username/demo --upload-desc 'initial release'
    
    
    
    # 提交测试路径 /Users/username/demo 下的项目
    wepy devtool test /Users/username/demo
    
```
