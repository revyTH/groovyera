/*
 * ---------------------------------------------------------------------------------------
 * routes.js
 * ---------------------------------------------------------------------------------------
 */



var express = require("express");
var midiController = require("./controllers/midiController");
var presetsController = require("./controllers/presetsController");
var commentsController = require("./controllers/commentsController");

var apiRouter = express.Router();


(function () {


    // middleware to use for all requests
    apiRouter.use((req, res, next) => {

        // check something useful

        next();
    });



    // register controllers
    midiController(apiRouter);
    presetsController(apiRouter);
    commentsController(apiRouter);


}());





exports.apiRouter = apiRouter;