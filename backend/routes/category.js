/**
 * ---------------------------------------------------------------------------------------------------------------------
 * categoryController.js
 * ---------------------------------------------------------------------------------------------------------------------
 */

const httpStatusCodes = require("http-status-codes");
const Category = require("../models/Category");

module.exports = function(router) {
    router.route("/categories")
        .get(function (req, res) {
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