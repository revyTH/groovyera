/**
 * ---------------------------------------------------------------------------------------
 * loadSoundsDirective.js
 * ---------------------------------------------------------------------------------------
 */


import { getArrayBuffer } from "../audio/audio-loader";


"use strict";




export function loadSamples($http, supportedAudioFormats) {

    const serverBaseURL = process.env.BASE_SERVER_URL;

    return {
        restrict: 'AE',
        replace: 'false',
        // scope: {
        //     samplesData: "="
        // },
        templateUrl: "app/directives/templates/loadSamples.html",
        link: function (scope, elem, attrs) {






            /*
             * ---------------------------------------------------------------------------------------
             * styles & widgets
             * ---------------------------------------------------------------------------------------
             */

            function initUI() {
                $(".samples-accordion").accordion({
                    animate: 200,
                    collapsible: true,
                    active: false,
                    heightStyle: "content",
                });


                elem.find('button[name="playSampleButton"]').button({
                    icon: "ui-icon-circle-triangle-e",
                    showLabel: false
                });


                elem.find('button[name="loadSampleButton"]').button({
                    icon: "ui-icon-check",
                    showLabel: false
                });


                elem.find('button[id="samplesCancelBtn"]').button();

                elem.css("display", "block");

                scope.disableLoadingSpinner();
            }












            /*
             * ---------------------------------------------------------------------------------------
             * event listeners
             * ---------------------------------------------------------------------------------------
             */

            function addEvents() {


            }





            /*
             * ---------------------------------------------------------------------------------------
             * functions
             * ---------------------------------------------------------------------------------------
             */


            scope.close = function() {
                $("#angularView").css("display", "block");
                elem.remove();
            };


            scope.playSampleFromServer = function(sample) {
                if (!sample) return;

                if (scope.samplesBuffers.hasOwnProperty(sample.path)) {
                    let buffer = scope.samplesBuffers[sample.path];
                    scope.playSoundFromBuffer(buffer);
                }
                else {
                    scope.audioLoader(scope.audioContext, sample.path).then(buffer => {
                        scope.samplesBuffers[sample.path] = buffer;
                        scope.playSoundFromBuffer(buffer);
                    });
                }
            };



            scope.loadSampleOnTrack = function(sample) {
                if (!sample) return;

                getArrayBuffer(scope.audioContext, sample.path).then(arrayBuffer => {
                    scope.track.setSampleData(sample.name, arrayBuffer);
                    scope.close();
                });

            };










            /*
             * ---------------------------------------------------------------------------------------
             * init
             * ---------------------------------------------------------------------------------------
             */

            function init() {
                // hide content behind
                $("#angularView").css("display", "none");

                let intervalID = setInterval(() => {

                    let result = $(".samples-accordion");

                    if (result.length > 0) {

                        clearInterval(intervalID);

                        initUI();
                        addEvents();
                    }
                }, 200);
            }


            init();

        }
    };

}


