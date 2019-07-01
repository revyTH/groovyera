/**
 * ---------------------------------------------------------------------------------------
 * gulpfile.babel.js
 * ---------------------------------------------------------------------------------------
 */

const
    gulp = require("gulp"),
    babelify = require("babelify"),
    browserSync = require("browser-sync"),
    concat = require("gulp-concat"),
    notify = require("gulp-notify"),
    rename = require("gulp-rename"),
    util = require("gulp-util"),
    uglify = require("gulp-uglify"),
    browserify = require('browserify'),
    envify = require('envify/custom'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    sourcemaps = require("gulp-sourcemaps"),
    sass = require("gulp-sass"),
    sassGlob = require('gulp-sass-glob'),
    nodemon = require("gulp-nodemon"),
    config = require("./config");

const browserSyncReloadDelay = {
    windows: 1500,
    osx: 100
};

gulp.task("build_libs", () => {
    return gulp.src(config.libs.all)
        .pipe(concat("libs.bundle.min.js"))
        .pipe(gulp.dest(config.build.libs))
    // .pipe(notify("Build libs done"));
});

gulp.task("build_js", () => {
    let mode = process.env.NODE_ENV === config.mode.dev;
    console.log(util.colors.red('\nMODE = ' + process.env.NODE_ENV));
    console.log(util.colors.red('PLATFORM = ' + config.platform + '\n'));

    return browserify({
        entries: config.js.index,
        cache: {},
        dev: true
    })
        .transform(envify({
            global: true,
            _: 'purge',
            NODE_ENV: process.env.NODE_ENV,
            BASE_SERVER_URL: process.env.NODE_ENV === config.mode.dev ? config.baseServerURL.dev : config.baseServerURL.prod
        }))
        .transform("babelify", {presets: ["@babel/preset-env", "@babel/preset-react"], sourceMaps: mode})
        .bundle()
        .pipe(source("app.bundle.min.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: mode}))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(config.build.js))
    // .pipe(notify("Build js done"));

    // .pipe(browserSync.reload(
    //     {
    //         stream: true,
    //         reloadDelay: config.platform === "darwin" ? browserSyncReloadDelay.osx : browserSyncReloadDelay.windows
    //     }
    // ))
    // .pipe(notify("Browser-sync reload done"));
});

gulp.task("build_sass", () => {

    // let output_style = process.env.NODE_ENV == 'dev' ? 'expanded' : 'compressed';

    return gulp.src(config.styles.sass)
        .pipe(sassGlob({
            ignorePaths: [
                "**/drum-machine/**/*.scss"
            ]
        }))
        .pipe(sourcemaps.init())
        .pipe(sass({
            // includePaths: ['node_modules/susy/sass'],       //include susy-framework from node_modules
        }).on('error', sass.logError))
        .pipe(rename('styles.css'))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(config.build.styles))
        // .pipe(notify("Build sass done"))
        // .pipe(rename('styles.min.css'))
        // .pipe(minify_css({compatibility: 'ie8'}))
        // .pipe(gulp.dest(config.dist_path + '/styles'))
        // .pipe(notify('Build styles.min.css: done'))


        .pipe(browserSync.stream())
    // .pipe(browserSync.reload(
    //     {
    //         stream: true,
    //         reloadDelay: config.platform === "darwin" ? browserSyncReloadDelay.osx : browserSyncReloadDelay.windows
    //     }
    // ))
    // .pipe(notify("Browser-sync stream done"));
});

gulp.task("node_server", (cb) => {
    return nodemon({
        script: "server.js"
        , ext: "js html"
        , env: { "NODE_ENV": "development" }
    }).once("start", () => {
        cb();
    })
    // .on("restart", () => {
    //     setTimeout(() => {
    //         browserSync.reload({stream: false});
    //     }, 1000);
    // });
});

gulp.task("browserSync_init", cb => {
    browserSync.init({
        browser: config.platform === "darwin" ? "google chrome" : "chrome.exe",
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
        // proxy: `http://localhost:${config.port}/`,
        reloadDelay: config.platform === "darwin" ? browserSyncReloadDelay.osx : browserSyncReloadDelay.windows,
        injectChanges: true
    }, cb);
});

gulp.task("browserSync_reload", (done) => {
    console.log("R E L O A D I N G ! ! ! ");
    browserSync.reload({stream: false});
    done();
});

gulp.task("watch", () => {
    gulp.watch([config.js.all, config.assets.root]).on("change", () => {
        gulp.series("build_js", "browserSync_reload")()
    });
    gulp.watch(config.styles.all).on("change", () => {
        gulp.series("build_sass")()
    });
    gulp.watch(config.html.all).on("change", () => {
        gulp.series("browserSync_reload")()
    });
});

gulp.task("development_mode", done => {
    process.env.NODE_ENV = config.mode.dev;
    console.log(util.colors.blue('NODE_ENV = ' + process.env.NODE_ENV ));
    done();
});

gulp.task("production_mode", done => {
    process.env.NODE_ENV = config.mode.dev;
    console.log(util.colors.blue('NODE_ENV = ' + process.env.NODE_ENV ));
    done();
});

gulp.task("build_dev", done => {
    gulp.series("development_mode", gulp.parallel("build_libs", "build_js", "build_sass"), "browserSync_init", "watch")();
    done()
});

gulp.task("build_prod", cb => {
    gulp.series("production_mode", gulp.parallel("build_libs", "build_js", "build_sass"), "browserSync_init", "watch")();
});



