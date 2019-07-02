const mongoose = require("mongoose");
require("mongoose-moment")(mongoose);
const Joi = require("joi");

const commentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 32,
    },
    message: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 1000,
    },
    createdTs: "Moment",
    createdAt: "String"
});

function validateComment(comment) {
    const schema = {
        username: Joi.string().min(3).max(32).required(),
        message: Joi.string().min(3).max(1000).required()
    };

    return Joi.validate(comment, schema);
}

const Comment = mongoose.model("Comment", commentSchema)

module.exports.Comment = Comment;
module.exports.commentSchema = commentSchema;
module.exports.validate = validateComment;
