/*
 * ---------------------------------------------------------------------------------------
 * Tick.js
 * ---------------------------------------------------------------------------------------
 */

 "use strict";


 export class Tick {

     constructor(active = false, volume = 1.0) {
         this.active = active;
         this.volume = volume;
     }

     get volume() {
         return this._volume;
     }

     set volume(val) {
         this._volume = val > 1 ? 1.0 : val;
     }

 }