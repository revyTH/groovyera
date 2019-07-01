/**
 * ---------------------------------------------------------------------------------------------------------------------
 * server.js
 * ---------------------------------------------------------------------------------------------------------------------
 */

const http = require("http");
const express = require('express');
const config = require("../config");
const logger = require("./bootstrap/logging");

const port = process.env.PORT || 4500;
const app = express();
const server = http.createServer(app);

async function bootstrap() {

    process.on("uncaughtException", ex => {
        logger.error(ex);
        process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
        logger.error(new Error(reason));
        process.exit(1);
    });

    await require("./bootstrap/mongodb")();
    require("./bootstrap/routes")(app);

    server.listen(port, () => {
        config.server.isRunning = true;
        logger.info(`Server listening on port ${port}...`);
    });
}

bootstrap();