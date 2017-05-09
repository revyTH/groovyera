/*
 * ---------------------------------------------------------------------------------------
 * app.js
 * ---------------------------------------------------------------------------------------
 */


"use strict";


import { initRoutes } from "./routes";

import { drumMachineController } from "./components/drum-machine/drumMachineController";
import { testController } from "./components/test/testController";

import { trackDirective } from "./directives/trackDirective";
import { tickSliderDirective } from "./directives/tickSliderDirective";
import { commentDirective } from "./directives/commentDirective";
import { savePresetDirective } from "./directives/savePresetDirective";




(function() {

    let app = angular.module("myApp", ["ngRoute", "ngFileSaver", "ngSanitize", "ui.select"]);


    // configure angular routes
    app.config(["$routeProvider", initRoutes]);


    // bind controllers
    app.controller("drumMachineController", ["$scope", "$compile", "$http", "$interval", "FileSaver", "Blob", "socketEvents", drumMachineController]);
    app.controller("testController", ['$scope', testController]);


    // register directives
    app.directive("tickSlider", tickSliderDirective);
    app.directive("theTrack", ["supportedAudioFormats", trackDirective]);
    app.directive("comment", commentDirective);
    app.directive("savePreset", savePresetDirective);




    let supportedAudioFormats = new Set();
    supportedAudioFormats.add("wav");
    supportedAudioFormats.add("audio/wav");
    supportedAudioFormats.add("audio/x-wav");
    supportedAudioFormats.add("mp3");
    supportedAudioFormats.add("audio/mp3");
    supportedAudioFormats.add("audio/x-mp3");
    supportedAudioFormats.add("ogg");
    supportedAudioFormats.add("audio/ogg");
    supportedAudioFormats.add("audio/x-ogg");

    let socketEvents = {
        presetSaved: "PRESET_SAVED",
        presetConflict: "PRESET_CONFLICT",
        commentSaved: "COMMENT_SAVED"
    };

    // constants
    app.constant("supportedAudioFormats", supportedAudioFormats);
    app.constant("socketEvents", socketEvents);



}());