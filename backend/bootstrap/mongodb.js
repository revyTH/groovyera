const config = require("../../config");
const mongoose = require("mongoose");
const logger = require("./winston");

module.exports = async function() {
    await mongoose.connect(config.database.local.connectionString,
        {
            useNewUrlParser: true,
            useCreateIndex: true
        }
    );
    logger.info("Connected to MongoDB");
}

