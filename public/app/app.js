/*
 * ---------------------------------------------------------------------------------------
 * app.js
 * ---------------------------------------------------------------------------------------
 */


"use strict";


import { initRoutes } from "./routes";

import { mainController } from "./components/main/mainController";
import { testController } from "./components/test/testController";

import { trackDirective } from "./directives/trackDirective";
import { verticalSliderDirective } from "./directives/verticalSlider-dir";



(function() {

    let app = angular.module("myApp", ["ngRoute"]);


    // configure angular routes
    app.config(["$routeProvider", initRoutes]);


    // bind controllers
    app.controller("mainController", ['$scope', mainController]);
    app.controller("testController", ['$scope', testController]);


    // register directives
    app.directive("verticalSlider", verticalSliderDirective);
    app.directive("theTrack", trackDirective);




}());