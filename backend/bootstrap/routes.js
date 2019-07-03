const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const categories = require("../routes/categories");
const comments = require("../routes/comments");
const presets = require("../routes/presets");
const samples = require("../routes/samples");
const midi = require("../routes/midi");
const error = require("../middleware/error");
const logger = require("./winston");

module.exports = function(app) {

    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
        res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
        res.setHeader("Access-Control-Allow-Credentials", true);
        next();
    });

    app.use(bodyParser.json({limit: "50mb"}));
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cookieParser());
    app.use(cors());
    app.use("/api/categories", categories);
    app.use("/api/comments", comments);
    app.use("/api/presets", presets);
    app.use("/api/samples", samples);
    app.use("/api/midi", midi);
    app.use(express.static("public"));
    app.use(error);

    app.get("*", function(req, res){
        res.sendFile("index.html", {
            root: "./public"
        });
    });

    logger.info("Routes initialized");
}