import path from  'path';

import util from './util';
import cache from './cache';
import loader from './loader';


export default {
    compile (config, opath) {
        let src = cache.getSrc();
        let dist = cache.getDist();
        let wepyrc = cache.getConfig();
        if (wepyrc.output === 'ant' && config.navigationBarTitleText && !config.defaultTitle) {
            config.defaultTitle = config.navigationBarTitleText;
        }
        let target = util.getDistPath(opath, 'json', src, dist);
        let plg = new loader.PluginHelper(wepyrc.plugins, {
            type: 'config',
            code: JSON.stringify(config),
            file: target,
            output (p) {
                util.output(p.action, p.file);
            },
            done (result) {
                util.output('写入', result.file);
                util.writeFile(target, result.code);
            }
        });
    }
}