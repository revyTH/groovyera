/*
 * ---------------------------------------------------------------------------------------
 * mainController.js
 * ---------------------------------------------------------------------------------------
 */


import { DrumMachine } from "../../audio/DrumMachine";


export function mainController($scope) {

    $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    let drumMachine = new DrumMachine();
    let playBtn = $("#sequencerPlayButton");
    let stopBtn = $("#sequencerStopButton");
    let bpmSlider = $("#sequencerBPMslider");



    $scope.title = "Main Controller";
    $scope.tracks = [];
    $scope.ticksElements = [];
    $scope.bpm = drumMachine.bpm;
    $scope.isPlaying = drumMachine.isPlaying;
    $scope.isStopped = drumMachine.isStopped;
    $scope.removeTrack = removeTrack;
    $scope.integerval = /^\d*$/;
    $scope.beats = new Array(drumMachine.numberOfBeats).fill(false);









    /*
     * ---------------------------------------------------------------------------------------
     * event listeners
     * ---------------------------------------------------------------------------------------
     */

    $(window).ready(() => {

        let beatIndicatorsContainer = document.getElementById("beatIndicators");
        let beatIndicators = beatIndicatorsContainer.getElementsByClassName("beat-indicator");

        function updateBeatIndicators(previousTickIndex, tickIndex) {
            $(beatIndicators[previousTickIndex]).removeClass("beat-indicator-active");
            $(beatIndicators[tickIndex]).addClass("beat-indicator-active");
            console.log(previousTickIndex, tickIndex);
        }

        drumMachine.addCallBackInLoop(updateBeatIndicators);

    });


    window.addEventListener("keyup", (e) => {
        switch (e.keyCode) {

            case 32:
                if ($scope.isStopped) {
                    play(e);
                } else {
                    stop(e);
                }
                break;

            default:
                break;
        }
    });





    /*
     * ---------------------------------------------------------------------------------------
     * public
     * ---------------------------------------------------------------------------------------
     */

    $scope.startSequencer = () => {
        drumMachine._start();
        $scope.isPlaying = true;
        $scope.isStopped = false;
    };

    $scope.stopSequencer = () => {
        drumMachine._stop();
        $scope.isPlaying = false;
        $scope.isStopped = true;
        let indicators = document.getElementById("beatIndicators").getElementsByClassName("beat-indicator");
        $(indicators).removeClass("beat-indicator-active");
    };






    /*
     * ---------------------------------------------------------------------------------------
     * private
     * ---------------------------------------------------------------------------------------
     */

    function removeTrack(track) {
        drumMachine.removeTrack(track.id);
    }

    function initDefaultTracks($scope, drumMachine) {
        drumMachine._loadDefaultBuffers().then(() => {
            drumMachine._initDefaultTracks();
            $scope.tracks = drumMachine.tracks;
            $scope.$apply();
        }, error => {
            console.log(error);
        });
    }

    function initDATgui(drumMachine) {
        let gui = new dat.GUI();
        let bpmController = gui.add(drumMachine, "bpm", 50.0, 220.0);

        bpmController.onChange(value => {
            drumMachine.bpm = Math.floor(drumMachine.bpm);
        });
    }


    function initSequencerControls(scope, drumMachine) {

        playBtn.on("mousedown touchstart", (e) => {

            e.preventDefault();
            e.stopPropagation();

            playBtn.css({
                backgroundColor: "#444"
            });
        });

        playBtn.on("mouseup touchend", (e) => {
            play(e);
        });




        stopBtn.on("mousedown touchstart", (e) => {

            e.preventDefault();
            e.stopPropagation();

            stopBtn.css({
                backgroundColor: "#444"
            });
        });

        stopBtn.on("mouseup touchend", (e) => {
            stop(e);
        });


        bpmSlider.slider({
            min: drumMachine.bpmMin,
            max: drumMachine.bpmMax,
            orientation: "horizontal",
            value: scope.bpm,
            slide: (event, ui) => {
                drumMachine.bpm = ui.value;
                scope.bpm = ui.value;
                scope.$apply();
            }
        }).draggable();


        scope.updateSlider = function() {
            if (drumMachine.isInRangeBPM(scope.bpm)) {
                bpmSlider.slider("value", scope.bpm);
                drumMachine.bpm = scope.bpm;
            }
        }
    }



    function play(e) {
        e.preventDefault();
        e.stopPropagation();

        playBtn.css({
            backgroundColor: "transparent",
            backgroundImage: "url(./app/assets/icons/Play-50-green.png)"
        });

        stopBtn.css({
            backgroundColor: "transparent",
            backgroundImage: "url(./app/assets/icons/Stop-50-white.png)"
        });

        $scope.startSequencer();
    }


    function stop(e) {
        e.preventDefault();
        e.stopPropagation();

        stopBtn.css({
            backgroundColor: "transparent",
            backgroundImage: "url(./app/assets/icons/Stop-50-red.png)"
        });

        playBtn.css({
            backgroundColor: "transparent",
            backgroundImage: "url(./app/assets/icons/Play-50-white.png)"
        });

        $scope.stopSequencer();
    }












    /*
     * ---------------------------------------------------------------------------------------
     * init
     * ---------------------------------------------------------------------------------------
     */

    initDefaultTracks($scope, drumMachine);
    initSequencerControls($scope, drumMachine);
    // initDATgui(drumMachine);

}







