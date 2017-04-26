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



    $scope.title = "Main Controller";
    $scope.tracks = [];
    $scope.ticksElements = [];
    $scope.removeTrack = removeTrack;
    console.log("Main controller");


    let drumMachine = new DrumMachine();


    $scope.beats = new Array(drumMachine.numberOfBeats).fill(false);
    // drumMachine.addCallBackInLoop(updateBeatIndicators);


    $(window).ready(() => {

        let beatIndicatorsContainer = document.getElementById("beatIndicatorsContainer");
        let beatIndicators = beatIndicatorsContainer.getElementsByClassName("tick-indicator");

        function updateBeatIndicators(previousTickIndex,tickIndex) {
            $(beatIndicators[previousTickIndex]).removeClass("tick-indicator-active");
            $(beatIndicators[tickIndex]).addClass("tick-indicator-active");
        }

        drumMachine.addCallBackInLoop(updateBeatIndicators);

    });








    // $(window).ready(() => {
    //     let container = $("#beatIndicatorsContainer");
    //     drumMachine.beats.forEach(e => {
    //         container.append(createBeatIndicator());
    //     });
    // });
    //
    //
    //
    //
    // function createBeatIndicator() {
    //     return $("<li></li>\n\r").append($("<div></div> ").addClass("tick-indicator"));
    // }




    $scope.startSequencer = () => {
        drumMachine._start();
    };

    $scope.stopSequencer = () => {
        drumMachine._stop();
        let indicators = document.getElementById("beatIndicatorsContainer").getElementsByClassName("tick-indicator");
        $(indicators).removeClass("tick-indicator-active");
    };


    function removeTrack(track) {
        drumMachine.removeTrack(track.id);
    }


    initDefaultTracks($scope, drumMachine);
    initDATgui(drumMachine);

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


