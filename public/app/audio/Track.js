/*
 * ---------------------------------------------------------------------------------------
 * Track.js
 * ---------------------------------------------------------------------------------------
 */

"use strict";

import { Tick } from "./Tick";
import { guid } from "../utils/utils";
import { getArrayAudioBufferFromUrl } from "../utils/utils";
import { getExtensionFromFileName } from "../utils/utils";
import { getFileNameFromPath } from "../utils/utils";


 export class Track {

     constructor (drumMachine, name = "track_default", soundPath = undefined, volume = 1.0, pan = 0, mute = false ) {
         this.id = guid();
         this.drumMachine = drumMachine;
         this.audioContext = drumMachine.audioContext;
         this.name = name;

         this.sampleData = {
             fileName:              "",
             extension:             "",
             originalBuffer:        undefined,
             decodedAudioBuffer:    undefined,
         };


         this.solo = false;
         this.mute = mute;
         this.ticks = [];
         this.pannerNodeSupported = false;
         this.gainNode = this.audioContext.createGain();
         this.gainNode.gain.value = volume;


         if (drumMachine.pannerNodeSupported) {
             this.pannerNode = this.audioContext.createStereoPanner();
             this.pannerNode.pan.value = pan;
             this.gainNode.connect(this.pannerNode);
             this.pannerNode.connect(this.audioContext.destination);
             this.pannerNodeSupported = true;
         } else {
             this.gainNode.connect(this.audioContext.destination);
         }


         if (soundPath) {
             getArrayAudioBufferFromUrl(this.audioContext, soundPath).then(buffer => {
                let fileName = getFileNameFromPath(soundPath);
                this.setSampleData(fileName, buffer);
             });
         }



         this._initTicks();
     }


     // setGain(val) {
     //     this.gainNode.gain.value = val > 1 ? 1.0 : val;
     // }


     // setPan(val) {
     //     if (val < -1) {
     //         this.pannerNode.pan.value = -1;
     //     }
     //     else if (val > 1) {
     //         this.pannerNode.pan.value = 1;
     //     }
     //     else {
     //         this.pannerNode.pan.value = val;
     //     }
     // }


    _cloneArrayBuffer(buffer) {
        const res = new ArrayBuffer(buffer.byteLength);
        new Uint8Array(res).set(new Uint8Array(buffer));
        return res;
    }

     _initTicks() {
         this.ticks = [];
         for (let i = 0; i < this.drumMachine.numberOfBeats; ++i) {
             this.ticks.push(new Tick(i));
         }
     }

     setTick(index, active = true, volume = 1.0) {
         if (index < 0 || index > (this.drumMachine.numberOfBeats-1)) {
             return;
         }

         this.ticks[index].volume = volume;
         this.ticks[index].active = active;
     }

     setTicksFromArray(data) {
         data.forEach(e => {
             if (typeof e === "object") {
                 if (e.index === "undefined" || e.index < 0 || e.index > (this.drumMachine.numberOfBeats-1)) {
                     return;
                 }

                 this.ticks[e.index].volume = e.volume !== "undefined" ? e.volume : 0;
                 this.ticks[e.index].active = e.active !== "undefined" ? e.active : false;
             }
             else {
                 this.ticks[e].active = true;
             }
         });
     }

     setBuffer(arrayBuffer, fileName) {
         this.originalBuffer = arrayBuffer;
         this.drumMachine.audioContext.decodeAudioData(arrayBuffer, decodedAudioBuffer => {
             this.buffer = decodedAudioBuffer;
             console.log("Track " + this.name + ": audio buffer changed ( " + fileName + " )");
         });
     }

     playLoadedSample() {
         if (!this.audioContext || !this.sampleData.decodedAudioBuffer) return;
         let sound = this.audioContext.createBufferSource();
         sound.buffer = this.sampleData.decodedAudioBuffer;
         sound.connect(this.audioContext.destination);
         sound.start();
     }

     setSampleData(fileName, arrayAudioBuffer) {

         if (!fileName || !arrayAudioBuffer) {
             console.log("Missing fileName and/or arrayAudioBuffer parameters");
             return;
         }

         // Clone original buffer because it will be empty after decoding
         const clonedBuffer = this._cloneArrayBuffer(arrayAudioBuffer);

         this.drumMachine.audioContext.decodeAudioData(arrayAudioBuffer, decodedBuffer => {
             this.sampleData.fileName = fileName;
             this.sampleData.extension = getExtensionFromFileName(fileName);
             this.sampleData.originalBuffer = clonedBuffer;
             this.sampleData.decodedAudioBuffer = decodedBuffer;
         });
     }



 }