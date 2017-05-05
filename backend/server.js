

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
// const multer = require('multer');
//
// var storage =   multer.diskStorage({
//     destination: function (req, file, callback) {
//         callback(null, './backend/uploads');
//     },
//     filename: function (req, file, callback) {
//         callback(null, file.originalname);
//     }
// });
//
// var upload = multer({ storage : storage });
//
// app.post('/upload', upload.any(), function (req, res, next) {
//
//     console.log(req.files);
//     res.json("files uploaded!");
//
// });


app.use("/api", apiRouter);

app.get('*', function(req, res){
    res.sendFile('index.html', {
        root: "public"
    });
});






/*
 * ---------------------------------------------------------------------------------------
 * server
 * ---------------------------------------------------------------------------------------
 */

app.listen(port, function() {
    console.log('Server listening on port ' + port + '..');
});


/*
 * ---------------------------------------------------------------------------------------
 * db
 * ---------------------------------------------------------------------------------------
 */

var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://ludof:wMu4J89a%40@mycluster-shard-00-00-m9gq6.mongodb.net:27017,mycluster-shard-00-01-m9gq6.mongodb.net:27017,mycluster-shard-00-02-m9gq6.mongodb.net:27017/admin?ssl=true&replicaSet=MyCluster-shard-0&authSource=admin";
var url = "mongodb://ludof:OX3NiC7H9qTzMF8l@mycluster-shard-00-00-m9gq6.mongodb.net:27017,mycluster-shard-00-01-m9gq6.mongodb.net:27017,mycluster-shard-00-02-m9gq6.mongodb.net:27017/drumdb?ssl=true&replicaSet=MyCluster-shard-0&authSource=admin";

// MongoClient.connect(url, function(err, db) {
//
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("Connected correctly to server");
//     }
//
//     // db.close();
// });





mongoose.connect(config.database.mLab.connectionString)
    .then(() => {
        console.log("MongoDB connected.");




    }, error => {
        console.log(error);
    });








