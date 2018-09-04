const download = require('download');
const downloadGitRepo = require('download-git-repo');


/**
 * download official template zip
 * @param {*} template template name
 */
exports = module.exports = {
    downloadOfficialZip (template, dist, options) {
        const templateName = template.split('#')[0];
        const branch = template.split('#')[1] || '2.0.x';
        return download(`https://raw.githubusercontent.com/wepyjs/wepy_templates/${branch}/zips/${templateName}.zip`, dist, options);
    },
    downloadRepo (...args) {
        return downloadGitRepo(...args);
    }
};
