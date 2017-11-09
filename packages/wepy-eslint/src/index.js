import eslint from 'eslint';
import formatter from 'eslint-friendly-formatter';

export default function (esConfig, filepath) {
    if (!esConfig.formatter) {
        esConfig.formatter = formatter;
    }
    esConfig.output = esConfig.output === undefined ? true : esConfig.output;
    const engine = new eslint.CLIEngine(esConfig);
    const report = engine.executeOnFiles([filepath]);
    const formatter = engine.getFormatter();
    let rst = formatter(report.results);
    if (rst && esConfig.output) {
      console.log(rst);
    }
    return rst;
};
