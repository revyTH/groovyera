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