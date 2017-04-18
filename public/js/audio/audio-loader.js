/*
 * ---------------------------------------------------------------------------------------
 * audio-loader.js
 * ---------------------------------------------------------------------------------------
 */

 "use strict";


export function audioLoader(audioCtx, url) {

    return new Promise((resolve, reject) => {

        if (!audioCtx) {
            reject("Missing audio context parameter.");
            return;
        }

        if (!url) {
            reject("Missing url parameter");
            return;
        }

        let xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "arraybuffer";

        xhr.onload = function() {
            try {
                audioCtx.decodeAudioData(xhr.response, function(decodedBuffer) {
                    resolve(decodedBuffer);
                });
            } catch (e) {
                reject(e);
            }
        };

        xhr.send();
    });
}
