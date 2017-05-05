

"use strict";


const httpStatusCodes = require("http-status-codes");
const multer = require('multer');

let storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './backend/uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

let upload = multer({ storage : storage });


module.exports = function(router) {

    if (!router) {
        console.log("Router undefined");
        return;
    }


    router.route("/upload")

        .get(function(req, res) {



        })



        .post(upload.any(), function(req, res, next) {

            console.log(req.files);

            res.json("Files uploaded!");

        });

};
