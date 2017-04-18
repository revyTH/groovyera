

/*
 * ---------------------------------------------------------------------------------------
 * global variables
 * ---------------------------------------------------------------------------------------
 */

var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookiePraser = require('cookie-parser'),
    cors = require('cors');

var app = express();
var port = process.env.PORT || 4500;




/*
 * ---------------------------------------------------------------------------------------
 * app configuration
 * ---------------------------------------------------------------------------------------
 */

app.use(bodyParser.json());
app.use(cookiePraser());
app.use(cors());
app.use(express.static("public"));



/*
 * ---------------------------------------------------------------------------------------
 * routing
 * ---------------------------------------------------------------------------------------
 */

app.get('/', function(req, res){
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

