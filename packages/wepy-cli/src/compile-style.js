import path from 'path';
import fs from 'fs';
import util from './util';
import cache from './cache';

import loader from './loader';
import scopedHandler from './style-compiler/scoped';

const LANG_MAP = {
    'less': '.less',
    'sass': '.sass;.scss'
};

export default {
    compile (lang, content, scoped, requires, opath, moduleId) {
        let config = util.getConfig();
        let src = cache.getSrc();
        let dist = cache.getDist();
        let ext = cache.getExt();
        const filepath = path.join(opath.dir, opath.base);

        if (arguments.length === 2) {
            requires = [];
            scoped = '';
            moduleId = '';
            opath = content;
            content = util.readFile(filepath);
        }

        if (lang === 'scss')
            lang = 'sass';

        let compiler = loader.loadCompiler(lang);

        if (!compiler) {
            throw `未发现相关 ${lang} 编译器配置，请检查wepy.config.js文件。`;
        }

        compiler(content, config.compilers[lang] || {}, path.join(opath.dir, opath.base)).then((css) => {
            if (requires && requires.length) {
                requires.forEach((r) => {
                    let comsrc = util.findComponent(r);
                    let isNPM = false;

                    if (!comsrc) {
                        util.log('找不到组件：' + r, '错误');
                    } else {
                        if (comsrc.indexOf('node_modules') > -1) {
                            comsrc = util.getDistPath(path.parse(comsrc));
                            comsrc = comsrc.replace(ext, '.wxss').replace(`${path.sep}${dist}${path.sep}`, `${path.sep}${src}${path.sep}`);
                            isNPM = true;
                        }
                        let relative = path.relative(opath.dir + path.sep + opath.base, comsrc);
                        let code = util.readFile(comsrc);
                        if (isNPM || /<style/.test(code)) {
                            relative = relative.replace(ext, '.wxss').replace(/\\/ig, '/').replace('../', './');
                            css = '@import "' + relative + '";\n' + css;
                        }
                    }
                });
            }
            // 处理 scoped
            if (scoped) {
                return scopedHandler(moduleId, css, function (err, cssContent) {
                    if (!err) {
                        write2Target(cssContent);
                    }
                });
            } else {
                write2Target(css);
            }
            function write2Target(cssContent) {
                let target = util.getDistPath(opath, 'wxss', src, dist);

                let plg = new loader.PluginHelper(config.plugins, {
                    type: 'css',
                    code: cssContent,
                    file: target,
                    output (p) {
                        util.output(p.action, p.file);
                    },
                    done (rst) {
                        util.output('写入', rst.file);
                        util.writeFile(target, rst.code);
                    }
                });
            }
        }).catch((e) => {
            console.log(e);
        });
    }
}