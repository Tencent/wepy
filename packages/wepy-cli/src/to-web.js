import path from 'path';
import util from './util';
import cache from './cache';
import compileWpy from './compile-wpy';

import loader from './loader';

const WEAPP_TAGS = ['view', 'text', 'navigator', 'image'];
const HTML_TAGS = ['div', 'span', 'a', 'img'];

let appPath;

export default {

    replaceWXML (str) {
        WEAPP_TAGS.forEach((v, i) => {
            let openreg = new RegExp(`<${v}`, 'ig'),
                closereg = new RegExp(`<\\${v}`, 'ig');
            str = str.replace(openreg, `<${HTML_TAGS[i]}`).replace(closereg, `<\\${HTML_TAGS[i]}`);
        });
        return str.replace(/[\r\n]/ig, '');
    },

    compile (wpy, type, opath) {
        let config = util.getConfig();

        // template
        wpy.template.code = this.replaceWXML(wpy.template.code);

        // javascript
        let compiler = loader.loadCompiler(wpy.script.type);

        if (!compiler) {
            return;
        }


        compiler(wpy.script.code, config.compilers[wpy.script.type] || {}).then(compileResult => {
            let sourceMap;
            if (typeof(compileResult) === 'string') {
                wpy.script.code = compileResult;
            } else {
                sourceMap = compileResult.map;
                wpy.script.code = compileResult.code;
            }
            if (type !== 'npm') {
                if (type === 'page' || type === 'app') {
                    let defaultExport = 'exports.default';
                    let matchs = wpy.script.code.match(/exports\.default\s*=\s*(\w+);/i);
                    if (matchs) {
                        defaultExport = matchs[1];
                        wpy.script.code = wpy.script.code.replace(/exports\.default\s*=\s*(\w+);/i, '');

                        if (type === 'page') {
                            let pagePath = path.join(path.relative(appPath.dir, opath.dir), opath.name).replace(/\\/ig, '/');
                            wpy.script.code += `\nPage(require('wepy').default.$createPage(${defaultExport} , '${pagePath}', '${wpy.template.code}'));\n`;
                        } else {
                            appPath = opath;
                            wpy.script.code += `\nApp(require('wepy').default.$createApp(${defaultExport}));\n`;
                        }
                    }
                }
            }

            //wpy.script.code = this.resolveDeps(wpy.script.code, type, opath);

            if (type === 'npm' && opath.ext === '.wpy') { // 第三方npm组件，后缀恒为wpy
                compileWpy.compile(opath);
                return;
            }

            let target;
            if (type !== 'npm') {
                target = util.getDistPath(opath, 'js');
            } else {
                // code = this.npmHack(opath.base, code);
                target = path.join(npmPath, path.relative(modulesPath, path.join(opath.dir, opath.base)));
            }

            if (sourceMap) {
                sourceMap.sources = [opath.name + '.js'];
                sourceMap.file = opath.name + '.js';
                var Base64 = require('js-base64').Base64;
                wpy.script.code += `\r\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${Base64.encode(JSON.stringify(sourceMap))}`;
            }

            let plg = new loader.PluginHelper(config.plugins, {
                type: type,
                code: wpy.script.code,
                file: target,
                output (p) {
                    util.output(p.action, p.file);
                },
                done (result) {
                    util.output('写入', result.file);
                    util.writeFile(target, result.code);
                }
            });
            // 缓存文件修改时间戳
            cache.saveBuildCache();
        }).catch((e) => {
            console.log(e);
        });
    }

}
