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
        this.pannerNodeSupported = false;
        this.bpm = 120;
        this.bpmMin = 30;
        this.bpmMax = 240;
        this.timeSignature = {
            num: 4,
            den: 4
        };
        this.tickTime = 60.0 / this.bpm / 4.0;  // 1/16 note
        this.isPlaying = false;
        this.isStopped = true;
        this.buffers = {};
        this.tracks = {};
        this.defaultBuffersLoaded = false;
        this.defaultTracksLoaded = false;
        this._tracksInSolo = new Set();
        this._tracksInMute = new Set();

        this.currentTickIndex = 0;

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

        if (typeof this.audioContext.createStereoPanner === "function") {
            this.pannerNodeSupported = true;
            console.log("Stereo panner supported");
        } else {
            console.log("Stereo panner not supported");
        }

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

                this.audioContextEnabled = true;
                console.log("AudioContext enabled for iOS");
            });

            btn.trigger("touchstart");

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
                active: true,
                index: 0,
                volume: 0.5
            },
            {
                active: true,
                index: 1,
                volume: 0.5
            },
            {
                active: true,
                index: 2,
                volume: 1.2
            },
            {
                active: true,
                index: 3,
                volume: 0.4
            },
            {
                active: true,
                index: 4,
                volume: 0.9
            },
            {
                active: true,
                index: 5,
                volume: 0.5
            },
            {
                active: true,
                index: 6,
                volume: 1
            },
            {
                active: true,
                index: 7,
                volume: 0.4
            },
            {
                active: true,
                index: 8,
                volume: 0.9
            },
            {
                active: true,
                index: 9,
                volume: 0.5
            },
            {
                active: true,
                index: 10,
                volume: 1
            },
            {
                active: true,
                index: 11,
                volume: 0.4
            },
            {
                active: true,
                index: 12,
                volume: 0.9
            },
            {
                active: true,
                index: 13,
                volume: 0.5
            },
            {
                active: true,
                index: 14,
                volume: 1
            },
            {
                active: true,
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

        // if (!this.defaultTracksLoaded) {
        //     console.log("Cannot play: default tracks not loaded.");
        //     return;
        // }


        this.isStopped = false;
        let self = this;
        let ctx = this.audioContext;
        let startTime = ctx.currentTime;
        let nextTickTime = startTime + self.tickTime;
        let index = 0;
        let timeOutID;
        let firstLoopEnded = false;


        function scheduler() {

            if (self.isStopped) {
                clearTimeout(timeOutID);
                self.isPlaying = false;
                return;
            }


            if (nextTickTime <= ctx.currentTime + self.tickTime ) {

                self.isPlaying = true;
                self.isStopped = false;

                $.each(self.tracks, (id, track) => {

                    if (track.mute) {
                        return;
                    }

                    if (!track.sampleData.decodedAudioBuffer) {
                        return;
                    }

                    let trackTick = track.ticks[index];

                    if (!trackTick.active) {
                        return;
                    }

                    let tickSound = ctx.createBufferSource();
                    tickSound.buffer = track.sampleData.decodedAudioBuffer;
                    let tickGainNode = ctx.createGain();
                    tickSound.connect(tickGainNode);
                    tickGainNode.gain.value = trackTick.volume;
                    tickGainNode.connect(track.gainNode);
                    tickSound.start(nextTickTime);

                });

                self.currentTickIndex = index;
                let previousIndex = index === 0 ? (self.numberOfBeats - 1) : index - 1;
                let previousPrevious = previousIndex === 0 ? (self.numberOfBeats - 1) : previousIndex - 1;

                // to syncronize web audio api schedule with ui beat indicators
                if (firstLoopEnded) {
                    self.callBacksInLoop.forEach(fn => {
                        fn(previousPrevious, previousIndex);
                    });
                }

                nextTickTime += self.tickTime;
                index = ++index === self.numberOfBeats ? 0 : index;
            }

            firstLoopEnded = true;
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


    removeTrack(trackID) {
        let track = this.tracks[trackID];
        this._tracksInSolo.delete(track);
        this._tracksInMute.delete(track);
        delete this.tracks[trackID];
    }



    soloTrack(trackID) {

        if (!this.tracks.hasOwnProperty(trackID)) return;

        let focusTrack = this.tracks[trackID];
        let tracksInSolo = this._tracksInSolo;
        let tracksInMute = this._tracksInMute;

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
        let tracksInSolo = this._tracksInSolo;
        let tracksInMute = this._tracksInMute;

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


    isInRangeBPM(value) {
        if (value >= this.bpmMin && value <= this.bpmMax) {
            return true;
        } else {
            return false;
        }
    }


    _createEmptyTicksArray() {
        let ticks = [];
        for(let i = 0; i < this.numberOfBeats; i++) {

            ticks.push({
                index: i,
                volume: 0,
                active: false
            });
        }
        return ticks;
    }


    _clearTracks() {
        this._tracksInSolo.clear();
        this._tracksInMute.clear();

        for (let key in this.tracks) {
            if (this.tracks.hasOwnProperty(key)) {
                delete this.tracks[key];
            }
        }
    }


    addEmptyTrack() {
        let name = "track_" + (Object.keys(this.tracks).length + 1);
        let track = new Track(this, name);
        track.setTicksFromArray(this._createEmptyTicksArray());
        this.tracks[track.id] = track;
    }


    createTrack(name, soundPath, volume, pan, ticks) {
        return new Promise((resolve, reject) => {

            let track = new Track(this, name, soundPath);

            if (ticks) {
                track.setTicksFromArray(ticks);
            } else {
                track.setTicksFromArray(this._createEmptyTicksArray());
            }

            if (volume) {
                track.gainNode.gain.value = volume;
            }

            if (pan) {
                if (track.pannerNode) {
                    track.pannerNode.pan.value = pan;
                }
            }

            resolve(track);
        });
    }


    loadPreset(data) {
        try {
            this.bpm = data.bpm;
            this._clearTracks();

            let promises = [];

            data.tracks.forEach((track) => {
                promises.push(this.createTrack(track.name, track.soundPath, track.volume, track.pan, track.ticks));
            });

            return Promise.all(promises);
        }
        catch (e) {
            return new Promise((resolve, reject) => {
                reject(e);
            });
        }
    }






    buildJsonPreset(name, category) {

        let data = {
            name: name,
            category: category,
            bpm: this.bpm,
            timeSignature: this.timeSignature
        };

        let tracks = [];

        for (let id in this.tracks) {
            if (this.tracks.hasOwnProperty(id)) {

                let track = this.tracks[id];

                let trackData = {
                    name: track.name,
                    soundPath: category + "/" + track.sampleData.fileName,
                    volume: track.gainNode.gain.value,
                    pan: this.pannerNodeSupported ? track.pannerNode.pan.value : 0
                };

                let ticksData = [];

                track.ticks.forEach(tick => {
                    ticksData.push({
                        active: tick.active,
                        index: tick.index,
                        volume: tick.volume
                    })
                });

                trackData.ticks = ticksData;

                tracks.push(trackData);
            }
        }

        data.tracks = tracks;
        return JSON.stringify(data);
    }




}
