const logger = require("./winston");
const morgan = require("morgan");

module.exports = app => {

    logger.stream = {
        write: function(message, encoding){
            logger.info(message.trim());
        }
    };

    app.use(morgan("combined", { "stream": logger.stream }));
}