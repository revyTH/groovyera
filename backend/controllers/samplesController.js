/**
 * ---------------------------------------------------------------------------------------
 * presetsController.js
 * ---------------------------------------------------------------------------------------
 */

"use strict";

const fs = require("fs");
const path = require("path");
const glob = require("multi-glob").glob;
const httpStatusCodes = require("http-status-codes");

const samplesPath = require("../../config").samples.root;
const samplesClientPath = require("../../config").samples.clientPath;






module.exports = function(router, socket) {

    if (!router) {
        console.log("Router undefined");
        return;
    }



    router.route("/samples")

        .get(function(req, res) {

            fs.readdir(samplesPath, (err, paths) => {

                if (err) {
                    res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                    res.end();
                    return;
                }

                let data = {};
                let promises = [];


                paths.forEach(fPath => {
                    let stats = fs.lstatSync(samplesPath + fPath);

                    if (!stats) {
                        return;
                    }

                    if (stats.isDirectory()) {

                        if (!data.hasOwnProperty(fPath)) {
                            data[fPath] = [];
                        }

                        promises.push(addAudioFilesInPathToArray(samplesPath + fPath, data[fPath]));
                    }
                });


                Promise.all(promises).then(values => {
                   res.json(data);
                }, error => {
                    res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                    res.end();
                });

            });
        });

};




function addAudioFilesInPathToArray(fPath, arr) {

    return new Promise((resolve, reject) => {

        let pattern1 = fPath + "/**/*.wav";
        let pattern2 = fPath + "/**/*.ogg";
        let pattern3 = fPath + "/**/*.mp3";

        glob([pattern1, pattern2, pattern3], (err, filePaths) => {
            if (err) {
                resolve();
                return;
            }

            let sampleDirectory = path.basename(fPath);

            filePaths.forEach(fp => {
                let sampleName = path.basename(fp);
                let soundPath = samplesClientPath + sampleDirectory + "/" + sampleName;
                arr.push({
                    name: sampleName,
                    path: soundPath
                });
            });

            resolve();
        })

    });
}
