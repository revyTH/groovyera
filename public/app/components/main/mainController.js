/*
 * ---------------------------------------------------------------------------------------
 * mainController.js
 * ---------------------------------------------------------------------------------------
 */


import { DrumMachine } from "../../audio/DrumMachine";


export function mainController($scope) {

    $scope.title = "Main Controller";
    $scope.tracks = [];
    $scope.ticksElements = [];
    $scope.removeTrack = removeTrack;
    console.log("Main controller");


    let drumMachine = new DrumMachine();


    $scope.startSequencer = () => {
        drumMachine._start();
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


