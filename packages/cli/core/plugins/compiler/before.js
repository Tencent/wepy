const path = require('path');

exports = module.exports = function () {
    const styleHooker = (content, options, ctx) => {
      options.supportObject = true;
    };

    this.register('before-compiler-less', styleHooker);
    this.register('before-compiler-sass', styleHooker);
    this.register('before-compiler-stylus', styleHooker);


    // When file changed in --watch model
    this.register('before-wepy-watch-file-changed', function beforeWatchFileChanged (buildTask) {
      const changedFile = buildTask.changed;
      let involvedFile = this.involved[changedFile];
      if (typeof involvedFile === 'string' && path.isAbsolute(involvedFile)) {
        // clear the file hash, to remove the file cache
        this.compiled[involvedFile].hash = '';
      }

      if (involvedFile) {
        this.logger.silly('watch', `Watcher triggered by file changes: ${changedFile}`);
        const isEntry = (changedFile === this.options.entry);
        let ext = path.extname(changedFile);
        const isWPY = (ext === this.options.wpyExt);
        ext = ext.substring(1);

        if (isEntry) {
          buildTask.partial = false;
        } else if (isWPY) {
          buildTask.partial = true;
          buildTask.files.push(changedFile);
        } else {
          buildTask = this.hookSeq('wepy-watch-file-changed-' + ext, buildTask);
        }
      }
      return Promise.resolve(buildTask);
    });

    // when .wxs file changed
    this.register('wepy-watch-file-changed-wxs', function (buildTask) {
      buildTask.files = this.fileDep.getSources(buildTask.changed);
      buildTask.partial = !buildTask.files.includes(this.options.entry);

      return buildTask;
    });
};
