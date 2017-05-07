/**
 * ---------------------------------------------------------------------------------------
 * server.js
 * ---------------------------------------------------------------------------------------
 */


"use strict";



/*
 * ---------------------------------------------------------------------------------------
 * global variables
 * ---------------------------------------------------------------------------------------
 */

var express = require('express'),
    config = require("../config"),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookiePraser = require('cookie-parser'),
    cors = require('cors'),
    winston = require("winston"),
    morgan = require("morgan"),
    mongoose = require("mongoose"),
    apiRouter = require("./routes").apiRouter;


var app = express();
var port = process.env.PORT || 4500;




/*
 * ---------------------------------------------------------------------------------------
 * app configuration
 * ---------------------------------------------------------------------------------------
 */

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


app.use(bodyParser.json({limit: "50mb"}));
app.use(cookiePraser());
app.use(cors());
app.use(express.static("public"));



/*
 * ---------------------------------------------------------------------------------------
 * routing
 * ---------------------------------------------------------------------------------------
 */

app.use("/api", apiRouter);

app.get('*', function(req, res){
    res.sendFile('index.html', {
        root: "public"
    });
});











/*
 * ---------------------------------------------------------------------------------------
 * db
 * ---------------------------------------------------------------------------------------
 */


mongoose.connect(config.database.mLab.connectionString)
    .then(() => {
        console.log("MongoDB connected.");


        initCategories();

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
    app.listen(port, function() {
        console.log('Server listening on port ' + port + '..');
    });
}








