/**
 * ---------------------------------------------------------------------------------------
 * server.js
 * ---------------------------------------------------------------------------------------
 */

"use strict";

/*
 * ---------------------------------------------------------------------------------------
 * environment
 * ---------------------------------------------------------------------------------------
 */

const port = process.env.PORT || 4500;

/*
 * ---------------------------------------------------------------------------------------
 * global variables
 * ---------------------------------------------------------------------------------------
 */
const
        http = require("http"),
        express = require('express'),
        config = require("../config"),
        path = require('path'),
        bodyParser = require('body-parser'),
        cookiePraser = require('cookie-parser'),
        cors = require('cors'),
        winston = require("winston"),
        morgan = require("morgan"),
        mongoose = require("mongoose"),
        apiRouter = require("./routes");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

/*
 * ---------------------------------------------------------------------------------------
 * app configuration
 * ---------------------------------------------------------------------------------------
 */

// Add headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


app.use(bodyParser.json({limit: "50mb"}));
app.use(cookiePraser());
app.use(cors());
app.use(express.static("public"));

/*
 * ---------------------------------------------------------------------------------------
 * socket.io
 * ---------------------------------------------------------------------------------------
 */

io.on("connection", socket => {

    apiRouter(app, socket);

    app.get("*", function(req, res){
        res.sendFile("index.html", {
            root: "public"
        });
    });
});

/*
 * ---------------------------------------------------------------------------------------
 * routing
 * ---------------------------------------------------------------------------------------
 */

// app.use("/api", apiRouter);
//
// app.get('*', function(req, res){
//     res.sendFile('index.html', {
//         root: "public"
//     });
// });

/*
 * ---------------------------------------------------------------------------------------
 * db
 * ---------------------------------------------------------------------------------------
 */
mongoose.connect(config.database.mLab.connectionString)
    .then(() => {
        console.log("MongoDB connected.", mongoose.connection.readyState);
        // initCategories();
        startServer();
    }, error => {
        console.log(error);
    });

function initCategories() {

    const Category = require("./models/Category");
    let categories = ["rock", "jazz", "trance"];

    categories.forEach(category => {

        let query = {name: category},
            update = { name: category },
            options = { upsert: true, new: true, setDefaultsOnInsert: true };


        Category.findOneAndUpdate(query, update, options, (error, result) => {
            if (error) {
                console.log(error);
            }
            else {
                console.log(result)
            }
        });
    });
}

/*
 * ---------------------------------------------------------------------------------------
 * server
 * ---------------------------------------------------------------------------------------
 */

function startServer() {
    // app.listen(port, function() {
    //     console.log('Server listening on port ' + port + '..');
    // });

    server.listen(port, () => {
        config.server.isRunning = true;
        console.log(`Server listening on port ${port}...`);
    });
}