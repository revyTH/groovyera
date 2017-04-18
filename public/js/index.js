/*
 * ---------------------------------------------------------------------------------------
 * index.js
 * ---------------------------------------------------------------------------------------
 */

 "use strict";

import { Audio } from "./audio/Audio";
import { audioLoader } from "./audio/audio-loader";




function checkiOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}


function initWebAudioCtxForIOS() {
    let AudioContext = window.AudioContext || window.webkitAudioContext;
    let _ctx = new AudioContext();
    let buffer = _ctx.createBuffer(1, 1, 22050);
    let source = _ctx.createBufferSource();
    source.buffer = buffer;
    source.start();
    // _contextEnabled = true;
    // console.log('AudioContext enabled', _contextEnabled);
}





function init() {

    let isiOSDevice = checkiOS();

    if (isiOSDevice) {
        $("#iOS").css({
            visibility: "visible"
        });

        $("#enableAudioBtn").on("click", () => {
            initWebAudioCtxForIOS();

            $("#iOS").css({
                visibility: "hidden"
            });

            testing();

        });
    } else {
        testing();
    }




}






function testing() {

    let audio = new Audio();

    let gui = new dat.GUI();
    let bpmController = gui.add(audio, "bpm", 60.0, 180.0);

    bpmController.onChange(value => {
        audio.bpm = Math.floor(audio.bpm);
    });

    $("#btn").on("click", () => {

        let hatTrack = audio.tracks[0];
        hatTrack.setTick(2);

    });

    $("#muteBtn").on("click", () => {

        let hatTrack = audio.tracks[0];
        hatTrack.mute = !hatTrack.mute;

    });

}



init();





