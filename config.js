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
        all: "./public/libs/**.*.js"
    },

    js: {
        root: "./public/js",
        all: "./public/js/**/*.js",
        index: "./public/js/index.js",
        build: "./public/build/"
    },

    styles: {
        root: "./public/styles",
        sass: "./public/styles/**/*.scss",
        // sass: "./public/styles/main.scss",
        all: "./public/styles/**/*.scss",

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
