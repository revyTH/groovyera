/*
 * ---------------------------------------------------------------------------------------
 * app.js
 * ---------------------------------------------------------------------------------------
 */


"use strict";

import { Audio } from "./audio/Audio";

import { initRoutes } from "./routes";
import { mainController } from "./components/main/mainController";
import { testController } from "./components/test/testController";



(function() {

    let app = angular.module("myApp", ["ngRoute"]);


    // configure angular routes
    app.config(["$routeProvider", initRoutes]);


    // bind controllers
    app.controller("mainController", ['$scope', mainController]);
    app.controller("testController", ['$scope', testController]);




}());