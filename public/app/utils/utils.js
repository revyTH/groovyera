/*
 * ---------------------------------------------------------------------------------------
 * utils.js
 * ---------------------------------------------------------------------------------------
 */

 "use strict";


 /*
  * checkIfiOSdevice
  */
 export function checkIfiOSdevice() {
     return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
 }



 /*
  * generate uuid
  */
 export function guid() {
     let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
         var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
         return v.toString(16);
     });
     return uuid;
 }




 export function getExtensionFromFileName(fileName) {
     let re = /(?:\.([^.]+))?$/;
     let ext = re.exec(fileName)[1];
     return ext;
 }



 export function getFileNameFromPath(path) {
     return path.replace(/^.*[\\\/]/, '');
 }



 export function getArrayAudioBufferFromUrl(audioCtx, url) {

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
                resolve(xhr.response);
            };

            xhr.send();
        });

}