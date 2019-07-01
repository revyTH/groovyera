const config = require("../../config");
const mongoose = require("mongoose");
const logger = require("./logging");

module.exports = async function() {
    await mongoose.connect(config.database.mLab.connectionString);
    logger.info("Connected to MongoDB");
}

