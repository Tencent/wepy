exports = module.exports = function() {
  this.register('error-handler', function(handler, errInfo, extra) {
    if (arguments.length === 1) {
      if (typeof handler === 'object') {
        errInfo = handler;
        let { chain, message, type, snapshot, file, title } = errInfo;
        let bead = chain.bead;
        let output = 'Message:\n  ' + message;
        if (bead && bead.path) {
          file = bead.path;
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

  this.register('error-handler-script', function(errInfo, extra) {
    let { chain, message, type, title, code, filename } = errInfo;
    let bead = chain.bead;
    let codeFrame = '';

    if (bead && bead.path) {
      filename = filename || bead.path;
    }
    if (bead && bead.content) {
      code = bead.content;
    }

    if (extra) {
      extra.type = 'script';
      codeFrame = 'Snapshot:\n' + this.hookUnique('gen-code-frame', code, extra, message);
    }

    let output = 'Message:\n  ' + message;
    output += '\n' + 'File:\n  ' + filename;
    output += '\n' + codeFrame;
    this.logger[type](title, output);
  });

  this.register('error-handler-template', function(errInfo, extra) {
    let { chain, message, type, title } = errInfo;
    let bead = chain.bead;
    let codeFrame = '';

    if (extra) {
      extra.type = 'template';
      codeFrame = 'Snapshot:\n' + this.hookUnique('gen-code-frame', bead.content, extra, message);
    }
    let output = 'Message:\n  ' + message;
    output += '\n' + 'File:\n  ' + bead.path;
    output += '\n' + codeFrame;
    this.logger[type](title, output);
  });
};
