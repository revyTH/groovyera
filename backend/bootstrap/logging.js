const winston = require("winston");

winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
);

const logger = winston.createLogger({
    level: "info",
    format: winston.format.simple(),
    transports: [
        // new winston.transports.File({ filename: 'error.log', level: 'error' }),
        // new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console()
    ]
});

module.exports = logger;

// module.exports.init = function() {
//
//     process.on("uncaughtException", ex => {
//         logger.error(ex);
//         process.exit(1);
//     });
//
//     process.on("unhandledRejection", (reason, promise) => {
//         logger.error(reason);
//         process.exit(1);
//     });
//
// }