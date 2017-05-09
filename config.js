/*
 * ---------------------------------------------------------------------------------------
 * config.js
 * ---------------------------------------------------------------------------------------
 */

const path = require("path");

module.exports = {

    mode: {
        debug: "debug",
        production: "prod"
    },

    project: {
        root: "./public/",
        index: "index.html"
    },

    database: {
        mLab: {
            username: "drumdb_admin",
            password: "5LE-4BY-hfQ-wz2",
            connectionString: "mongodb://drumdb_admin:5LE-4BY-hfQ-wz2@ds123381.mlab.com:23381/drumdb"
        },

        MongoDB_Atlas: {
            username: "ludof",
            password: "OX3NiC7H9qTzMF8l",
            connectionString: "mongodb://ludof:OX3NiC7H9qTzMF8l@mycluster-shard-00-00-m9gq6.mongodb.net:27017,mycluster-shard-00-01-m9gq6.mongodb.net:27017,mycluster-shard-00-02-m9gq6.mongodb.net:27017/drumdb?ssl=true&replicaSet=MyCluster-shard-0&authSource=admin"
        }
    },

    html: {
        root: "./public/index.html",
        all: "./public/**/*.html"
    },

    libs: {
        root: "./public/libs",
        all: [
            "./public/libs/hammer/hammer.min.js",
            "./node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js",
            "./public/libs/jquery/jquery-1.9.1.min.js",
            "./public/libs/jquery-ui/jquery-ui.min.js",
            "./public/libs/jquery-ui-touch-punch/jquery.ui.touch-punch.min.js",
            "./public/libs/jquery-mmenu/jquery.mmenu.all.min.js",
            "./node_modules/jquery-toast-plugin/dist/jquery.toast.min.js",
            // "./public/libs/jquery-mmenu/addons/fixedelements/jquery.mmenu.fixedelements.min.js",
            "./public/libs/*.js",
            "./node_modules/angular/angular.js",
            "./node_modules/angular-route/angular-route.js",
            "./node_modules/angular-sanitize/angular-sanitize.min.js",
            "./node_modules/angular-file-saver/dist/angular-file-saver.bundle.js",
            "./node_modules/ui-select/dist/select.js"
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
        all: [
            "./public/app/styles/**/*.scss",
            "./public/app/components/**/*.scss"
        ]
    },

    build: {
        root: "./public/build/",
        libs: "./public/build/libs/",
        js: "./public/build/js/",
        styles: "./public/build/styles/",
        libs_all: "./public/build/libs/**/*.js",
        js_all: "./public/build/js/**/*.js",
        styles_all: "./public/build/styles/**/*.css",
    },

    samples: {
        root: path.join(__dirname, "public/app/assets/samples/"),
        clientPath: "app/assets/samples/"
    },

    socketEvents: {
        newPreset: "NEW_PRESET",
        presetSaved: "PRESET_SAVED",
        presetConflict: "PRESET_CONFLICT",
        commentSaved: "COMMENT_SAVED"
    },

    server: {
        isRunning: false
    }
};
