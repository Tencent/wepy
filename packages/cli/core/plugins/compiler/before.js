const path = require('path');
const CONST = require('../../util/const');

exports = module.exports = function () {
  const styleHooker = (content, options, ctx) => {
    options.supportObject = true;
  };

  this.register('before-compiler-less', styleHooker);
  this.register('before-compiler-sass', styleHooker);
  this.register('before-compiler-stylus', styleHooker);


  // When file changed in --watch model
  this.register('before-wepy-watch-file-changed', function beforeWatchFileChanged(buildTask) {
    const changedFile = buildTask.changed;
    const parsedPath = path.parse(changedFile);
    const weappCacheKey = path.join(parsedPath.dir, parsedPath.name) + CONST.WEAPP_EXT;

    const isInvolved = this.fileDep.isInvolved(changedFile);
    const isWeappInvolved = this.fileDep.isInvolved(weappCacheKey);

    this.fileDep.getSources(changedFile).forEach(depedFile => {
      if (path.isAbsolute(depedFile)) {
        // clear the file hash, to remove the file cache
        this.compiled[depedFile].hash = '';
      }
    });

    if (isInvolved) {
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

    if (isWeappInvolved) {
      this.logger.silly('watch', `Watcher triggered by file changes: ${changedFile}`);
      buildTask.changed = weappCacheKey;
      buildTask = this.hookSeq('wepy-watch-file-changed-weapp', buildTask);
    }

    return Promise.resolve(buildTask);
  });

  this.register('wepy-watch-file-changed-weapp', function (buildTask) {
    buildTask.weapp = true;
    buildTask.files.push(buildTask.changed);

    return buildTask;
  });

  // when .wxs file changed
  this.register('wepy-watch-file-changed-wxs', function (buildTask) {
    let queue = [];
    const wpyExtFiles = [];

    // find wpyExtFiles of deped
    queue = queue.concat(this.fileDep.getSources(buildTask.changed));
    while (queue.length > 0) {
      const depedFile = queue.shift();
      if (path.extname(depedFile) === this.options.wpyExt) {
        wpyExtFiles.push(depedFile);
      } else {
        queue = queue.concat(this.fileDep.getSources(depedFile));
      }
    }

    buildTask.files = wpyExtFiles;
    if (buildTask.files.includes(this.options.entry)) {
      buildTask.partial = false;
    }

    return buildTask;
  });

  // when .js, .ts file changed
  ['js', 'ts'].forEach(ext => {
    this.register('wepy-watch-file-changed-' + ext, function (buildTask) {
      buildTask.outputAssets = true;
      buildTask.files.push(buildTask.changed);
      buildTask.assetExt = ext;

      return buildTask;
    });
  });
};
