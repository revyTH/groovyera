const winston = require("winston");
const { createLogger, format, transports } = winston;
const { colorize, printf, timestamp } = format;

const enumerateErrorFormat = format(info => {
    if (info.message instanceof Error) {
        info.message = Object.assign({
            message: info.message.message,
            stack: info.message.stack
        }, info.message);
    }

    if (info instanceof Error) {
        return Object.assign({
            message: info.message,
            stack: info.stack
        }, info);
    }

    return info;
});

const logger = createLogger({
    format: format.combine(
        timestamp(),
        enumerateErrorFormat(),
        printf(info => {
            let log = `${info.timestamp} - ${info.level}: ${info.message}`
            log += info.stack ? info.stack : ""
            return log;
        })
    ),
    transports: [
        new transports.File({
            filename: "winston.log",
            options: { flags: "w" }
        }),
        new transports.Console({
            format: colorize()
        })
    ]
});

module.exports = logger;