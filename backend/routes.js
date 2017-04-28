/*
 * ---------------------------------------------------------------------------------------
 * routes.js
 * ---------------------------------------------------------------------------------------
 */



var express = require("express");
var midiController = require("./controllers/midiController");

var apiRouter = express.Router();


(function () {


    // middleware to use for all requests
    apiRouter.use((req, res, next) => {

        // check something useful

        next();
    });


    midiController(apiRouter);


}());





exports.apiRouter = apiRouter;