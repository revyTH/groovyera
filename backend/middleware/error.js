const logger = require("../bootstrap/winston");
const Status = require("http-status-codes");

module.exports = function(err, req, res, next) {
    logger.error(err.message, err);
    res.status(Status.INTERNAL_SERVER_ERROR).send("Something bad happened -_-");
}