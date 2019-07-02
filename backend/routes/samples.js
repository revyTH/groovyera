const fs = require("fs");
const path = require("path");
const glob = require("multi-glob").glob;
const router = require("express").Router();
const Status = require("http-status-codes");

const samplesPath = require("../../config").samples.root;
const samplesClientPath = require("../../config").samples.clientPath;

function addAudioFilesInPathToArray(fPath, arr) {
    return new Promise((resolve, reject) => {
        let pattern1 = fPath + "/**/*.wav";
        let pattern2 = fPath + "/**/*.ogg";
        let pattern3 = fPath + "/**/*.mp3";

        glob([pattern1, pattern2, pattern3], (err, filePaths) => {
            if (err) return resolve();

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

router.get("/", (req, res) => {
    fs.readdir(samplesPath, async (err, paths) => {
        if (err) throw err;

        let data = {};
        let promises = [];

        paths.forEach(fPath => {
            let stats = fs.lstatSync(samplesPath + fPath);
            if (!stats) return;
            if (stats.isDirectory()) {
                if (!data.hasOwnProperty(fPath)) {
                    data[fPath] = [];
                }
                promises.push(addAudioFilesInPathToArray(samplesPath + fPath, data[fPath]));
            }
        });

        await Promise.all(promises);
        res.json(data);
    });
});

module.exports = router;