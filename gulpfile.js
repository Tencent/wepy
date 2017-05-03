var fs      = require('fs');
var path    = require("path");
var watch = require("gulp-watch");
var newer = require('gulp-newer');
var lec = require('gulp-line-ending-corrector');
var plumber = require("gulp-plumber");
var babel   = require("gulp-babel");
var gutil   = require("gulp-util");
var through = require("through2");
var gulp    = require("gulp");
var chalk   = require("chalk");
var gulpif = require('gulp-if');
var mkdirp = require('mkpath');

var scripts = ['./packages/*/src/**/*.js', './packages/wepy-web/src/components/*.vue', './packages/wepy-web/src/apis/*.vue'];
var bins = "./packages/*/bin/**/*";
var srcEx, libFragment;


if (path.win32 === path) {
    srcEx = /(packages\\[^\\]+)\\src\\/;
    libFragment = "$1\\lib\\";
} else {
    srcEx = new RegExp("(packages/[^/]+)/src/");
    libFragment = "$1/lib/";
}


var mapToDest = function (path) { return path.replace(srcEx, libFragment); };
var dest = "packages";

gulp.task("default", ["build"]);

gulp.task('lec', function () {
    return gulp.src(bins, { base: "./" }).pipe(lec({eolc: 'LF', encoding:'utf8'})).pipe(gulp.dest('.'));
});

gulp.task("build", ['lec'], function () {
  return gulp.src(scripts)
    .pipe(plumber({
        errorHandler: function (err) {
            gutil.log(err.stack);
        }
    }))
    .pipe(newer({map: mapToDest}))
    .pipe(through.obj(function (file, enc, callback) {
        file._path = file.path;
        file.path = file.path.replace(srcEx, libFragment);
        callback(null, file);
    }))
    .pipe(gulpif((file) => path.parse(file.path).ext !== '.vue', through.obj(function (file, enc, callback) {
        gutil.log("Compiling", "'" + chalk.cyan(file.path) + "'...");
        callback(null, file);
    })))
    // If it's vue, then copy only, else babel it.
    .pipe(gulpif((file) => path.parse(file.path).ext === '.vue', through.obj(function (file, enc, callback) {
        gutil.log("Copy Vue Component", "'" + chalk.cyan(file._path) + "'...");
        mkdirp.sync(path.parse(file.path).dir);
        fs.createReadStream(file._path).pipe(fs.createWriteStream(file.path));
        callback(null, file);
    }), babel()))
    .pipe(gulp.dest(dest));
});
gulp.task("build-watch", function () {
    return gulp.src(scripts)
        .pipe(plumber({
            errorHandler: function (err) {
                gutil.log(err.stack);
            }
        }))
        .pipe(through.obj(function (file, enc, callback) {
            file._path = file.path;
            file.path = file.path.replace(srcEx, libFragment);
            callback(null, file);
        }))
        .pipe(newer(dest))
        .pipe(gulpif((file) => path.parse(file.path).ext !== '.vue', through.obj(function (file, enc, callback) {
            gutil.log("Compiling", "'" + chalk.cyan(file._path) + "'...");
            callback(null, file);
        })))
        // If it's vue, then copy only, else babel it.
        .pipe(gulpif((file) => path.parse(file.path).ext === '.vue', through.obj(function (file, enc, callback) {
            gutil.log("Copy Vue Component", "'" + chalk.cyan(file._path) + "'...");
            mkdirp.sync(path.parse(file.path).dir);
            fs.createReadStream(file._path).pipe(fs.createWriteStream(file.path));
            callback(null, file);
        }), babel()))
        .pipe(gulp.dest(dest));
});

gulp.task("watch", ["build-watch"], function (callback) {
    watch(scripts, {debounceDelay: 200}, function () {
        gulp.start("build-watch");
    });
});