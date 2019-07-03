/**
 * ---------------------------------------------------------------------------------------
 * gulpfile.js
 * ---------------------------------------------------------------------------------------
 */

"use strict";

const gulp = require("gulp"),
    babelify = require("babelify"),
    browserSync = require("browser-sync"),
    concat = require("gulp-concat"),
    // notify = require("gulp-notify"),
    rename = require("gulp-rename"),
    util = require("gulp-util"),
    gulpif = require("gulp-if"),
    uglify = require("gulp-uglify"),
    cleanCSS = require("gulp-clean-css"),
    browserify = require('browserify'),
    envify = require('envify/custom'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    sourcemaps = require("gulp-sourcemaps"),
    sass = require("gulp-sass"),
    path = require("path"),
    nodemon = require("gulp-nodemon"),
    config = require("./config");

function build_libs() {
    return gulp.src(config.libs.all)
        .pipe(concat("libs.bundle.min.js"))
        .pipe(gulpif(process.env.NODE_ENV === config.mode.prod, uglify()))
        .pipe(gulp.dest(config.build.libs))
}

function build_js() {
    const mode = process.env.NODE_ENV === config.mode.dev;

    return browserify({
        entries: config.js.index,
        cache: {},
        dev: true
    })
        .transform(envify({
            global: true,
            _: 'purge',
            NODE_ENV: process.env.NODE_ENV,
            BASE_SERVER_URL: process.env.APP_BASE_URL ? process.env.APP_BASE_URL : config.baseServerURL.dev
        }))
        .transform(babelify, {presets: ["@babel/preset-env", "@babel/preset-react"], sourceMaps: mode})
        .bundle()
        .pipe(source("app.bundle.min.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: mode}))
        .pipe(gulpif(process.env.NODE_ENV === config.mode.prod, uglify()))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(config.build.js))
        .pipe(browserSync.reload({ stream: true}))
}

function build_sass() {
    return gulp.src(config.styles.sass)
        .pipe(sourcemaps.init())
        .pipe(sass({}).on('error', sass.logError))
        .pipe(rename('styles.css'))
        // .pipe(gulpif(process.env.NODE_ENV === config.mode.prod, cleanCSS({compatibility: 'ie8'})))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(config.build.styles))
        .pipe(browserSync.stream())
}

function browserSyncInit(cb) {

    setTimeout(() => {
        browserSync.init({
            notify: true,
            port: 3000,
            server: {
                baseDir: config.project.root,
                index: config.project.index,
                middleware: function(req, res, next) {
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    next();
                }
            },
            reloadDelay: 200
        }, cb);
    }, 2000);
}

function watch() {

    return new Promise(function (resolve, reject) {
        try {
            gulp.watch(config.js.all).on("change", gulp.series(build_js));
            gulp.watch(config.styles.all).on("change", gulp.series(build_sass));
            gulp.watch(config.html.all).on("change", browserSync.reload);
            resolve();
        }
        catch (e) {
            reject(e);
        }

    });
}

function debugMode(done) {
    process.env.NODE_ENV = config.mode.dev;
    console.log(util.colors.red(`\nNODE_ENV = ${process.env.NODE_ENV}\n`));
    done();
}

function productionMode(done) {
    process.env.NODE_ENV = config.mode.prod;
    console.log(util.colors.red(`\nNODE_ENV = ${process.env.NODE_ENV}\n`));
    done();
}

gulp.task("node", function (done) {
    nodemon({
        script: "server.js",
        ext: "js html",
        env: { "NODE_ENV": process.env.NODE_ENV }
    });

    done();
});

gulp.task("bundle", gulp.series(build_libs, build_js, build_sass));
gulp.task("bundle-prod", gulp.series(productionMode, "bundle"));
gulp.task("dev", gulp.series(debugMode, "bundle", gulp.parallel("node", browserSyncInit, watch)));
gulp.task("prod", gulp.series(productionMode, "bundle"));