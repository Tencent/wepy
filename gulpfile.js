/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

const fs               =             require('fs');
const path             =             require("path");
const eventStream      =             require('event-stream');
const watch            =             require("gulp-watch");
const newer            =             require('gulp-newer');
const lec              =             require('gulp-line-ending-corrector');
const plumber          =             require("gulp-plumber");
const babel            =             require("gulp-babel");
const gutil            =             require("gulp-util");
const through          =             require("through2");
const gulp             =             require("gulp");
const chalk            =             require("chalk");
const mkdirp           =             require('mkpath');
const clean            =             require('gulp-clean');

// for docs
const less             =             require('gulp-less');

const scripts = ['./packages/*/src/**/*.js', './packages/wepy-web/src/apis/*.js'];
const copyFiles = ['packages/wepy-web/src/components/', 'packages/wepy-web/src/apis/'];
const docs = ['docs/less/**/*.less'];
const bins = "./packages/*/bin/**/*";
const dest = "packages";

var srcEx, libFragment;

if (path.win32 === path) {
    srcEx = /(packages\\[^\\]+)\\src\\/;
    libFragment = "$1\\lib\\";
} else {
    srcEx = new RegExp("(packages/[^/]+)/src/");
    libFragment = "$1/lib/";
}

const mapToDest = (path) => path.replace(srcEx, libFragment);

const filelog = (title) => {
    return through.obj((file, enc, callback) => {
        file.path = file.path.replace(srcEx, libFragment);
        gutil.log(title, "'" + chalk.cyan(path.relative(process.cwd(), file.path)));
        callback(null, file);
    });
}

gulp.task("default", ["build"]);

gulp.task('clean', () => gulp.src('packages/**/lib', {read: false}).pipe(clean()));

gulp.task('lec', () => gulp.src(bins, { base: "./" }).pipe(filelog('Bin')).pipe(lec({eolc: 'LF', encoding:'utf8'})).pipe(gulp.dest('.')));

gulp.task('copy', () => eventStream.concat.apply(eventStream, copyFiles.map(dir => {
        let dest = dir.replace('src', 'lib');
        return gulp.src([`${dir}**.vue`, `${dir}**/**.less`])
            .pipe(newer(dest))
            .pipe(filelog('Copy'))
            .pipe(gulp.dest(dest))
    })
));

gulp.task("build", ['lec', 'copy'], () => {
    return gulp.src(scripts)
        .pipe(plumber({ errorHandler (err) { gutil.log(err.message + '\r\n' + err.codeFrame); }}))
        .pipe(newer({map: mapToDest}))
        .pipe(filelog('Compile'))
        .pipe(babel())
        .pipe(gulp.dest(dest));
});

gulp.task('doc-watch', () => {
    gulp.src(['docs/less/main.less', 'docs/less/donate.less'])
        .pipe(less())
        .pipe(filelog('Less'))
        .pipe(gulp.dest('docs/css'));
});
gulp.task("build-watch", () => {
    return gulp.src(scripts)
        .pipe(plumber({ errorHandler (err) { gutil.log(err.message + '\r\n' + err.codeFrame); }}))
        .pipe(through.obj(function (file, enc, callback) {
            file._path = file.path;
            file.path = file.path.replace(srcEx, libFragment);
            callback(null, file);
        }))
        .pipe(newer(dest))
        .pipe(filelog('Compile'))
        .pipe(babel())
        .pipe(gulp.dest(dest));
});

gulp.task("watch", ['build-watch', 'doc-watch'], (callback) => {
    watch(scripts, {debounceDelay: 200}, () => gulp.start("build-watch"));
    watch(docs, {debounceDelay: 200}, () => gulp.start("doc-watch"));
    watch(copyFiles, {debounceDelay: 200}, () => gulp.start("copy"));
});