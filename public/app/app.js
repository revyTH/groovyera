/*
 * ---------------------------------------------------------------------------------------
 * app.js
 * ---------------------------------------------------------------------------------------
 */


"use strict";


import { initRoutes } from "./routes";

import { mainController } from "./components/main/mainController";
import { testController } from "./components/test/testController";

import { trackDirective } from "./directives/track-directive";
import { tickSliderDirective } from "./directives/tickSlider-directive";



(function() {

    let app = angular.module("myApp", ["ngRoute"]);


    // configure angular routes
    app.config(["$routeProvider", initRoutes]);


    // bind controllers
    app.controller("mainController", ['$scope', mainController]);
    app.controller("testController", ['$scope', testController]);


    // register directives
    app.directive("tickSlider", tickSliderDirective);
    app.directive("theTrack", ["supportedAudioFormats", trackDirective]);



    let supportedAudioFormats = new Set();
    supportedAudioFormats.add("audio/wav");
    supportedAudioFormats.add("audio/x-wav");
    supportedAudioFormats.add("audio/mp3");
    supportedAudioFormats.add("audio/x-mp3");
    supportedAudioFormats.add("audio/ogg");
    supportedAudioFormats.add("audio/x-ogg");

    // constants
    app.constant("supportedAudioFormats", supportedAudioFormats);



}());