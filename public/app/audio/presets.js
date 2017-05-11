/**
 * ---------------------------------------------------------------------------------------
 * presets.js
 * ---------------------------------------------------------------------------------------
 */


export let groovyRockPreset = {
    name : "Straight rock",
    bpm : 120,
    category: "rock",
    timeSignature : {
        num : 4,
        den : 4
    },
    tracks : [
        {
            name : "kick",
            soundPath : "app/assets/samples/rock/rock-kick.wav",
            volume : 1,
            pan : 0,
            ticks : [
                {
                    active : true,
                    index : 0,
                    volume : 1
                },
                {
                    active : true,
                    index : 8,
                    volume : 1
                },
                {
                    active : true,
                    index : 10,
                    volume : 1
                }
            ]
        },
        {
            name : "snare",
            soundPath : "app/assets/samples/rock/rock-snare.wav",
            volume : 1,
            pan : 0,
            ticks : [
                {
                    active : true,
                    index : 4,
                    volume : 1
                },
                {
                    active : true,
                    index : 12,
                    volume : 1
                }
            ]
        },
        {
            name : "hh open",
            soundPath : "app/assets/samples/rock/rock-hh-open.wav",
            volume : 0.4,
            pan : 0.4,
            ticks : [
                {
                    active : true,
                    index : 4,
                    volume : 0.8
                },
                {
                    active : true,
                    index : 8,
                    volume : 0.8
                },
                {
                    active : true,
                    index : 12,
                    volume : 0.8
                }
            ]
        },
        {
            name : "crash",
            soundPath : "app/assets/samples/rock/rock-crash.wav",
            volume : 0.5,
            pan : -0.5,
            ticks : [
                {
                    active : true,
                    index : 0,
                    volume : 0.8
                }
            ]
        }
    ]
};





export let psyTrancePreset = {
    name : "psy-trance",
    category: "trance",
    bpm : 145,
    timeSignature : {
        num : 4,
        den : 4
    },
    tracks : [
        {
            name : "kick",
            soundPath : "app/assets/samples/trance/trance-kick.wav",
            volume : 1,
            pan : 0,
            ticks : [
                {
                    active : true,
                    index : 0,
                    volume : 1
                },
                {
                    active : true,
                    index : 4,
                    volume : 1
                },
                {
                    active : true,
                    index : 8,
                    volume : 1
                },
                {
                    active : true,
                    index : 12,
                    volume : 1
                }
            ]
        },
        {
            name : "clap",
            soundPath : "app/assets/samples/trance/trance-clap.wav",
            volume : 1,
            pan : 0,
            ticks : [
                {
                    active : true,
                    index : 4,
                    volume : 1
                },
                {
                    active : true,
                    index : 12,
                    volume : 1
                }
            ]
        },
        {
            name : "hh open",
            soundPath : "app/assets/samples/trance/trance-hh-open.wav",
            volume : 0.8,
            pan : 0.2,
            ticks : [
                {
                    active : true,
                    index : 2,
                    volume : 0.8
                },
                {
                    active : true,
                    index : 6,
                    volume : 0.8
                },
                {
                    active : true,
                    index : 10,
                    volume : 0.8
                },
                {
                    active : true,
                    index : 14,
                    volume : 0.8
                }
            ]
        },
        {
            name : "bass",
            soundPath : "app/assets/samples/trance/trance-bass-A1.wav",
            volume : 0.8,
            pan : 0,
            ticks : [
                {
                    active : true,
                    index : 1,
                    volume : 0.8
                },
                {
                    active : true,
                    index : 2,
                    volume : 0.8
                },
                {
                    active : true,
                    index : 3,
                    volume : 0.8
                },
                {
                    active : true,
                    index : 5,
                    volume : 0.8
                },
                {
                    active : true,
                    index : 6,
                    volume : 0.8
                },
                {
                    active : true,
                    index : 7,
                    volume : 0.8
                },
                {
                    active : true,
                    index : 9,
                    volume : 0.8
                },
                {
                    active : true,
                    index : 10,
                    volume : 0.8
                },
                {
                    active : true,
                    index : 11,
                    volume : 0.8
                },
                {
                    active : true,
                    index : 13,
                    volume : 0.8
                },
                {
                    active : true,
                    index : 14,
                    volume : 0.8
                },
                {
                    active : true,
                    index : 15,
                    volume : 0.8
                }
            ]
        }
    ]
};
