/*
 * ---------------------------------------------------------------------------------------
 * utils.js
 * ---------------------------------------------------------------------------------------
 */

 "use strict";

 const fs = require("fs");
 const path = require("path");


module.exports = {
     checkIfFileAlreadyExistsAsync: checkIfFileAlreadyExistsAsync
};





/**
 * checkIfFileAlreadyExistsAsync
 */
function checkIfFileAlreadyExistsAsync(inputBuffer, paths) {

    return new Promise((rootResolve) => {

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

}





