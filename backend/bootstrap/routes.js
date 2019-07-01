const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const category = require("../routes/category");
const logger = require("./logging");

const router = express.Router();

module.exports = function(app) {
    app.use(function (req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
        res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
        res.setHeader("Access-Control-Allow-Credentials", true);
        next();
    });

    app.use(bodyParser.json({limit: "50mb"}));
    app.use(bodyParser.urlencoded());
    app.use(cookieParser());
    app.use(cors());
    app.use(express.static("public"));

    category(router);

    app.use("/api", router);
    logger.info("Routes initialized");
}