/**
 * ---------------------------------------------------------------------------------------
 * Category.js
 * ---------------------------------------------------------------------------------------
 */

"use strict";


const mongoose = require('mongoose');
let Schema = mongoose.Schema;


let categorySchema = new Schema({
    name: {type: String, required: true, unique: true}
});



let Category = mongoose.model('Category', categorySchema);
module.exports = Category;




