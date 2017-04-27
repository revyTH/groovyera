/*
 * ---------------------------------------------------------------------------------------
 * gulpfile.js
 * ---------------------------------------------------------------------------------------
 */


var gulp = require("gulp"),
    babelify = require("babelify"),
    browserSync = require("browser-sync"),
    concat = require("gulp-concat"),
    notify = require("gulp-notify"),
    rename = require("gulp-rename"),
    util = require("gulp-util"),
    uglify = require("gulp-uglify"),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    sourcemaps = require("gulp-sourcemaps"),
    sass = require("gulp-sass"),
    watchify = require("watchify"),
    path = require("path"),
    config = require("./config");




/*
 * build_libs
 */
function build_libs() {
    return gulp.src(config.libs.all)
        .pipe(concat("libs.bundle.min.js"))
        .pipe(gulp.dest(config.build.libs))
        .pipe(notify("Build libs done"));
}



/*
 * build
 */
function build_js() {

    var mode = process.env.NODE_ENV == config.mode.debug ? true : false;
    console.log(util.colors.red('\nMODE = ' + mode + '\n'));

    return browserify({
        entries: config.js.index,
        cache: {},
        debug: true
    })
        .transform(babelify, {presets: ["es2015", "react"], sourceMaps: mode})
        .bundle()
        .pipe(source("app.bundle.min.js"))
        .pipe(buffer())
        // .pipe(rename('app.bundle.min.js'))
        .pipe(sourcemaps.init({loadMaps: mode}))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(config.build.js))
        .pipe(notify("Build js done"))

        .pipe(browserSync.reload({ stream: true}))
        .pipe(notify("Browser-sync reload done"));
}



/*
 * sass
 */
function build_sass() {

    // var output_style = process.env.NODE_ENV == 'dev' ? 'expanded' : 'compressed';

    return gulp.src(config.styles.sass)
        .pipe(sourcemaps.init())
        .pipe(sass({
            // includePaths: ['node_modules/susy/sass'],       //include susy-framework from node_modules
        }).on('error', sass.logError))
        .pipe(rename('styles.css'))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(config.build.styles))
        .pipe(notify("Build sass done"))
        // .pipe(rename('styles.min.css'))
        // .pipe(minify_css({compatibility: 'ie8'}))
        // .pipe(gulp.dest(config.dist_path + '/styles'))
        // .pipe(notify('Build styles.min.css: done'))


        .pipe(browserSync.stream())
        // .pipe(browserSync.reload({ stream: true}))
        .pipe(notify("Browser-sync stream done"));
}



/*
 * browserSyncInit
 */
function browserSyncInit(cb) {
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
}







/*
 * watch
 */
function watch() {
    gulp.watch(config.js.all).on("change", gulp.series(build_js));
    gulp.watch(config.styles.all).on("change", gulp.series(build_sass));
    gulp.watch(config.html.all).on("change", browserSync.reload);



    // gulp.watch(config.html.all).on("change", function() );


}



/*
 * debugMode
 */
function debugMode(done) {
    process.env.NODE_ENV = config.mode.debug;
    console.log(util.colors.blue('NODE_ENV = ' + process.env.NODE_ENV ));
    done();
}


/*
 * productionMode
 */
function productionMode(done) {
    process.env.NODE_ENV = config.mode.production;
    console.log(util.colors.blue('NODE_ENV = ' + process.env.NODE_ENV ));
    done();
}









/*
 * ---------------------------------------------------------------------------------------
 * tasks
 * ---------------------------------------------------------------------------------------
 */


gulp.task("bundle", gulp.series(build_libs, build_js, build_sass));

gulp.task("default", gulp.series(debugMode, "bundle", gulp.parallel(browserSyncInit, watch)));
gulp.task("prod", gulp.series(productionMode, "bundle", gulp.parallel(browserSyncInit, watch)));




// gulp.task("libs", gulp.series(build_libs));





