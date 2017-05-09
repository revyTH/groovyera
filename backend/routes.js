/*
 * ---------------------------------------------------------------------------------------
 * routes.js
 * ---------------------------------------------------------------------------------------
 */

"use strict";

let express = require("express");
let midiController = require("./controllers/midiController");
let presetsController = require("./controllers/presetsController");
let categoryController = require("./controllers/categoryController");
let commentsController = require("./controllers/commentsController");

// let apiRouter = express.Router();
//
//
// (function () {
//
//
//     // middleware to use for all requests
//     // apiRouter.use((req, res, next) => {
//     //
//     //     // check something useful
//     //
//     //     next();
//     // });
//
//
//
//     // register controllers
//     midiController(apiRouter);
//     presetsController(apiRouter);
//     categoryController(apiRouter);
//     commentsController(apiRouter);
//
//
// }());
//
//
//
// exports.apiRouter = apiRouter;



module.exports = function(app, socket) {

    let apiRouter = express.Router();

    // middleware to use for all requests
    // apiRouter.use((req, res, next) => {
    //
    //     // check something useful
    //
    //     next();
    // });



    // register controllers
    midiController(apiRouter, socket);
    presetsController(apiRouter, socket);
    categoryController(apiRouter, socket);
    commentsController(apiRouter, socket);


    app.use("/api", apiRouter);

};