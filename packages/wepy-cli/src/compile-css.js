import path from 'path';
import fs from 'fs';
import loader from './plugins/loader';
import util from './util';
import cache from './cache';

export default {
    compile (content, requires, opath) {
        let config = util.getConfig();
        let src = cache.getSrc();
        let dist = cache.getDist();
        let ext = cache.getExt();
        
        if (arguments.length === 1) {
            requires = [];
            opath = content;
            content = util.readFile(path.join(opath.dir, opath.base));
        }

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
                        res.css = '@import "' + relative + '";\n' + res.css;
                    }
                }
            });
        }
        let target = util.getDistPath(opath, 'wxss', src, dist);

        let plg = new loader(config.plugins, {
            type: 'css',
            code: content,
            file: target,
            done (rst) {
                util.output('写入', rst.file);
                util.writeFile(target, rst.code);
            }
        });
        /*
        util.log('CSS : ' + path.relative(util.currentDir, target), '写入');
        util.writeFile(target, content);*/
    }
}