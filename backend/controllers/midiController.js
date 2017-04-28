/*
 * ---------------------------------------------------------------------------------------
 * midiController.js
 * ---------------------------------------------------------------------------------------
 */


var httpStatusCodes = require("http-status-codes");
fs = require("fs");
var path = require("path");
var MidiWriter = require('midi-writer-js');




module.exports = function(router) {

    if (!router) {
        console.log("Router undefined");
        return;
    }



    router.route("/midi")

        .get(function(req, res) {

            res.json({value: "Ehi ya!"})

        })


        .post(function(req, res) {

            try {

                if (!req.body) {
                    res.statusCode = httpStatusCodes.BAD_REQUEST;
                    res.end();
                }

                buildMidiFile(req.body).then(function(buffer) {

                    res.writeHead(200, {
                        "Content-Type": "arraybuffer",
                        "Content-disposition": "attachment;filename=" + "loop.mid",
                        "Content-Length": buffer.length
                    });

                    res.end(new Buffer(buffer), "binary");

                }, function(error) {
                    if (error) {
                        console.log(error);
                        res.statusCode = httpStatusCodes.BAD_REQUEST;
                        res.end(error);
                    }
                    res.statusCode = httpStatusCodes.BAD_REQUEST;
                    res.end();
                })

            }

            catch (e) {
                res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                res.end();
            }

        });
};






function buildMidiFile(data) {

    return new Promise(function(resolve, reject) {

        var tracks = [];
        tracks[0] = new MidiWriter.Track();
        tracks[0].setTimeSignature(data.timeSignature.num, data.timeSignature.den);
        tracks[0].setTempo(data.bpm);

        data.tracks.forEach(function(trackData) {

            var track = new MidiWriter.Track();
            track.addEvent(new MidiWriter.ProgramChangeEvent({instrument : 1}));
            track.addInstrumentName(trackData.name);

            var notes = [];
            trackData.notes.forEach(function(noteData) {

                var noteEventData = {
                    pitch: noteData.pitch,
                    velocity: noteData.velocity * 100,
                    duration: noteData.duration
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
        });


        var writer = new MidiWriter.Writer(tracks);
        // writer.saveMIDI("loop");
        var buffer = writer.buildFile();

        resolve(buffer);

    });
}





