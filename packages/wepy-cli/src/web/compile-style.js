import util from '../util';
import loader from '../loader';

import rpxConvert from '../style-compiler/rpx-convert';

import { getInstance } from './modulemap';

export default {
    compile (wpy) {
        let mmap = getInstance();
        let config = util.getConfig();
        let compiler = loader.loadCompiler(wpy.style.type);

        if (!compiler) {
            return;
        }
        return compiler(wpy.style.code, config.compilers[wpy.style.type] || {}, wpy.style.src).then(rst => {
            let styleId = mmap.add(wpy.style.src + '-style', {
                type: 'style',
                source: wpy
            });
            wpy.style.id = styleId;
            wpy.style.code = rpxConvert(rst);
        });
    }
}
