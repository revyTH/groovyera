/*
 * ---------------------------------------------------------------------------------------
 * midiController.js
 * ---------------------------------------------------------------------------------------
 */

"use strict"


const   httpStatusCodes = require("http-status-codes"),
        fs = require("fs"),
        path = require("path"),
        MidiWriter = require('midi-writer-js');




module.exports = function(router, socket) {

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
                    return;
                }

                buildMidiFile(req.body).then(function(buffer) {

                    res.writeHead(200, {
                        "Content-Type": "arraybuffer",
                        "Content-disposition": "attachment;filename=" + "loop.mid",
                        "Content-Length": buffer.length
                    });

                    res.end(new Buffer(buffer), "binary");
                    return;

                }, function(error) {
                    if (error) {
                        console.log(error);
                        res.statusCode = httpStatusCodes.BAD_REQUEST;
                        res.end(error);
                    }
                    res.statusCode = httpStatusCodes.BAD_REQUEST;
                    res.end();
                    return;
                })

            }

            catch (e) {
                res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                res.end();
                return;
            }

        });
};






function buildMidiFile(data) {

    return new Promise(function(resolve, reject) {

        var tracks = [];
        tracks[0] = new MidiWriter.Track();
        tracks[0].setTimeSignature(data.timeSignature.num, data.timeSignature.den);
        tracks[0].setTempo(data.bpm);

        var trackIndex = 0;
        data.tracks.forEach(function(trackData) {

            var track = new MidiWriter.Track();
            track.addTrackName(trackData.name);
            track.addEvent(new MidiWriter.ProgramChangeEvent({instrument : trackIndex}));


            var notes = [];
            trackData.notes.forEach(function(noteData) {

                var noteEventData = {
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


        var writer = new MidiWriter.Writer(tracks);
        // writer.saveMIDI("loop");
        var buffer = writer.buildFile();

        resolve(buffer);

    });
}





