const path = require('path');
const fs = require('fs');
const loaderUtils = require('loader-utils');


exports = module.exports = function () {
  this.register('error-handler', function (type, errInfo, extra) {
    return this.hookUnique('error-handler-' + type, errInfo, extra);
  });

  this.register('error-handler-template', function (errInfo, extra) {
    let { ctx, message, type, title } = errInfo;

    let codeFrame = '';

    if (extra.item && extra.attr && extra.expr) {
      extra.type = 'template';
      codeFrame = 'Snapshot:\n' + this.hookUnique('gen-code-frame', ctx.sfc.template.content, extra);
    }
    let output = 'Message:\n' + message;
    output += '\n' + 'File:\n' + ctx.file;
    output += '\n' + codeFrame;
    this.logger[type](title, output);
  });
}
