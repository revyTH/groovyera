/**
 * ---------------------------------------------------------------------------------------
 * Category.js
 * ---------------------------------------------------------------------------------------
 */

const mongoose = require("mongoose");
const Joi = require("joi");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minLength: 2,
        maxLength: 80
    }
});

function validateCategory(category) {

    const schema = {
        name: Joi.string().min(2).max(80).required()
    };

    return Joi.validate(category, schema);
}

const Category = mongoose.model("Category", categorySchema)

module.exports.Category = Category;
module.exports.categorySchema = categorySchema;
module.exports.validate = validateCategory;

