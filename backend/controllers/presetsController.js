/**
 * ---------------------------------------------------------------------------------------
 * presetsController.js
 * ---------------------------------------------------------------------------------------
 */

"use strict";


const httpStatusCodes = require("http-status-codes");
const mongoose = require("mongoose");
const Preset = require("../models/Preset");


module.exports = function(router) {

    if (!router) {
        console.log("Router undefined");
        return;
    }


    router.route("/presets")

        .get(function(req, res) {

            if (!mongoose.connection.readyState) {
                res.statusCode = httpStatusCodes.FAILED_DEPENDENCY;
                res.send("MongoDB connection missing: cannot process request.");
                return;
            }

            Preset.find({}, function(err, presets) {
                if (err) {
                    res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                    res.end();
                    return;
                }

                res.json(presets);
            });

        })



        .post(function(req, res) {


            let preset = new Preset(req.body);
            preset.save(err => {
                if (err) {
                    res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                    res.end("An error occurred.");
                    return;
                }

                res.statusCode = httpStatusCodes.CREATED;
                res.end();
            });

        });

};
