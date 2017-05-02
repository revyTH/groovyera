/**
 * ---------------------------------------------------------------------------------------
 * Comment.js
 * ---------------------------------------------------------------------------------------
 */

"use strict";

let mongoose = require('mongoose');
require('mongoose-moment')(mongoose);

let Schema = mongoose.Schema;

// create a schema
let commentSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 16,
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



let Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;