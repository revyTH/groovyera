/*
 * ---------------------------------------------------------------------------------------
 * index.js
 * ---------------------------------------------------------------------------------------
 */

 "use strict";

import { Audio } from "./audio/Audio";

function testing() {
    let audio = new Audio();

    $("#startBtn").on("click", () => {
        audio._start();
    });

    $("#btn").on("click", () => {

        let hatTrack = audio.tracks[0];
        hatTrack.setTick(2);

        audio.addNewTrack("tom-elektro", "./assets/audio/tom-elektro.wav", 3);

    });

    $("#muteBtn").on("click", () => {

        let hatTrack = audio.tracks[0];
        hatTrack.mute = !hatTrack.mute;

    });
}

testing();




