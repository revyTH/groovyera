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
const socketEvents = require("../../config").socketEvents;

const httpStatusCodes = require("http-status-codes");
const mongoose = require("mongoose");
const Preset = require("../models/Preset");
const Category = require("../models/Category");


const checkIfFileAlreadyExistsAsync = require("../utils/utils").checkIfFileAlreadyExistsAsync;

const upload = multer({ storage : multer.memoryStorage() });



module.exports = function(router, socket) {

    if (!router) {
        console.log("Router undefined");
        return;
    }



    router.route("/presets")


        .get(function(req, res) {

            if (!mongoose.connection.readyState) {
                res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                res.json("MongoDB connection missing: cannot process request.");
                return;
            }

            Preset.aggregate([

                {
                    $sort: {
                        _category: 1,
                        name: 1
                    }
                },
                {
                    $group: {
                        _id: "$_category",
                        presets: {$push: "$$ROOT"}
                    }
                }

            ], function(err, result) {

                if (err) {
                    res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                    res.end();
                    return;
                }

                res.json(result);
            });

        })






        .post(upload.any(), (req, res, next) => {

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


                Preset.findOne({name: presetData.name, _category: presetData.category}, (err, found) => {

                    if (err) {
                        console.log(err);
                        res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                        res.end("An error occurred.");
                        return;
                    }
                    // conflict: preset with same name and category already stored
                    else if (found) {
                        res.statusCode = httpStatusCodes.CONFLICT;
                        let errorMessage = "Duplicated at category " + presetData.category +" with name: " + presetData.name;
                        res.json({error: errorMessage});
                        return;
                    }


                    presetData.tracks.forEach(track => {
                        let soundFile = req.files.find(file => file.originalname === path.basename(track.soundPath));
                        promises.push(checkIfFileAlreadyExistsAsync(soundFile.buffer, filePaths));
                    });


                    Promise.all(promises).then(values => {

                        for (let i = 0; i < presetData.tracks.length; i++) {

                            // duplicated sound file found, update sound path
                            if (values[i]) {
                                console.log("Duplicated found at: ", values[i]);
                                let relativePath = path.basename(path.dirname(values[i])) + "/" + path.basename(values[i]);
                                presetData.tracks[i].soundPath = samplesClientPath + relativePath;
                            }
                            // write sound file and update path
                            else {
                                console.log("Not found: ", req.files[i].originalname);
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

                                    // duplicate name error
                                    // if (err.code === 11000) {
                                    //     res.statusCode = httpStatusCodes.CONFLICT;
                                    //     let errorMessage = "Duplicated name: " + preset.name;
                                    //     res.json({error: errorMessage});
                                    //     socket.broadcast.emit(socketEvents.presetConflict, errorMessage);
                                    //     return;
                                    // }

                                    console.log(err);
                                    res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                                    res.end("An error occurred.");
                                    return;
                                }

                                res.statusCode = httpStatusCodes.CREATED;
                                res.end();
                                socket.broadcast.emit(socketEvents.newPreset, preset);
                            });




                        });




                    });

                });



            });

    });

};
