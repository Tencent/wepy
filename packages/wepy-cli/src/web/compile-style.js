import util from '../util';
import loader from '../loader';

import rpxConvert from '../style-compiler/rpx-convert';
import scopedHandler from '../style-compiler/scoped';

import { getInstance } from './modulemap';

export default {

    compile (wpy) {
        let mmap = getInstance();
        let config = util.getConfig();

        let allPromises = [];
        wpy.style.forEach((style, i) => {
            let lang = style.type || 'css';
            const content = style.code;
            const scoped = style.scoped;

            if (lang === 'scss')
                lang = 'sass';

            let compiler = loader.loadCompiler(lang);

            if (!compiler) {
                throw `未发现相关 ${lang} 编译器配置，请检查wepy.config.js文件。`;
            }

            allPromises.push(compiler(content, config.compilers[lang] || {}, style.src).then((css) => {
                // 处理 scoped
                if (scoped) {
                    // 存在有 scoped 的 style
                    return scopedHandler(wpy.moduleId, css).then((cssContent) => {
                        let styleId = mmap.add(style.src + '-style', {
                            type: 'style',
                            source: wpy
                        });
                        wpy.style.id = styleId;
                        style.code = rpxConvert(cssContent);
                    });
                } else {
                    let styleId = mmap.add(style.src + '-style', {
                        type: 'style',
                        source: wpy
                    });
                    wpy.style.id = styleId;
                    style.code = rpxConvert(css);
                }
            }));

        });

        return Promise.all(allPromises);
    }
}
