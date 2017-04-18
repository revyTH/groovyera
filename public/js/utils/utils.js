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