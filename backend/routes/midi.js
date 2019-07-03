const MidiWriter = require("midi-writer-js");
const Status = require("http-status-codes");
const router = require("express").Router();

router.post("/", async (req, res) => {

    let buffer;

    try {
        buffer = await buildMidiFile(req.body);
    }
    catch (err) {
        logger.error(err);
        return res.status(Status.BAD_REQUEST).send("Invalid data");
    }

    if (!buffer) return res.status(Status.BAD_REQUEST).send("Invalid data");

    const fileName = "loop.mid";

    res.writeHead(200, {
        "Content-Type": "arraybuffer",
        "Content-disposition": "attachment;filename=" + fileName,
        "Content-Length": buffer.length
    });

    res.end(new Buffer(buffer), "binary");
});

function buildMidiFile(data) {
    return new Promise(function(resolve, reject) {
        const tracks = [];
        tracks[0] = new MidiWriter.Track();
        tracks[0].setTimeSignature(data.timeSignature.num, data.timeSignature.den);
        tracks[0].setTempo(data.bpm);

        let trackIndex = 0;
        data.tracks.forEach(function(trackData) {

            const track = new MidiWriter.Track();
            track.addTrackName(trackData.name);
            track.addEvent(new MidiWriter.ProgramChangeEvent({instrument : trackIndex}));

            const notes = [];
            trackData.notes.forEach(function(noteData) {

                const noteEventData = {
                    pitch: noteData.pitch,
                    velocity: noteData.velocity * 100,
                    duration: noteData.duration,
                    channel: 1
                };

                if (noteData.hasOwnProperty("wait")) {
                    noteEventData["wait"] = noteData["wait"];
                }

                notes.push(new MidiWriter.NoteEvent(noteEventData));
            });

            track.addEvent(notes, function(event, index) {
                return {sequential: true};
            });

            tracks.push(track);
            trackIndex += 1;
        });

        const writer = new MidiWriter.Writer(tracks);
        const buffer = writer.buildFile();
        resolve(buffer);
    });
}

module.exports = router;