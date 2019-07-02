/**
 * ---------------------------------------------------------------------------------------------------------------------
 * server.js
 * ---------------------------------------------------------------------------------------------------------------------
 */

const http = require("http");
const express = require("express");
require("express-async-errors"); // Patch to handle errors in express async routes (without try/catch)
const config = require("../config");
const logger = require("./bootstrap/winston");

const port = process.env.PORT || 4500;
const app = express();
const server = http.createServer(app);

async function bootstrap() {

    process.on("uncaughtException", ex => {
        logger.error(ex);
        process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
        logger.error(reason);
        process.exit(1);
    });

    await require("./bootstrap/mongodb")();
    require("./bootstrap/morgan")(app);
    require("./bootstrap/routes")(app);

    server.listen(port, () => {
        config.server.isRunning = true;
        logger.info(`Server listening on port ${port}...`);
    });
}

bootstrap();