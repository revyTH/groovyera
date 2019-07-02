const moment = require("moment");
const { Comment, validate } = require("../models/Comment");
const router = require("express").Router();
const Status = require("http-status-codes");

const momentFormat = "MMMM Do YYYY, h:mm:ss a";
// const socketEvents = require("../../config").socketEvents;

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
});

router.delete("/", async (req, res) => {
    await Comment.remove({});
    res.send();
})

module.exports = router;