/*
 * ---------------------------------------------------------------------------------------
 * trackDirective
 * ---------------------------------------------------------------------------------------
 */


"use strict";


export function trackDirective(supportedAudioFormats) {


    return {
        restrict: 'AE',
        replace: 'false',
        scope: {
            track: "=",
            ticksElements: "=",
            removeTrack: "="
        },
        templateUrl: "app/directives/templates/trackDirTemplate.html",
        link: function (scope, elem, attrs) {

            scope.resizeTick = resizeTick;
            scope.handleFiles = handleFiles;
            scope.playSound = playSound;



            /*
             * ---------------------------------------------------------------------------------------
             * styles
             * ---------------------------------------------------------------------------------------
             */

            elem.find('button[name="removeTrackButton"]').button({
                icon: "ui-icon-close",
                showLabel: false
            });

            elem.find('button[name="playSoundButton"]').button({
                icon: "ui-icon-circle-triangle-e",
                showLabel: false
            });




            /*
             * ---------------------------------------------------------------------------------------
             * event listeners
             * ---------------------------------------------------------------------------------------
             */

            $(window).resize(() => {
                scope.ticksElements.forEach((e) => {
                    resizeTick(e);
                });
            });


            elem.on("dragover", onDragOver);
            elem.on("drop", onDrop);
            elem.on("dragleave", onDragLeave);









            /*
             * ---------------------------------------------------------------------------------------
             * private functions
             * ---------------------------------------------------------------------------------------
             */

            function resizeTick(elem) {
                let trackWidth = $(".track").width();
                let margin = 4;
                let tickWidth = (trackWidth / 16.0) - margin;


                elem.css({
                    width: tickWidth,
                    marginRight: margin
                });
            }


            function handleFiles(files) {
                if (!files || files.length < 1) return;

                let file = files[0];

                // chech if it is an audio file with a supported extension
                if (!supportedAudioFormats.has(file.type)) {
                    console.log("File format not supported by Web Audio API");
                    return;
                }

                let reader = new FileReader();
                reader.onload = (ev) => {
                    scope.track.audioContext.decodeAudioData(ev.target.result, function (buffer) {
                        scope.track.setBuffer(buffer, file.name);
                    });
                };
                reader.readAsArrayBuffer(file);
            }


            function onDragOver(e) {
                if (!elem.hasClass("track-dragfile")) {
                    elem.addClass("track-dragfile");
                }
                e.stopPropagation();
                e.preventDefault();
            }


            function onDrop(e) {
                e.stopPropagation();
                e.preventDefault();
                handleFiles(e.originalEvent.dataTransfer.files);
                onDragLeave();
            }


            function onDragLeave(e) {
                if (elem.hasClass("track-dragfile")) {
                    elem.removeClass("track-dragfile");
                }
                if (e) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            }

            function playSound() {
                scope.track.playSound();
            }



        }
    };

}


