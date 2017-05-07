/**
 * ---------------------------------------------------------------------------------------
 * presetsController.js
 * ---------------------------------------------------------------------------------------
 */

"use strict";

const fs = require("fs");
const path = require("path");
const glob = require("multi-glob").glob;
const util = require("util");
const multer = require('multer');
const samplesPath = require("../../config").samples.root;
const samplesClientPath = require("../../config").samples.clientPath;

const httpStatusCodes = require("http-status-codes");
const mongoose = require("mongoose");
const Preset = require("../models/Preset");
const Category = require("../models/Category");


const checkIfFileAlreadyExistsAsync = require("../utils/utils").checkIfFileAlreadyExistsAsync;

const upload = multer({ storage : multer.memoryStorage() });



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






        .post(upload.any(), (req, res, next) => {


            // console.log(req.body);
            // console.log(req.files);
            // console.log("");



            let pattern1 = samplesPath + "**/*.wav";
            let pattern2 = samplesPath + "**/*.ogg";
            let pattern3 = samplesPath + "**/*.mp3";


            glob([pattern1, pattern2, pattern3], (err, filePaths) => {

                if (err) {
                    console.log(err);
                    res.statusCode = httpStatusCodes.BAD_REQUEST;
                    res.end("An error occurred.");
                    return;
                }


                let presetData = JSON.parse(req.body.preset);
                let promises = [];


                presetData.tracks.forEach(track => {
                    let soundFile = req.files.find(file => file.originalname === path.basename(track.soundPath));
                    promises.push(checkIfFileAlreadyExistsAsync(soundFile.buffer, filePaths));
                });


                Promise.all(promises).then(values => {

                    for (let i = 0; i < presetData.tracks.length; i++) {

                        // duplicated sound file found, update sound path
                        if (values[i]) {
                            // console.log("Duplicated found at: ", values[i]);
                            let relativePath = path.basename(path.dirname(values[i])) + "/" + path.basename(values[i]);
                            presetData.tracks[i].soundPath = samplesClientPath + relativePath;
                        }
                        // write sound file and update path
                        else {
                            // console.log("Not found: ", req.files[i].originalname);
                            let absolutePath = samplesPath + presetData.tracks[i].soundPath;
                            let buffer = req.files[i].buffer;

                            fs.writeFileSync(absolutePath, buffer);

                            presetData.tracks[i].soundPath = samplesClientPath + presetData.tracks[i].soundPath;
                        }
                    }



                    Category.findOne({name: presetData.category}, (err, category) => {

                        if (err) {
                            console.log(err);
                            res.statusCode = httpStatusCodes.BAD_REQUEST;
                            res.end("An error occurred.");
                            return;
                        }

                        if (!category) {
                            res.statusCode = httpStatusCodes.BAD_REQUEST;
                            res.end("Category " + presetData.category + " does not exist");
                            return;
                        }


                        let preset = new Preset({
                            name: presetData.name,
                            _category: category.name,
                            bpm: presetData.bpm,
                            timeSignature: presetData.timeSignature,
                            tracks: presetData.tracks
                        });


                        preset.save(err => {
                            if (err) {
                                console.log(err);
                                res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                                res.end("An error occurred.");
                                return;
                            }

                            res.statusCode = httpStatusCodes.CREATED;
                            res.end();
                        });

                    });




                });

            });



            /*
            Category.findOne({name: req.body.category}, (err, category) => {

                if (err) {
                    console.log(err);
                    res.statusCode = httpStatusCodes.BAD_REQUEST;
                    res.end("An error occurred.");
                    return;
                }

                if (!category) {
                    res.statusCode = httpStatusCodes.BAD_REQUEST;
                    res.end("Category " + req.body.category + " does not exist");
                    return;
                }

                let body = req.body;
                let preset = new Preset({
                    name: body.name,
                    _category: category.name,
                    bpm: body.bpm,
                    timeSignature: body.timeSignature,
                    tracks: body.tracks
                });


                preset.save(err => {
                    if (err) {
                        console.log(err);
                        res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                        res.end("An error occurred.");
                        return;
                    }

                    res.statusCode = httpStatusCodes.CREATED;
                    res.end();
                });

            });
            */


    });






};
