const config = require("../../config");
const mongoose = require("mongoose");
const logger = require("./winston");

module.exports = async function() {

    const connString = process.env.MONGODB_CONN ? process.env.MONGODB_CONN : config.mongodb.local.default;

    await mongoose.connect(connString,
        {
            useNewUrlParser: true,
            useCreateIndex: true
        }
    );

    logger.info("Connected to MongoDB");
}

