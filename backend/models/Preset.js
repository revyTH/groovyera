/**
 * ---------------------------------------------------------------------------------------
 * Preset.js
 * ---------------------------------------------------------------------------------------
 */

"use strict";


const mongoose = require('mongoose');
const Schema = mongoose.Schema;



let presetSchema = new Schema({
    name: {type: String, required: true},
    _category: { type: String, ref: 'Category', required: true },
    bpm: {type: Number, required: true},

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



let Preset = mongoose.model('Preset', presetSchema);
module.exports = Preset;




