const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const category = require("../routes/category");
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
    app.use("/api/categories", category);
    app.use(express.static("public"));
    app.use(error);

    logger.info("Routes initialized");
}