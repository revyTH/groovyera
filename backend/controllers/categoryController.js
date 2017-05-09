/**
 * ---------------------------------------------------------------------------------------
 * categoryController.js
 * ---------------------------------------------------------------------------------------
 */

"use strict";


const httpStatusCodes = require("http-status-codes");
const mongoose = require("mongoose");
const Category = require("../models/Category");


module.exports = function(router, socket) {


    if (!router) {
        console.log("Router undefined");
        return;
    }


    router.route("/categories")

        .get(function (req, res) {

            if (!mongoose.connection.readyState) {
                res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                res.send("MongoDB connection missing: cannot process request.");
                return;
            }

            Category.find({}, null, {sort: {name: 1}}, function (err, categories) {
                if (err) {
                    res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                    res.end("An error occurred");
                    return;
                }

                res.json(categories);
            });

        })

};