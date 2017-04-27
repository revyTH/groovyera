/*
 * ---------------------------------------------------------------------------------------
 * config.js
 * ---------------------------------------------------------------------------------------
 */

module.exports = {

    mode: {
        debug: "debug",
        production: "prod"
    },

    project: {
        root: "./public/",
        index: "index.html"
    },

    html: {
        root: "./public/index.html",
        all: "./public/**/*.html"
    },

    libs: {
        root: "./public/libs",
        all: [
            "./public/libs/jquery/jquery-1.9.1.min.js",
            "./public/libs/jquery-ui/jquery-ui.min.js",
            "./public/libs/jquery-ui-touch-punch/jquery.ui.touch-punch.min.js",
            "./public/libs/*.js",
            "./node_modules/angular/angular.js",
            "./node_modules/angular-route/angular-route.js"
        ]
    },

    js: {
        root: "./public/app",
        all: "./public/app/**/*.js",
        index: "./public/app/app.js",
        build: "./public/build/"
    },

    styles: {
        root: "./public/app/styles",
        sass: "./public/app/styles/**/*.scss",
        // sass: "./public/app/styles/main.scss",
        all: ["./public/app/styles/**/*.scss", "./public/app/components/**/*.scss"]
    },

    build: {
        root: "./public/build/",
        libs: "./public/build/libs/",
        js: "./public/build/js/",
        styles: "./public/build/styles/",
        libs_all: "./public/build/libs/**/*.js",
        js_all: "./public/build/js/**/*.js",
        styles_all: "./public/build/styles/**/*.css",
    }
};
