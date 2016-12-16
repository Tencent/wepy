var path    = require("path");
var watch = require("gulp-watch");
var newer = require('gulp-newer');
var plumber = require("gulp-plumber");
var babel   = require("gulp-babel");
var gutil   = require("gulp-util");
var through = require("through2");
var gulp    = require("gulp");
var chalk   = require("chalk");

var scripts = "./packages/*/src/**/*.js";
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

gulp.task("build", function () {
  return gulp.src(scripts)
    .pipe(plumber({
        errorHandler: function (err) {
            gutil.log(err.stack);
        }
    }))
    .pipe(newer({map: mapToDest}))
    .pipe(through.obj(function (file, enc, callback) {
        gutil.log("Compiling", "'" + chalk.cyan(file.path) + "'...");
        callback(null, file);
    }))
    .pipe(babel())
    .pipe(through.obj(function (file, enc, callback) {
        file._path = file.path;
        file.path = mapToDest(file.path);
        callback(null, file);
    }))
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
        .pipe(through.obj(function (file, enc, callback) {
            gutil.log("Compiling", "'" + chalk.cyan(file._path) + "'...");
            callback(null, file);
        }))
        .pipe(babel())
        .pipe(gulp.dest(dest));
});

gulp.task("watch", ["build-watch"], function (callback) {
    watch(scripts, {debounceDelay: 200}, function () {
        gulp.start("build-watch");
    });
});