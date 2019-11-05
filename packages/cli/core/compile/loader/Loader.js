const fs = require('fs');
const path = require('path');

export default class Loader {
  constructor() {}

  loadFile(bead, filepath, lang) {
    const pathObj = path.parse(filepath);
    if (!lang) {
      lang = this.get(pathObj.ext);
    }
    bead.content = fs.readFileSync(filepath, 'utf-8');
    return this.compiler.hookUnique('wepy-loader-' + lang, bead);
  }

  // TODO: use options
  getDefaultLang(ext) {
    const DEFAULT_LANG_MAP = {
      '.ts': 'typescript',
      '.wxss': 'css'
    };
    if (DEFAULT_LANG_MAP[ext]) {
      return DEFAULT_LANG_MAP[ext];
    }
    return ext.substring(1, ext.length - 1);
  }
}
