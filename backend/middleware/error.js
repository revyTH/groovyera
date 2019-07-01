const winston = require("winston");
const Status = require("http-status-codes");

module.exports = function(err, req, res, next) {
    winston.error(err.message, err);
    res.status(Status.INTERNAL_SERVER_ERROR).send("Something wrong happened -_-");
}


