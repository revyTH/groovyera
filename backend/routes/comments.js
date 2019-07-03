const moment = require("moment");
const { Comment, validate } = require("../models/Comment");
const router = require("express").Router();
const Status = require("http-status-codes");
const socketEvents = require("../../config").socketEvents;
const momentFormat = "MMMM Do YYYY, h:mm:ss a";

let io;

global.io.on("connection", socket => {
    io = socket;
});

router.get("/", async (req, res) => {
    const comments = await Comment.find({}).sort("-createdTs");
    res.json(comments);
});

router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(Status.BAD_REQUEST).send(error.details[0].message);
    const ts = moment();
    req.body["createdTs"] = ts;
    req.body["createdAt"] = ts.format(momentFormat);
    const comment = new Comment(req.body);
    await comment.save();
    res.json(comment);
    io && io.emit(socketEvents.newComment, comment);
    io && io.broadcast.emit(socketEvents.newComment, comment);
});

router.delete("/", async (req, res) => {
    await Comment.remove({});
    res.send();
})

module.exports = router;