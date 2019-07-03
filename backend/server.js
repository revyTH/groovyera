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
global.io = require("socket.io")(server);

global.io.on("connection", socket => {
    logger.info("socket.io connected");
});

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
    // require("./bootstrap/socket")(server);

    server.listen(port, () => {
        config.server.isRunning = true;
        logger.info(`Server listening on port ${port}...`);
    });
}

bootstrap();

// const fd = require("file-duplicates");
// const fs = require("fs");
//
// async function test() {
//
//     const buffer = fs.readFileSync("./public/app/assets/samples/rock/rock-kick.wav")
//
//     const res = await fd.find(buffer, "./public/app/assets/samples");
//     const res1 = await fd.find(__dirname + "/../public/app/assets/samples/rock/rock-kick.wav", "./public/app/assets/samples");
//     console.log(res)
//     console.log(res1)
//
// }
//
// test()
