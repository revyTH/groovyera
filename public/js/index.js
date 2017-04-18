/*
 * ---------------------------------------------------------------------------------------
 * index.js
 * ---------------------------------------------------------------------------------------
 */

 "use strict";

import { Audio } from "./audio/Audio";
import { audioLoader } from "./audio/audio-loader";



let AudioContext = window.AudioContext || window.webkitAudioContext;
let _ctx = new AudioContext();
let _contextEnabled = false;



let _buffers = {
    kick: null,
    snare: null,
    hat: null,
    ride: null
};

let _urls = {
    kick: "assets/audio/kick.wav",
    snare: "assets/audio/snare.wav",
    hat: "assets/audio/hat.wav",
    ride: "assets/audio/ride.wav"
};


function checkiOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}


function initWebAudioCtxForIOS() {
    if (_contextEnabled) return;
    let buffer = _ctx.createBuffer(1, 1, 22050);
    let source = _ctx.createBufferSource();
    source.buffer = buffer;
    source.start();
    _contextEnabled = true;
    console.log('AudioContext enabled', _contextEnabled);
}



// function loadSoundBuffer(url) {
//
//     return new Promise((resolve, reject) => {
//
//         // if (!_ctx || arguments.length < 2) {
//         //     reject("Missing AudioContext and/or target");
//         // }
//
//         let xhr = new XMLHttpRequest();
//         xhr.open("GET", url);
//         xhr.responseType = "arraybuffer";
//
//         xhr.onload = function() {
//             try {
//                 _ctx.decodeAudioData(xhr.response, function(decodedBuffer) {
//                     // buffers[targetBufferName] = decodedBuffer;
//                     resolve(decodedBuffer);
//                 });
//             } catch (e) {
//                 reject(e);
//             }
//         };
//
//         xhr.send();
//
//
//     });
// }




function playSound(url, time, volume) {
    audioLoader(_ctx, url).then(buffer => {
        let source = _ctx.createBufferSource();
        source.buffer = buffer;
        let gainNode = _ctx.createGain();
        gainNode.gain.value = volume;

        source.connect(gainNode);
        gainNode.connect(_ctx.destination);
        source.start(time);

        console.log("Play at: " + volume);

    })
}




function init() {

    let isiOSDevice = checkiOS();
    let quarterNote = 60.0 / 120.0;

    if (isiOSDevice) {
        $("#iOS").css({
            visibility: "visible"
        });

        $("#enableAudioBtn").on("click", () => {
            initWebAudioCtxForIOS();

            $("#iOS").css({
                visibility: "hidden"
            });


            let currentTime = _ctx.currentTime;
            for (let i = 0; i < 16; ++i) {
                playSound(_urls.snare, currentTime + i * quarterNote, i == 0 ? 0.06 : i / 15.0);
            }

        });
    } else {
        $("#iOS").css({
            visibility: "hidden"
        });

        let currentTime = _ctx.currentTime;
        for (let i = 0; i < 8; ++i) {
            playSound(_urls.snare, currentTime + i * quarterNote, i == 0 ? 0.06 : i / 15.0);
        }
    }

}


// init();


let audio = new Audio();


let gui = new dat.GUI();
let bpmController = gui.add(audio, "bpm", 60.0, 180.0);

bpmController.onChange(function(value) {
    // console.log(value);
    audio.bpm = Math.floor(audio.bpm);
    console.log(audio.bpm);
    audio._onBpmChanged();
});





