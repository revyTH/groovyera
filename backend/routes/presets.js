const { Preset, validate } = require("../models/Preset");
const { Category } = require("../models/Category");
const router = require("express").Router();
const Status = require("http-status-codes");
const glob = require("multi-glob").glob;
const multer = require("multer");
const fd = require("file-duplicates");
const upload = multer({ storage : multer.memoryStorage() });
const samplesPath = require("../../config").samples.root;
const samplesClientPath = require("../../config").samples.clientPath;
const socketEvents = require("../../config").socketEvents;
const logger = require("../bootstrap/winston");

router.get("/", async (req, res) => {
    const categories = await Preset.find({}, null, {sort: {name: 1}});
    res.json(categories);
});

// router.post("/", async (req, res) => {
//     const { error } = validate(req.body);
//     if (error) return res.status(Status.BAD_REQUEST).send(error.details[0].message);
//     let preset = new Preset(req.body);
//     preset = await preset.save();
//     res.send(preset);
// })

router.post("/", upload.any(), async (req, res) => {

    const { error } = validate(req.body);
    if (error) return res.status(Status.BAD_REQUEST).send(error.details[0].message);

    // Check if preset already exists
    const check = await Preset.findOne({
        name: req.body.name,
        "category.name": req.body.category.name
    });
    console.log(check);
    if (check) return res.status(Status.CONFLICT).send("A preset with the same name already exists");

    const globPatterns = [
        samplesPath + "**/*.wav",
        samplesPath + "**/*.ogg",
        samplesPath + "**/*.mp3"
    ]

    glob(globPatterns, async (err, filePaths) => {

        if (err) throw err;

        const presetData = req.body;
        const promises = [];

        presetData.tracks.forEach(track => {
            const soundFile = req.files.find(file => file.originalname === path.basename(track.soundPath));
            promises.push(fd.find(soundFile.buffer, filePaths));
        });

        await Promise.all(promises).then(values => {

            for (let i = 0; i < presetData.tracks.length; i++) {

                // Duplicated sound file found, update sound path
                if (values[i]) {
                    logger.info("Duplicated found at: ", values[i]);
                    let relativePath = path.basename(path.dirname(values[i])) + "/" + path.basename(values[i]);
                    presetData.tracks[i].soundPath = samplesClientPath + relativePath;
                }
                // New sound file: write sound file to disk and update path
                else {
                    logger.info("Not found: ", req.files[i].originalname);
                    let absolutePath = samplesPath + presetData.tracks[i].soundPath;
                    let buffer = req.files[i].buffer;

                    let destFolderPath = path.dirname(absolutePath);
                    let relativePath = presetData.tracks[i].soundPath;

                    // create destination folder if does not exist
                    if (!fs.existsSync(destFolderPath)) {
                        fs.mkdirSync(destFolderPath);
                    }
                    // else check if there is a different file with the same name
                    else {
                        let sampleName = path.basename(absolutePath);
                        let fileNames = fs.readdirSync(destFolderPath);
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

            // Category.findOne({name: presetData.category}, (err, category) => {
            //
            //     if (err) {
            //         logger.info(err);
            //         res.statusCode = httpStatusCodes.BAD_REQUEST;
            //         res.end("An error occurred.");
            //         return;
            //     }
            //
            //     if (!category) {
            //         res.statusCode = httpStatusCodes.BAD_REQUEST;
            //         res.end("Category " + presetData.category + " does not exist");
            //         return;
            //     }
            //
            //
            //     let preset = new Preset({
            //         name: presetData.name,
            //         _category: category.name,
            //         bpm: presetData.bpm,
            //         timeSignature: presetData.timeSignature,
            //         tracks: presetData.tracks
            //     });
            //
            //
            //     preset.save(err => {
            //         if (err) {
            //
            //             // duplicate name error
            //             // if (err.code === 11000) {
            //             //     res.statusCode = httpStatusCodes.CONFLICT;
            //             //     let errorMessage = "Duplicated name: " + preset.name;
            //             //     res.json({error: errorMessage});
            //             //     socket.broadcast.emit(socketEvents.presetConflict, errorMessage);
            //             //     return;
            //             // }
            //
            //             logger.info(err);
            //             res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
            //             res.end("An error occurred.");
            //             return;
            //         }
            //
            //         res.statusCode = httpStatusCodes.CREATED;
            //         res.end();
            //         socket.emit(socketEvents.newPreset, preset);            // broadcast to the one
            //         socket.broadcast.emit(socketEvents.newPreset, preset);  // broadcast to all except one
            //     });
            //
            //
            //
            //
            // });

        });

        const preset = new Preset(req.body);
        await preset.save();
        return res.json(preset);
    });
});

router.delete("/", async (req, res) => {
    await Preset.remove({});
    res.send();
})

module.exports = router;
