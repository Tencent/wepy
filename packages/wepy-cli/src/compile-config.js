import path from  'path';

import util from './util';
import cache from './cache';


export default {
    compile (config, opath) {
        let src = cache.getSrc();
        let dist = cache.getDist();
        let wepyrc = cache.getConfig();
        if (wepyrc.output === 'ant' && config.navigationBarTitleText && !config.defaultTitle) {
            config.defaultTitle = config.navigationBarTitleText;
        }
        let target = util.getDistPath(opath, 'json', src, dist);
        util.log('配置: ' + path.relative(util.currentDir, target), '写入');
        util.writeFile(target, JSON.stringify(config));
    }
}