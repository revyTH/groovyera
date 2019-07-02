/*
 * ---------------------------------------------------------------------------------------
 * routes.js
 * ---------------------------------------------------------------------------------------
 */
//
// "use strict";
//
// let express = require("express");
// let midiController = require("./controllers/midiController");
// let presetsController = require("./controllers/presetsController");
// let categoryController = require("./controllers/categoryController");
// let commentsController = require("./controllers/commentsController");
// let samplesController = require("./controllers/samplesController");
//
// module.exports = function(app, socket) {
//     let apiRouter = express.Router();
//
//     // register controllers
//     midiController(apiRouter, socket);
//     presetsController(apiRouter, socket);
//     categoryController(apiRouter, socket);
//     commentsController(apiRouter, socket);
//     samplesController(apiRouter, socket);
//
//     app.use("/api", apiRouter);
// };