const path = require('path');
const fs = require('fs');
const loaderUtils = require('loader-utils');


exports = module.exports = function () {
  this.register('error-handler', function (handler, errInfo, extra) {
    if (arguments.length === 1) {
      if (typeof handler === 'object') {
        errInfo = handler;
        let { ctx, message, type, snapshot, file, title } = errInfo;
        let output = 'Message:\n  ' + message;
        if (ctx && ctx.file) {
          file = ctx.file;
        }
        if (file) {
          output += '\n' + 'File:\n  ' + file;
        }
        if (snapshot) {
          output += '\n' + 'Snapshot:\n' + snapshot;
        }
        this.logger[type](title, output);
      }
    } else {
      return this.hookUnique('error-handler-' + handler, errInfo, extra);
    }
  });

  this.register('error-handler-script', function (errInfo, extra) {

    let { ctx, message, type, title } = errInfo;
    let codeFrame = '';

    if (extra) {
      extra.type = 'script';
      codeFrame = 'Snapshot:\n' + this.hookUnique('gen-code-frame', ctx.sfc.script.content, extra, message);
    }
    let output = 'Message:\n  ' + message;
    output += '\n' + 'File:\n  ' + ctx.file;
    output += '\n' + codeFrame;
    this.logger[type](title, output);

  });

  this.register('error-handler-template', function (errInfo, extra) {
    let { ctx, message, type, title } = errInfo;

    let codeFrame = '';

    if (extra) {
      extra.type = 'template';
      codeFrame = 'Snapshot:\n' + this.hookUnique('gen-code-frame', ctx.sfc.template.content, extra, message);
    }
    let output = 'Message:\n  ' + message;
    output += '\n' + 'File:\n  ' + ctx.file;
    output += '\n' + codeFrame;
    this.logger[type](title, output);
  });
}
