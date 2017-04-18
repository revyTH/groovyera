/*
 * ---------------------------------------------------------------------------------------
 * Track.js
 * ---------------------------------------------------------------------------------------
 */

 "use strict";

 import { Tick } from "./Tick";


 export class Track {

     constructor (audioContext, name = "track_default", buffer = undefined, ticks = [], volume = 1.0, pan = 0, mute = false ) {
         this.name = name;
         this.buffer = buffer;
         this.mute = mute;
         this.ticks = [];
         this.gainNode = audioContext.createGain();
         this.gainNode.gain.value = volume;
         this.pannerNode = audioContext.createStereoPanner();
         this.pannerNode.pan.value = pan;
         this.pannerNode.connect(this.gainNode);
         this.gainNode.connect(audioContext.destination);

         this._initTicks();
     }


     setGain(val) {
         this.gainNode.gain.value = val > 1 ? 1.0 : val;
     }


     setPan(val) {
         if (val < -1) {
             this.pannerNode.pan.value = -1;
         }
         else if (val > 1) {
             this.pannerNode.pan.value = 1;
         }
         else {
             this.pannerNode.pan.value = val;
         }
     }



     /*
      *
      */
     _initTicks() {
         this.ticks = [];
         for (let i = 0; i <= 16; ++i) {
             this.ticks.push(new Tick());
         }
     }


     setTick(index, active = true, volume = 1.0) {
         if (index < 1 || index > 16) {
             return;
         }

         this.ticks[index].volume = volume;
         this.ticks[index].active = active;
     }


     setTicksFromArray(data) {
         data.forEach(e => {

             if (typeof e === "object") {
                 if (!e.index || e.index < 1 || e.index > 16) {
                     return;
                 }

                 let tick = this.ticks[e.index];
                 tick.volume = e.volume ? e.volume : 1.0;
                 tick.active = e.active ? e.active : true;
             }
             else {
                 this.ticks[e].active = true;
             }

         });
     }


 }