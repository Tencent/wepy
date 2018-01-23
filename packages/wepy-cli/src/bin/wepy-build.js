import program from 'commander';
import compile from '../compile';

program
    .option('-f, --file <file>', '待编译wpy文件')
    .option('-s, --source <source>', '源码目录')
    .option('-t, --target <target>', '生成代码目录')
    .option('-o, --output <type>', '编译类型：web，weapp。默认为weapp')
    .option('-p, --platform <type>', '编译平台：browser, wechat，qq。默认为browser')
    .option('-w, --watch', '监听文件改动')
    .option('--no-cache', '对于引用到的文件，即使无改动也会再次编译')
    .parse(process.argv);

if (compile.init(program)) {
    compile.build(program);
}