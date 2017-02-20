import path from 'path';
import fs from 'fs';
import {DOMParser} from 'xmldom';
import cache from './cache';
import util from './util';

import cConfig from './compile-config';
/*import cLess from './compile-less';
import cSass from './compile-sass';
import cCss from './compile-css';*/
import cStyle from './compile-style';
import cTemplate from './compile-template';
import cScript from './compile-script';
import loader from './loader';

export default {
    createParser () {
        return new DOMParser({errorHandler: {
            warning (x) {
                if (x.indexOf('missed value!!') > -1) {
                    // ignore warnings
                } else
                    util.warning(x);
            }
        }});
    },

    grabConfigFromScript(str, n) {
        let stash = [], rst = '';
        for (let i = n, l = str.length; i < l; i++) {
            if (str[i] === '{')
                stash.push('{');
            if (str[i] === '}') {
                stash.pop();
                if (stash.length === 0) {
                    rst += '}';
                    break;
                }
            }
            if (stash.length) {
                rst += str[i];
            }
        }
        return rst;
    },
    /*
    Use components instead, unused functions
     */
    resolveRelation (xml) {
        let requires = [];
        let matchs = xml.match(/<component[^/>]*\/>/ig);

        (matchs || []).forEach(function (m) {
            let rst;
            if (m.indexOf('path') > -1) {
                rst = m.match(/path\s*=\s*['"](.*)['"]/);
            } else {
                rst = m.match(/id\s*=\s*['"](.*)['"]/);
            }
            if (rst[1] && requires.indexOf(rst[1]) === -1)
                requires.push(rst[1]);
        });
        return requires;
    },

    resolveWpy (xml, opath) {
        let config = util.getConfig();
        let filepath;

        if (arguments.length === 1) {

            if (typeof(xml) === 'object' && xml.dir) {
                opath = xml;
                filepath = path.join(xml.dir, xml.base);
            } else {
                opath = path.parse(xml);
                filepath = xml;
            }
            let content = util.readFile(filepath);

            if (content === null) {
                util.error('打开文件失败: ' + filepath)
                return;
            }
            let startlen = content.indexOf('<script') + 7;
            while(content[startlen++] !== '>') {
                // do nothing;
            }
            content = util.encode(content, startlen, content.indexOf('</script>') - 1);

            // replace :attr to v-bind:attr
            content = content.replace(/<[\w-\_]*\s[^>]*>/ig, (tag) => {
                return tag.replace(/\s+:([\w-_]*)([\.\w]*)\s*=/ig, (attr, name, type) => {
                    if (type === '.once' || type === '.sync') {
                    }
                    else
                        type = '.once';
                    return ` v-bind:${name}${type}=`;
                });
            })
            xml = this.createParser().parseFromString(content);
        }

        let rst = {style: {code: ''}, template: {code: ''}, script: {code: ''}};

        [].slice.call(xml.childNodes || []).forEach((child) => {
            if (child.nodeName === 'style' || child.nodeName === 'template' || child.nodeName === 'script') {
                rst[child.nodeName].src = child.getAttribute('src');
                rst[child.nodeName].type = child.getAttribute('lang') || child.getAttribute('type');

                if (rst[child.nodeName].src) {
                    rst[child.nodeName].src = path.resolve(opath.dir, rst[child.nodeName].src);
                }

                if (rst[child.nodeName].src && util.isFile(rst[child.nodeName].src)) {
                    rst[child.nodeName].code = util.readFile(rst[child.nodeName].src, 'utf-8');
                    if (rst[child.nodeName].code === null) {
                        throw '打开文件失败: ' + rst[child.nodeName].src;
                    }
                } else {
                    [].slice.call(child.childNodes || []).forEach((c) => {
                        rst[child.nodeName].code += util.decode(c.toString());
                    });
                }

                if (!rst[child.nodeName].src)
                    rst[child.nodeName].src = path.join(opath.dir, opath.name + opath.ext);
            }
        });

        /*
        Use components instead
        if (rst.template.code) {
            rst.template.requires = this.resolveRelation(rst.template.code);
        }*/

        // default type
        rst.style.type = rst.style.type || 'css';
        rst.template.type = rst.template.type || 'wxml';
        rst.script.type = rst.script.type || 'babel';

        // get config
        (() => {
            let match = rst.script.code.match(/[\s\r\n]config\s*=[\s\r\n]*/);
            match = match ? match[0] : undefined;

            rst.config = match ? this.grabConfigFromScript(rst.script.code, rst.script.code.indexOf(match) + match.length) : false;
            try {
                if (rst.config) {
                    rst.config = new Function(`return ${rst.config}`)();
                }
            } catch (e) {
                util.output('错误', path.join(opath.dir, opath.base));
                util.error(`解析config出错，报错信息：${e}\r\n${rst.config}`);
            }
        })();

        // pre compile wxml
        (() => {
            if (rst.template.type !== 'wxml' && rst.template.type !== 'xml') {
                let compiler = loader.loadCompiler(rst.template.type);
                if (compiler && compiler.sync) {
                    rst.template.code = compiler.sync(rst.template.code, config.compilers[rst.template.type] || {});
                    rst.template.type = 'wxml';
                }
            }
        })();

        // get imports
        (() => {
            let coms = {};
            rst.script.code.replace(/import\s*([\w\-\_]*)\s*from\s*['"]([\w\-\_\.\/]*)['"]/ig, (match, com, path) => {
                coms[com] = path;
            });

            let match = rst.script.code.match(/[\s\r\n]components\s*=[\s\r\n]*/);
            match = match ? match[0] : undefined;
            let components = match ? this.grabConfigFromScript(rst.script.code, rst.script.code.indexOf(match) + match.length) : false;
            let vars = Object.keys(coms).map((com, i) => `var ${com} = "${coms[com]}";`).join('\r\n');
            try {
                if (components) {
                    rst.template.components = new Function(`${vars}\r\nreturn ${components}`)();
                } else {
                    rst.template.components = {};
                }
            } catch (e) {
                util.output('错误', path.join(opath.dir, opath.base));
                util.error(`解析components出错，报错信息：${e}\r\n${vars}\r\nreturn ${components}`);
            }
        })();


        // get props
        (() => {
            let coms = Object.keys(rst.template.components);
            let elems = [];
            let props = {};
            coms.concat('component').forEach((com) => {
                elems = elems.concat(util.elemToArray(xml.getElementsByTagName(com)));
            });

            elems.forEach((elem) => {
                let comid = util.getComId(elem);
                [].slice.call(elem.attributes || []).forEach((attr) => {
                    if (attr.name !== 'id' && attr.name !== 'path') {
                        if (!props[comid])
                            props[comid] = {};
                        props[comid][attr.name] = attr.value;
                    }
                });
            });

            if (Object.keys(props).length) {
                rst.script.code =rst.script.code.replace(/[\s\r\n]components\s*=[\s\r\n]*/, (match, item, index) => {
                    return `$props = ${JSON.stringify(props)};\r\n${match}`;
                });
            }
        })();

        return rst;
    },

    remove (opath, ext) {
        let src = cache.getSrc();
        let dist = cache.getDist();
        ext = ext || opath.substr(1);
        let target = util.getDistPath(opath, ext, src, dist);
        if (util.isFile(target)) {
            util.log('配置: ' + path.relative(util.currentDir, target), '删除');
            fs.unlinkSync(target);
        }
    },

    compile (opath) {
        let filepath = path.join(opath.dir, opath.base);
        let src = cache.getSrc();
        let dist = cache.getDist();
        let wpyExt = cache.getExt();
        let pages = cache.getPages();

        let type = '';

        let rst = {style: {code: ''}, template: {code: ''}, script: {code: ''}};

        let relative = path.relative(util.currentDir, filepath);

        if (filepath === path.join(util.currentDir, src, 'app' + wpyExt)) {
            type = 'app';
            util.log('入口: ' + relative, '编译');
        } else if (pages.indexOf(relative) > -1) {
            type = 'page';
            util.log('页面: ' + relative, '编译');
        } else if (relative.indexOf(path.sep + 'components' + path.sep) > -1){
            type = 'component';
            util.log('组件: ' + relative, '编译');
        } else {
            util.log('Other: ' + relative, '编译');
        }

        let wpy = this.resolveWpy(opath);

        if (type === 'app') { // 第一个编译
            cache.setPages(wpy.config.pages.map(v => path.join(src, v + wpyExt)));
        }

        if (wpy.config) {
            cConfig.compile(wpy.config, opath);
        } else {
            this.remove(opath, 'json');
        }
        if (wpy.style.code || Object.keys(wpy.template.components).length) {
            let requires = [];
            let k, tmp;
            for (k in wpy.template.components) {
                tmp = wpy.template.components[k];
                if (tmp.indexOf('.') === -1) {
                    requires.push(tmp); // 第三方组件
                } else {
                    requires.push(path.join(opath.dir, wpy.template.components[k]));
                }
            }
            cStyle.compile(wpy.style.type, wpy.style.code, requires, opath);
        } else {
            this.remove(opath, 'wxss');
        }

        if (wpy.template.code && (type !== 'app' && type !== 'component')) { // App 和 Component 不编译 wxml
            //cTemplate.compile(wpy.template.type, wpy.template.code, opath);
            cTemplate.compile(wpy.template);
        }

        if (wpy.script.code) {
            cScript.compile(wpy.script.type, wpy.script.code, type, opath);
        }
    }
};
