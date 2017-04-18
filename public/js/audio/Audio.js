/*
 * ---------------------------------------------------------------------------------------
 * Audio.js
 * ---------------------------------------------------------------------------------------
 */

import { audioLoader } from "./audio-loader";
import { checkIfiOSdevice } from "../utils/utils";
import { Track } from "./Track";


export class Audio {

    constructor() {
        this.tag = "[Audio.js]";
        let AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        this.audioContextEnabled = false;
        this.bpm = 120.0;
        this.tickTime = 60.0 / this.bpm / 4.0;  // 1/16 note
        this.isPlaying = false;
        this.buffers = {};
        this.tracks = [];
        this.defaultBuffersLoaded = false;
        this.defaultTracksLoaded = false;

        this.currentTickIndex = 1;


        this.soundURLs = {
            kick: "assets/audio/kick.wav",
            snare: "assets/audio/snare.wav",
            hat: "assets/audio/hat.wav",
            ride: "assets/audio/ride.wav"
        };

        this._loadDefaultBuffers();
    }


    /*
     * get bpm
     */
    get bpm() {
        return this._bpm;
    }

    /*
     * set bpm
     */
    set bpm(val) {
        if (val !== this._bpm) {
            this._bpm = val;
            this._onBpmChanged();
        }
    }

    /*
     * get audioContextEnabled
     */
    get audioContextEnabled() {
        return this._audioContextEnabled;
    }

    /*
     * set audioContextEnabled
     */
    set audioContextEnabled(val) {
        if (val !== this._audioContextEnabled) {
            this._audioContextEnabled = val;
        }
    }



    _enableAudioContextForiOS() {

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

            this.defaultBuffersLoaded = true;
            console.log("Default buffers loaded");
            this._initDefaultTracks();

        });
    }


    _initDefaultTracks() {

        if (!this.defaultBuffersLoaded) {
            return;
        }

        this.tracks = [];

        let kickTrack = new Track(this.audioContext, "kick", this.buffers["kick"]);
        kickTrack.setTicksFromArray([1,5,9,13]);
        let snareTrack = new Track(this.audioContext, "snare", this.buffers["snare"]);
        snareTrack.setTicksFromArray([5,13]);
        let hatTrack = new Track(this.audioContext, "hat", this.buffers["hat"]);
        hatTrack.setTicksFromArray([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]);

        this.tracks.push(kickTrack);
        this.tracks.push(snareTrack);
        this.tracks.push(hatTrack);

        this.defaultTracksLoaded = true;
        console.log("Default tracks loaded");
        console.log(this.tracks);

        this._start();
    }


    _onBpmChanged() {
        this.tickTime = 60.0 / this.bpm / 4.0;  // 1/16 note
    }



    _start() {

        if (this.isPlaying) {
            return;
        }

        if (!this.defaultTracksLoaded) {
            return;
        }

        this.isPlaying = true;
        let self = this;
        let ctx = this.audioContext;
        let startTime = ctx.currentTime;
        let nextTickTime = startTime + self.tickTime;
        let index = 1;

        function scheduler() {

            if (nextTickTime <= ctx.currentTime + self.tickTime ) {
            // if (nextTickTime <= ctx.currentTime + 0.05 ) {

                self.tracks.forEach(track => {

                    if (track.mute) {
                        return;
                    }

                    if (!track.buffer) {
                        return;
                    }

                    // let trackVolumeNode = ctx.createGain();
                    // trackVolumeNode.gain.value = track.volume;
                    // let pannerNode = ctx.createStereoPanner();
                    // pannerNode.pan.value = track.pan;
                    //
                    // trackVolumeNode.connect(pannerNode);
                    // pannerNode.connect(ctx.destination);


                    let trackTick = track.ticks[index];

                    if (!trackTick.active) {
                        return;
                    }

                    let tickSound = ctx.createBufferSource();
                    tickSound.buffer = track.buffer;
                    let tickGainNode = ctx.createGain();
                    tickSound.connect(tickGainNode);
                    tickGainNode.gain.value = trackTick.volume;
                    tickGainNode.connect(track.pannerNode);
                    tickSound.start(nextTickTime);





                    // track.ticks.forEach(tick => {
                    //     if (tick.index !== index) {
                    //         return;
                    //     }
                    //
                    //     let tickSound = ctx.createBufferSource();
                    //     tickSound.buffer = track.buffer;
                    //     let tickVolumeNode = ctx.createGain();
                    //     tickVolumeNode.gain.value = tick.volume;
                    //     tickVolumeNode.connect(trackVolumeNode);
                    //     tickSound.connect(tickVolumeNode);
                    //     tickSound.start(nextTickTime);
                    //
                    // });

                });


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
