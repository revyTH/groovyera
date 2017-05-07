/**
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
        templateUrl: "app/directives/templates/trackDirective.html",
        link: function (scope, elem, attrs) {

            scope.resizeTick = resizeTick;
            scope.handleFiles = handleFiles;
            scope.playSound = playSound;
            scope.onSoloTrack = onSoloTrack;
            scope.onMuteTrack = onMuteTrack;



            /*
             * ---------------------------------------------------------------------------------------
             * styles & widgets
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

            elem.find('div[id="trackVolumeSlider"]').slider({
                min: 0,
                max: 100,
                orientation: "horizontal",
                value: scope.track.gainNode.gain.value * 100,
                slide: (event, ui) => {
                    scope.track.gainNode.gain.value = ui.value * 0.01;
                }
            }).draggable();

            if (scope.track.pannerNodeSupported) {
                elem.find('div[id="trackPanSlider"]').slider({
                    min: -100,
                    max: 100,
                    orientation: "horizontal",
                    value: scope.track.pannerNode.pan.value * 100,
                    slide: (event, ui) => {
                        scope.track.pannerNode.pan.value = ui.value * 0.01;
                    }
                }).draggable();
            } else {
                elem.find('div[id="trackPanSlider"]').remove();
                elem.find(".pan-label").remove();

                // push down volume slider
                elem.find('div[id="trackVolumeSlider"]').css({
                    // marginTop: 0,
                    // position: "relative",
                    // bottom: 0
                });
            }


            elem.find('button[name=soloTrackButton]').button({

            });

            elem.find('button[name=muteTrackButton]').button({

            });







            /*
             * ---------------------------------------------------------------------------------------
             * event listeners
             * ---------------------------------------------------------------------------------------
             */

            // $(window).resize(() => {
            //     scope.ticksElements.forEach((e) => {
            //         resizeTick(e);
            //     });
            // });




            elem.on("dragover", onDragOver);
            elem.on("drop", onDrop);
            elem.on("dragleave", onDragLeave);









            /*
             * ---------------------------------------------------------------------------------------
             * private functions
             * ---------------------------------------------------------------------------------------
             */

            function resizeTick(tickElem) {
                let ticksContainerWidth = elem.find(".ticks-container").width();
                console.log(ticksContainerWidth);
                let margin = 8;
                let tickWidth = Math.floor((ticksContainerWidth - 15 * margin) / 16.0);


                // tickElem.css({
                //     width: 32,
                //     marginRight: "8px !important"
                // });


                // tickElem.parent().css({
                //     width: tickWidth,
                //     marginRight: margin
                // });



                // tickElem.find(".ui-slider-handle").css({
                //
                // });

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
                    let arrayBuffer = ev.target.result;
                    scope.track.setSampleData(file.name, arrayBuffer);
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


            function onSoloTrack() {
                scope.track.drumMachine.soloTrack(scope.track.id);
            }

            function onMuteTrack() {
                scope.track.drumMachine.muteTrack(scope.track.id);
            }



        }
    };

}


