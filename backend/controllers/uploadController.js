

"use strict";

const fs = require("fs");
const path = require("path");
const httpStatusCodes = require("http-status-codes");
const multer = require('multer');
const uploadsFolderPath = "./backend/uploads/";





let storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './backend/uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    },

});


let memoryStorage = multer.memoryStorage()


let upload = multer({
    // fileFilter: myFilter,
    storage: memoryStorage
});










module.exports = function(router) {

    if (!router) {
        console.log("Router undefined");
        return;
    }


    router.route("/upload")

        .get(function(req, res) {



        })



        .post(upload.any(), function(req, res, next) {

            console.log(req.body);
            console.log(req.files);
            console.log("");


            for (let file of req.files) {

                checkIfFileAlreadyExistsAsync(file.buffer).then(path => {

                    if (path) {
                        console.log("File found at ", path);
                    }
                    else {
                        console.log("File not found");
                        fs.writeFileSync(uploadsFolderPath + file.originalname, file.buffer);
                    }

                });

            }

            res.json("Files uploaded!");

        });

};









function myFilter (req, file, cb) {


    // The function should call `cb` with a boolean
    // to indicate if the file should be accepted

    // To reject this file pass `false`, like so:
    // cb(null, false)

    // To accept the file pass `true`, like so:
    // cb(null, true)

    // You can always pass an error if something goes wrong:
    // cb(new Error('I don\'t have a clue!'))



    console.log(file);
    console.log(req.files);
    console.log("");
    cb(null, false);

    // fs.readFile(file.path, (err, data) => {
    //
    //     if (err) {
    //         console.log(err);
    //         cb(null, false);
    //         return;
    //     }
    //
    //     fs.readFile("./backend/uploads/trance-kick_copy.wav", (err, buffer) => {
    //
    //         if (buffer.compare(data) === 0) {
    //             console.log("File already present: not save");
    //             cb(null, false);
    //
    //         } else {
    //             console.log("File not present: save");
    //             cb(null, true);
    //
    //         }
    //
    //     });
    //
    // });


}




/**
 * checkIfFileAlreadyExistsAsync
 */
function checkIfFileAlreadyExistsAsync(inputBuffer) {

    return new Promise((rootResolve) => {

        fs.readdir(uploadsFolderPath, (err, files) => {

            if (err) {
                console.log(err);
                rootResolve();
            }

            let paths = [];

            for (let file of files) {
                if (path.extname(file) === ".wav") {
                    paths.push(uploadsFolderPath + file);
                }
            }




            function compareFilePromiseFactory(path) {
                return function() {
                    return new Promise((resolve, reject) => {
                        fs.readFile(path, (err, data) => {

                            // console.log("Compare file: ", path, "\n");

                            if (err) {
                                console.log(err);
                                resolve();
                            }
                            else if(data.compare(inputBuffer) === 0) {
                                resolve(path);
                            }
                            else {
                                resolve();
                            }
                        });
                    });
                }
            }



            let factories = [];
            paths.forEach(path => {
                factories.push(compareFilePromiseFactory(path));
            });




            function findFile(factories, index) {

                if (index === factories.length) {
                    rootResolve();
                    return;
                }

                factories[index]().then(path => {

                    // equal file found, return file path
                    if (path) {
                        rootResolve(path);

                    }
                    // visit next file
                    else {
                        findFile(factories, index + 1);
                    }
                });
            }


            findFile(factories, 0);


        });
    });
}
