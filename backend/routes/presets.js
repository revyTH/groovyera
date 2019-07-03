const { promisify } = require("util");
const { Preset, validate } = require("../models/Preset");
const router = require("express").Router();
const Status = require("http-status-codes");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const fd = require("file-duplicates");
const upload = multer({ storage : multer.memoryStorage() });
const samplesPath = require("../../config").samples.root;
const samplesClientPath = require("../../config").samples.clientPath;
const socketEvents = require("../../config").socketEvents;
const logger = require("../bootstrap/winston");
const config = require("../../config");
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);

let io;

global.io.on("connection", socket => {
    io = socket;
});

router.get("/", async (req, res) => {
    const categories = await Preset.find({}, null, {sort: {name: 1}});
    res.json(categories);
});

router.post("/", upload.any(), async (req, res) => {

    if (!req.body.preset) return res.status(Status.BAD_REQUEST).send("Preset data is required");

    let presetData;

    try {
        presetData = JSON.parse(req.body.preset);
    }
    catch (err) {
        return res.status(Status.BAD_REQUEST).send("Preset data is invalid json");
    }

    const { error } = validate(presetData);
    if (error) return res.status(Status.BAD_REQUEST).send(error.details[0].message);

    // Check if preset already exists
    const check = await Preset.findOne({
        name: presetData.name,
        category: presetData.category
    });

    if (check) return res.status(Status.CONFLICT).send("A preset with the same name already exists");

    const promises = [];

    presetData.tracks.forEach(track => {
        const soundFile = req.files.find(file => file.originalname === path.basename(track.soundPath));
        promises.push(fd.find(soundFile.buffer, config.samples.root));
    });

    await Promise.all(promises).then(async values => {

        for (let i = 0; i < presetData.tracks.length; i++) {
            // Duplicated sound file found, update sound path
            if (values[i]) {
                logger.info("Duplicated found at: " + values[i][0]);
                let relativePath = path.basename(path.dirname(values[i][0])) + "/" + path.basename(values[i][0]);
                presetData.tracks[i].soundPath = samplesClientPath + relativePath;
            }
            // New sound file: write sound file to disk and update path
            else {
                logger.info("Not found: ", req.files[i].originalname);
                let absolutePath = samplesPath + presetData.tracks[i].soundPath;
                let buffer = req.files[i].buffer;

                let destFolderPath = path.dirname(absolutePath);
                let relativePath = presetData.tracks[i].soundPath;

                if (!(await exists(destFolderPath))) {
                    await mkdir(destFolderPath);
                }

                // else check if there is a different file with the same name
                else {
                    let sampleName = path.basename(absolutePath);
                    const fileNames = await readdir(destFolderPath);
                    // name collision, modify target file name before write
                    if (fileNames.find(f => {return f === sampleName})) {
                        relativePath = relativePath.substr(0,
                            relativePath.lastIndexOf(".")) + "-" + Date.now() + path.extname(sampleName);
                        absolutePath = samplesPath + relativePath;
                    }
                }

                fs.writeFileSync(absolutePath, buffer);
                presetData.tracks[i].soundPath = samplesClientPath + relativePath;
            }
        }
    });

    const preset = new Preset(presetData);
    await preset.save();
    res.json(preset);
    io && io.emit(socketEvents.newPreset, preset); // broadcast to the one
    io && io.broadcast.emit(socketEvents.newPreset, preset); // broadcast to all except one
});

router.delete("/", async (req, res) => {
    await Preset.remove({});
    res.send();
})

module.exports = router;
