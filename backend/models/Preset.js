/**
 * ---------------------------------------------------------------------------------------
 * Preset.js
 * ---------------------------------------------------------------------------------------
 */


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
    name: String,
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: Boolean,
    location: String,
    meta: {
        age: Number,
        website: String
    },
    created_at: Date,
    updated_at: Date
});


var presetSchema = new Schema({
    name: {type: String, required: true, unique: true},
    bpm: Number,

    timeSignature: {
        num: Number,
        den: Number
    },

    tracks: [
        {
            name: String,
            soundPath: {type: String, required: true},
            volume: Number,
            pan: Number,

            ticks: [
                {
                    active: Boolean,
                    index: Number,
                    volume: Number
                }
            ]
        }
    ]
});



var Preset = mongoose.model('Preset', presetSchema);

// make this available to our users in our Node applications
module.exports = Preset;






/*
let preset = {

    name: "preset001",
    bpm: 90,
    timeSignature: {
        num: 4,
        den: 4
    },

    tracks: [
        {
            name: "tom-elek",
            soundPath: "app/assets/audio/tom-elektro.wav",
            volume: 1,
            pan: 0,
            ticks: [
                {
                    active: true,
                    index: 0,
                    volume: 1
                },
                {
                    active: true,
                    index: 4,
                    volume: 1
                },
                {
                    active: true,
                    index: 8,
                    volume: 1
                },
                {
                    active: true,
                    index: 12,
                    volume: 1
                }
            ]
        },
        {
            name: "low-tom",
            soundPath: "app/assets/audio/tom-low.wav",
            volume: 1,
            pan: 0,
            ticks: [
                {
                    active: true,
                    index: 1,
                    volume: 0.8
                },
                {
                    active: true,
                    index: 2,
                    volume: 0.9
                },
                {
                    active: true,
                    index: 3,
                    volume: 0.9
                },{
                    active: true,
                    index: 5,
                    volume: 0.9
                },{
                    active: true,
                    index: 6,
                    volume: 0.9
                },{
                    active: true,
                    index: 7,
                    volume: 0.9
                },{
                    active: true,
                    index: 9,
                    volume: 0.9
                },{
                    active: true,
                    index: 10,
                    volume: 0.9
                },{
                    active: true,
                    index: 11,
                    volume: 0.9
                }
            ]
        },
    ]
};
*/