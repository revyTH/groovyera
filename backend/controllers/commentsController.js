/**
 * ---------------------------------------------------------------------------------------
 * commentsController.js
 * ---------------------------------------------------------------------------------------
 */



"use strict";


const   httpStatusCodes = require("http-status-codes"),
        moment = require('moment'),
        mongoose = require("mongoose"),
        Comment = require("../models/Comment"),
        momentFormat = "MMMM Do YYYY, h:mm:ss a",
        socketEvents = require("../../config").socketEvents;


module.exports = function(router, socket) {

    if (!router) {
        console.log("Router undefined");
        return;
    }


    router.route("/comments")

        .get(function(req, res) {

            if (!mongoose.connection.readyState) {
                res.statusCode = httpStatusCodes.FAILED_DEPENDENCY;
                res.send("MongoDB connection missing: cannot process request.");
                return;
            }

            Comment.find({}).sort('-createdTs').exec(function(err, comments) {
                if (err) {
                    res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                    res.end();
                    return;
                }

                res.json(comments);
            });

        })



        .post(function(req, res) {

            if (!req.body) {
                res.statusCode = httpStatusCodes.BAD_REQUEST;
                res.end();
            }

            let ts = moment();
            req.body["createdTs"] = ts;
            req.body["createdAt"] = ts.format(momentFormat);


            let comment = new Comment(req.body);
            comment.save(err => {
                if (err) {
                    if (err.name && err.name === "ValidationError") {
                        res.statusCode = httpStatusCodes.BAD_REQUEST;
                        res.json(err.message);
                        return;
                    }
                    else {
                        res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                        res.json("An error has occurred");
                        return;
                    }
                }


                res.statusCode = httpStatusCodes.CREATED;
                res.end();
                socket.broadcast.emit(socketEvents.newComment, comment)

            });

        });

};