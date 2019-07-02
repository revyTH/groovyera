const logger = require("./winston");

module.exports = (server) => {
    const io = require("socket.io")(server);

    io.on("connection", socket => {
        logger.info("socket.io connected");
    })
}