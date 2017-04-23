/*
 * ---------------------------------------------------------------------------------------
 * mainController.js
 * ---------------------------------------------------------------------------------------
 */


import { Audio } from "../../audio/Audio";


export function mainController($scope) {

    $scope.title = "Main Controller";
    $scope.tracks = [];
    $scope.ticksElements = [];
    $scope.removeTrack = removeTrack;
    console.log("Main controller");


    let audio = new Audio();


    $scope.startSequencer = () => {
        audio._start();
    };




    function removeTrack(track) {
        let tracks = $scope.tracks;
        for (let i = 0; i < tracks.length; ++i) {
            if (tracks[i].id === track.id) {
                // console.log(tracks[i], track);
                // console.log(i);
                $scope.tracks.splice(i, 1);
                break;
            }
        }
    }


    initDefaultTracks($scope, audio);
    initDATgui(audio);

}




function initDefaultTracks($scope, audio) {
    audio._loadDefaultBuffers().then(() => {
        audio._initDefaultTracks();
        $scope.tracks = audio.tracks;
        $scope.$apply();
    }, error => {
        console.log(error);
    });
}



function initDATgui(audio) {
    let gui = new dat.GUI();
    let bpmController = gui.add(audio, "bpm", 50.0, 220.0);

    bpmController.onChange(value => {
        audio.bpm = Math.floor(audio.bpm);
    });
}


