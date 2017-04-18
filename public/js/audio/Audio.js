/*
 * ---------------------------------------------------------------------------------------
 * Audio.js
 * ---------------------------------------------------------------------------------------
 */

import { audioLoader } from "./audio-loader";


export class Audio {

    constructor() {
        this.tag = "[Audio.js]";
        let AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        this.bpm = 120.0;
        this.tickTime = 60.0 / this.bpm / 4.0;  // 1/16 note
        this.currentTickIndex = 1;
        this.isPlaying = false;
        this.buffers = {};
        this.defaultBuffersLoaded = false;
        this.sounds = {};


        this.soundURLs = {
            kick: "assets/audio/kick.wav",
            snare: "assets/audio/snare.wav",
            hat: "assets/audio/hat.wav",
            ride: "assets/audio/ride.wav"
        };

        this._loadDefaultBuffers();

        // this.watch("bpm", () => {
        //     this.tickTime = 60.0 / this.bpm / 4.0;  // 1/16 note
        //     console.log("BPM changed!", this.bpm, this.tickTime);
        // });
    }

    _loadDefaultBuffers() {

        let ctx = this.audioContext;
        let urls = this.soundURLs;

        Promise.all([
            audioLoader(ctx, urls.kick),
            audioLoader(ctx, urls.snare),
            audioLoader(ctx, urls.hat),
            audioLoader(ctx, urls.ride)
        ]).then(values => {
            this.buffers["kick"] = values[0];
            this.buffers["snare"] = values[1];
            this.buffers["hat"] = values[2];
            this.buffers["ride"] = values[3];
            this.defaultBuffersLoaded = true;
            console.log(this.buffers);

            this._clock();
        });
    }

    _onBpmChanged() {
        this.tickTime = 60.0 / this.bpm / 4.0;  // 1/16 note
    }


    _clock() {
        let self = this;
        let ctx = this.audioContext;
        let startTime = ctx.currentTime;
        let nextTickTime = startTime + self.tickTime;
        let index = 1;

        function scheduler() {

            // let tickTime = 60.0 / this.bpm / 4.0

            if (nextTickTime <= ctx.currentTime + self.tickTime ) {

                self._playSound("hat", nextTickTime);
                if (index % 4 === 1) self._playSound("kick", nextTickTime);
                if (index === 5 || index === 13) self._playSound("snare", nextTickTime);
                // if (index % 3 === 0) self._playSound("ride", nextTickTime);

                self.currentTickIndex = index;
                console.log("Tick " + self.currentTickIndex);
                nextTickTime += self.tickTime;

                index += 1;
                index = index > 16 ? 1 : index;

            }

            window.setTimeout(scheduler, 0);
        }

        scheduler();

    }

    _playSound(bufferName, time) {
        let ctx = this.audioContext;
        let sound = ctx.createBufferSource();
        sound.buffer = this.buffers[bufferName];
        sound.connect(ctx.destination);
        sound.start(time);
    }









}
