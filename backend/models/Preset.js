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




