import loader from './loader';
import util from './util';

export default function (filepath) {
    let config = util.getConfig();

    if (config.eslint) {
        const compiler = loader.load('wepy-eslint');
        // 使用 eslint
        const esConfig = Object.assign({
            useEslintrc: true,
            extensions: ['.js', config.wpyExt || '.wpy']
        }, config.eslint === true ? {} : config.eslint);
        compiler(esConfig, filepath);
    }
};
