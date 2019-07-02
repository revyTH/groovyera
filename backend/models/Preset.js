const mongoose = require("mongoose");
const Joi = require("joi");
const { categorySchema } = require("./Category");

const presetSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 5,
        maxLength: 80,
        required: true
    },
    category: {
        type: String,
        minLength: 3,
        maxLength: 50,
        required: true,
    },
    volume: {
        type: Number
    },
    bpm: {
        type: Number,
        min:10,
        max: 280,
        required: true
    },
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

function validatePreset(preset) {

    const tickSchema = Joi.object().keys({
        active: Joi.boolean(),
        index: Joi.number().required(),
        volume: Joi.number()
    })

    const trackSchema = Joi.object().keys({
        name: Joi.string().max(50),
        soundPath: Joi.string().required(),
        volume: Joi.number(),
        pan: Joi.number(),
        ticks: Joi.array().items(tickSchema),
    })

    const schema = Joi.object().keys({
        name: Joi.string().min(5).max(80).required(),
        category: Joi.string().min(3).max(50).required(),
        bpm: Joi.number().min(10).max(280).required(),
        timeSignature: Joi.object().keys({
           num: Joi.number(),
           den: Joi.number()
        }),
        tracks: Joi.array().items(trackSchema)
    })

    return Joi.validate(preset, schema);
}

const Preset = mongoose.model("Preset", presetSchema);

module.exports.Preset = Preset;
module.exports.presetSchema = presetSchema;
module.exports.validate = validatePreset;




