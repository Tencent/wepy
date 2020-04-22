const download = require('download');
const downloadGitRepo = require('download-git-repo');

/**
 * download official template zip
 * @param {*} template template name
 */
exports = module.exports = {
  downloadOfficialZip(template, dist, options) {
    const templateName = template.split('#')[0];
    const branch = template.split('#')[1] || '2.0.x';
    if (branch === '2.0.x') {
      return this.downloadFromCos(templateName, dist, options).catch(() => {
        return this.downloadFromGitRaw(branch, templateName, dist, options);
      });
    } else {
      return this.downloadFromGitRaw(branch, templateName, dist, options);
    }
  },
  downloadFromGitRaw(template, dist, options, branch = '2.0.x') {
    const rawUrl = `https://raw.githubusercontent.com/wepyjs/wepy_templates/${branch}/zips/${template}.zip`;
    return download(rawUrl, dist, options).catch(e => {
      e.url = rawUrl;
      throw e;
    });
  },
  downloadFromCos(template, dist, options) {
    const cosUrl = `https://wepy-templates-1251238373.cos.ap-guangzhou.myqcloud.com/${template}.zip`;
    return download(cosUrl, dist, options).catch(e => {
      e.url = cosUrl;
      throw e;
    });
  },
  downloadRepo(template, dist, opt) {
    return new Promise((resolve, reject) => {
      downloadGitRepo(template, dist, opt, err => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }
};
