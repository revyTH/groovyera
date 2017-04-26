/*
 * ---------------------------------------------------------------------------------------
 * DrumMachine.js
 * ---------------------------------------------------------------------------------------
 */

import { audioLoader } from "./audio-loader";
import { checkIfiOSdevice } from "../utils/utils";
import { Track } from "./Track";


export class DrumMachine {

    constructor() {
        this.tag = "[DrumMachine.js]";
        this.numberOfBeats = 16;
        let AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        this.bpm = 120.0;
        this.tickTime = 60.0 / this.bpm / 4.0;  // 1/16 note
        this.isPlaying = false;
        this.isStopped = false;
        this.buffers = {};
        this.tracks = {};
        this.beats = [];
        this.defaultBuffersLoaded = false;
        this.defaultTracksLoaded = false;
        this.tracksInSolo = new Set();
        this.tracksInMute = new Set();

        this.currentTickIndex = 1;

        this.callBacksInLoop = [];


        this.soundURLs = {
            kick: "app/assets/audio/kick.wav",
            snare: "app/assets/audio/snare.wav",
            hat: "app/assets/audio/hat.wav",
            ride: "app/assets/audio/ride.wav"
        };

        if (checkIfiOSdevice()) {
            this._enableAudioContextForiOS();
        } else {
            this.audioContextEnabled = true;
        }

        this._initBeats();

        // this._loadDefaultBuffers();
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


    _initBeats() {
        this.beats = [];
        for (let i = 0; i < this.numberOfBeats; ++i) {
            this.beats.push(false);
        }
        this.beats[0] = true;
    }



    _enableAudioContextForiOS() {
        $(document).ready(() => {
            let btn = $("<button/>", {
                visibility: "hidden"
            });

            btn.on("touchstart", () => {
                let buffer = this.audioContext.createBuffer(1, 1, 22050);
                let source = this.audioContext.createBufferSource();
                source.buffer = buffer;
                source.start();
            });

            btn.trigger("touchstart");

            this.audioContextEnabled = true;
            console.log("AudioContext enabled for iOS");
        });
    }


    _loadDefaultBuffers() {

        let ctx = this.audioContext;
        let urls = this.soundURLs;

        return new Promise((resolve, reject) => {
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
                // this._initDefaultTracks();

                resolve("Default buffers loaded");

            }, error => {
                reject(error);
            });
        });
    }


    _initDefaultTracks() {

        if (!this.defaultBuffersLoaded) {
            return;
        }

        this.tracks = {};

        let kickTrack = new Track(this, "kick", this.buffers["kick"]);
        kickTrack.setTicksFromArray([0,4,8,12]);
        let snareTrack = new Track(this, "snare", this.buffers["snare"], 1, 0.1);
        snareTrack.setTicksFromArray([4,12]);
        let hatTrack = new Track(this, "hat", this.buffers["hat"], 0.85, -1);
        // hatTrack.setTicksFromArray([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]);


        hatTrack.setTicksFromArray([
            {
                index: 0,
                volume: 0.9
            },
            {
                index: 1,
                volume: 0.5
            },
            {
                index: 2,
                volume: 1.2
            },
            {
                index: 3,
                volume: 0.4
            },
            {
                index: 4,
                volume: 0.9
            },
            {
                index: 5,
                volume: 0.5
            },
            {
                index: 6,
                volume: 1.2
            },
            {
                index: 7,
                volume: 0.4
            },
            {
                index: 8,
                volume: 0.9
            },
            {
                index: 9,
                volume: 0.5
            },
            {
                index: 10,
                volume: 1.2
            },
            {
                index: 11,
                volume: 0.4
            },
            {
                index: 12,
                volume: 0.9
            },
            {
                index: 13,
                volume: 0.5
            },
            {
                index: 14,
                volume: 1.2
            },
            {
                index: 15,
                volume: 0.4
            }
        ]);

        this.tracks[kickTrack.id] = kickTrack;
        this.tracks[snareTrack.id] = snareTrack;
        this.tracks[hatTrack.id] = hatTrack;

        this.defaultTracksLoaded = true;
        console.log("Default tracks loaded" , this.tracks);

        // this._start();
    }


    _onBpmChanged() {
        this.tickTime = 60.0 / this.bpm / 4.0;  // 1/16 note
    }



    _start() {

        if (!this.audioContextEnabled) {
            console.log("Cannot play: AudioContext is not enabled.");
            return;
        }

        if (this.isPlaying) {
            console.log("Cannot play: it is already playing.");
            return;
        }

        if (!this.defaultTracksLoaded) {
            console.log("Cannot play: default tracks not loaded.");
            return;
        }

        this.isPlaying = true;
        this.isStopped = false;
        let self = this;
        let ctx = this.audioContext;
        let startTime = ctx.currentTime;
        let nextTickTime = startTime + self.tickTime;
        let index = 0;
        let timeOutID;

        function scheduler() {

            if (self.isStopped) {
                clearTimeout(timeOutID);
                self.isPlaying = false;
                return;
            }

            if (nextTickTime <= ctx.currentTime + self.tickTime ) {
            // if (nextTickTime <= ctx.currentTime + 0.05 ) {

                $.each(self.tracks, (id, track) => {
                // self.tracks.forEach(track => {

                    if (track.mute) {
                        return;
                    }

                    if (!track.buffer) {
                        return;
                    }


                    let trackTick = track.ticks[index];

                    if (!trackTick.active) {
                        return;
                    }

                    let tickSound = ctx.createBufferSource();
                    tickSound.buffer = track.buffer;
                    let tickGainNode = ctx.createGain();
                    tickSound.connect(tickGainNode);
                    tickGainNode.gain.value = trackTick.volume;
                    tickGainNode.connect(track.gainNode);
                    tickSound.start(nextTickTime);

                });


                self.currentTickIndex = index;
                // console.log("Tick " + self.currentTickIndex);

                let previousIndex = index === 0 ? (self.numberOfBeats - 1) : index - 1;

                self.callBacksInLoop.forEach(fn => {
                   fn(previousIndex, index);
                });

                nextTickTime += self.tickTime;

                index += 1;
                index = index === self.numberOfBeats ? 0 : index;

            }

            timeOutID = window.setTimeout(scheduler, 0);
        }

        scheduler();
    }


    _stop() {
        this.isStopped = true;
    }





    _playSound(bufferName, time) {
        let ctx = this.audioContext;
        let sound = ctx.createBufferSource();
        sound.buffer = this.buffers[bufferName];
        sound.connect(ctx.destination);
        sound.start(time);
    }



    addNewTrack(name, soundUrl, volume = 1.0, pan = 0) {

        if (this.buffers.hasOwnProperty(name)) {
            console.log("Track name collision");
            return;
        }

        audioLoader(this.audioContext, soundUrl).then(buffer => {
            this.buffers[name] = buffer;
            let newTrack = new Track(this, name, this.buffers[name], volume, pan);
            this.tracks[newTrack.id] = newTrack;
            console.log("Added track ", newTrack);
        }, error => {
            console.log("ERROR", error);
        });
    }


    removeTrack(trackID) {
        delete this.tracks[trackID];
    }



    soloTrack(trackID) {

        if (!this.tracks.hasOwnProperty(trackID)) return;

        let focusTrack = this.tracks[trackID];
        let tracksInSolo = this.tracksInSolo;
        let tracksInMute = this.tracksInMute;

        // case 1: track is not in solo and not in mute
        if (!tracksInSolo.has(focusTrack) && !tracksInMute.has(focusTrack)) {
            tracksInSolo.add(focusTrack);
            focusTrack.solo = true;
            focusTrack.mute = false;

            $.each(this.tracks, (id, track) => {
               if (id === trackID) {
                   return;
               }

               if (!tracksInSolo.has(track)) {
                   tracksInMute.add(track);
                   track.mute = true;
                   track.solo = false;
               }
            });
        }


        // case 2: track is in solo
        else if (tracksInSolo.has(focusTrack)) {
            tracksInSolo.delete(focusTrack);
            focusTrack.solo = false;

            if (tracksInSolo.size > 0) {
                tracksInMute.add(focusTrack);
                focusTrack.mute = true;
            } else {
                tracksInMute.clear();
                tracksInSolo.clear();
                $.each(this.tracks, (id, track) => {
                   track.mute = false;
                   track.solo = false;
                });
            }
        }

        // case 3: track is in mute
        else {

            tracksInSolo.add(focusTrack);
            focusTrack.solo = true;
            focusTrack.mute = false;

            if (tracksInSolo.size === 1) {
                $.each(this.tracks, (id, track) => {
                   if (id !== trackID) {
                       tracksInMute.add(track);
                       track.mute = true;
                   }
                });
            }
        }
    }



    muteTrack(trackID) {

        if (!this.tracks.hasOwnProperty(trackID)) return;

        let focusTrack = this.tracks[trackID];
        let tracksInSolo = this.tracksInSolo;
        let tracksInMute = this.tracksInMute;

        // case 1: track not in solo or mute
        if (!tracksInSolo.has(focusTrack) && !tracksInMute.has(focusTrack)) {
            tracksInMute.add(focusTrack);
            focusTrack.mute = true;
            focusTrack.solo = false;
        }

        // case 2: track is in solo
        else if (tracksInSolo.has(focusTrack)) {
            tracksInSolo.delete(focusTrack);
            tracksInMute.add(focusTrack);
            focusTrack.solo = false;
            focusTrack.mute = true;

            if (tracksInSolo.size === 0) {
                $.each(this.tracks, (id, track) => {
                    if (id !== trackID) {
                        tracksInMute.delete(track);
                        track.mute = false;
                    }
                });
            }
        }

        // case 3: track is in mute
        else if (tracksInMute.has(focusTrack)) {
            if (tracksInSolo.size > 0) {
                tracksInMute.delete(focusTrack);
                tracksInSolo.add(focusTrack);
                focusTrack.mute = false;
                focusTrack.solo = true;
            }
            else {
                tracksInMute.delete(focusTrack);
                focusTrack.mute = false;
            }

        }
    }


    addCallBackInLoop(fn) {
        if (!typeof fn === "function") return;
        this.callBacksInLoop.push( fn );
    }




}
