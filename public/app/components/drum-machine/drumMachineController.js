/*
 * ---------------------------------------------------------------------------------------
 * mainController.js
 * ---------------------------------------------------------------------------------------
 */


import { DrumMachine } from "../../audio/DrumMachine";


export function drumMachineController($scope, $compile, $http, FileSaver, Blob) {

    $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };




    // let transportDirective = $compile("<transport></transport>");
    // let transportDiv = transportDirective($scope);
    // let page = document.getElementById("page");
    // angular.element(page).append(transportDiv);




    let drumMachine = new DrumMachine();
    let playBtn = $("#sequencerPlayButton");
    let stopBtn = $("#sequencerStopButton");
    let bpmSlider = $("#sequencerBPMslider");



    $scope.title = "Main Controller";
    $scope.tracks = [];
    $scope.ticksElements = [];
    $scope.bpm = drumMachine.bpm;
    $scope.isPlaying = drumMachine.isPlaying;
    $scope.isStopped = drumMachine.isStopped;
    $scope.removeTrack = removeTrack;
    $scope.integerval = /^\d*$/;
    $scope.beats = new Array(drumMachine.numberOfBeats).fill(false);









    /*
     * ---------------------------------------------------------------------------------------
     * event listeners
     * ---------------------------------------------------------------------------------------
     */

    $(window).ready(() => {

        let beatIndicatorsContainer = document.getElementById("beatIndicators");
        let beatIndicators = beatIndicatorsContainer.getElementsByClassName("beat-indicator");

        function updateBeatIndicators(previousTickIndex, tickIndex) {
            $(beatIndicators[previousTickIndex]).removeClass("beat-indicator-active");
            $(beatIndicators[tickIndex]).addClass("beat-indicator-active");
        }

        drumMachine.addCallBackInLoop(updateBeatIndicators);

    });


    window.addEventListener("keyup", (e) => {
        switch (e.keyCode) {

            case 32:
                if ($scope.isStopped) {
                    play(e);
                } else {
                    stop(e);
                }
                break;

            default:
                break;
        }
    });








    /*
     * ---------------------------------------------------------------------------------------
     * public
     * ---------------------------------------------------------------------------------------
     */

    $scope.startSequencer = () => {
        drumMachine._start();
        $scope.isPlaying = true;
        $scope.isStopped = false;
    };

    $scope.stopSequencer = () => {
        drumMachine._stop();
        $scope.isPlaying = false;
        $scope.isStopped = true;
        let indicators = document.getElementById("beatIndicators").getElementsByClassName("beat-indicator");
        $(indicators).removeClass("beat-indicator-active");
    };


    $scope.addTrack = () => {
        drumMachine.addEmptyTrack();
    };


    $scope.exportMidi = () => {

        let tracks = [];
        for (let key in drumMachine.tracks) {
            if (drumMachine.tracks.hasOwnProperty(key)) {

                let track = drumMachine.tracks[key];
                let trackData = {
                    name: track.name,
                    notes: []
                };

                let waitCounter = 0;
                track.ticks.forEach((tick) => {

                    if (tick.active) {
                        let noteEventData = {
                            pitch: ["C4"],
                            velocity: tick.volume,
                            duration: "16"  // 1/16
                        };

                        if (waitCounter > 0) {
                            let waitParam = "T" + waitCounter * 32; //number of ticks to wait (each tick is 1/128)
                            noteEventData["wait"] = waitParam;
                        }

                        trackData.notes.push(noteEventData);
                        waitCounter = 0;
                    }

                    else {
                        waitCounter += 1;
                    }
                });

                tracks.push(trackData);
            }
        }


        let data = {
            bpm: drumMachine.bpm,
            timeSignature: {num: 4, den: 4},
            tracks: tracks
        };



        $http({
            url: 'http://localhost:4500/api/midi',
            method: "POST",
            responseType: "arraybuffer",
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify(data)

        }).then(function (response) {
            console.log(response);
            let blob = new Blob([response.data], { type: 'audio/midi' });
            // let fileName = response.headers('content-disposition');
            FileSaver.saveAs(blob, "loop.mid");
        }, function (response) {
            console.log(response);
        });

    };



    $scope.loadPreset = () => {


        $http({
            url: "http://localhost:4500/api/presets",
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        }).then(response => {

            let presets = response.data;
            if (presets.length === 0) {
                return;
            }

            drumMachine.loadPreset(presets[0]).then(tracks => {

                tracks.forEach(t => {
                    drumMachine.tracks[t.id] = t;
                });

                $scope.bpm = drumMachine.bpm;
                bpmSlider.slider("value", $scope.bpm);
                $scope.$apply();


            }, error => {
                console.log(error);
            });



        }, errorResponse => {
            console.log(errorResponse);
        });


    };




    $scope.savePreset = function() {

        let preset = {

            name: "preset002",
            bpm: 115,
            timeSignature: {
                num: 4,
                den: 4
            },

            tracks: [
                {
                    name: "kick-elektro",
                    soundPath: "app/assets/audio/tom-elektro.wav",
                    volume: 1,
                    pan: 0,
                    ticks: [
                        {
                            active: true,
                            index: 0,
                            volume: 1
                        },
                        {
                            active: true,
                            index: 4,
                            volume: 1
                        },
                        {
                            active: true,
                            index: 8,
                            volume: 1
                        },
                        {
                            active: true,
                            index: 12,
                            volume: 1
                        }
                    ]
                },
                {
                    name: "low-tom",
                    soundPath: "app/assets/audio/tom-low.wav",
                    volume: 1,
                    pan: 0,
                    ticks: [
                        {
                            active: true,
                            index: 1,
                            volume: 0.5
                        },
                        {
                            active: true,
                            index: 2,
                            volume: 0.9
                        },
                        {
                            active: true,
                            index: 3,
                            volume: 0.7
                        },{
                            active: true,
                            index: 5,
                            volume: 0.5
                        },{
                            active: true,
                            index: 6,
                            volume: 0.9
                        },{
                            active: true,
                            index: 7,
                            volume: 0.7
                        },{
                            active: true,
                            index: 9,
                            volume: 0.5
                        },{
                            active: true,
                            index: 10,
                            volume: 0.9
                        },{
                            active: true,
                            index: 11,
                            volume: 0.7
                        },{
                            active: true,
                            index: 13,
                            volume: 0.5
                        },{
                            active: true,
                            index: 14,
                            volume: 0.9
                        },{
                            active: true,
                            index: 15,
                            volume: 0.7
                        }
                    ]
                },
            ]
        };



        $http({
            url: 'http://localhost:4500/api/presets',
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify(preset)

        }).then(function (response) {
            console.log(response);
        }, function (response) {
            console.log(response);
        });



    };





    /*
     * ---------------------------------------------------------------------------------------
     * private
     * ---------------------------------------------------------------------------------------
     */

    function removeTrack(track) {
        drumMachine.removeTrack(track.id);
    }

    function initDefaultTracks($scope, drumMachine) {
        drumMachine._loadDefaultBuffers().then(() => {
            drumMachine._initDefaultTracks();
            $scope.tracks = drumMachine.tracks;
            $scope.$apply();
        }, error => {
            console.log(error);
        });
    }

    function initDATgui(drumMachine) {
        let gui = new dat.GUI();
        let bpmController = gui.add(drumMachine, "bpm", 50.0, 220.0);

        bpmController.onChange(value => {
            drumMachine.bpm = Math.floor(drumMachine.bpm);
        });
    }


    function initSequencerControls(scope, drumMachine) {

        playBtn.on("mousedown touchstart", (e) => {

            e.preventDefault();
            e.stopPropagation();

            playBtn.css({
                backgroundColor: "#444"
            });
        });

        playBtn.on("mouseup touchend", (e) => {
            play(e);
        });




        stopBtn.on("mousedown touchstart", (e) => {

            e.preventDefault();
            e.stopPropagation();

            stopBtn.css({
                backgroundColor: "#444"
            });
        });

        stopBtn.on("mouseup touchend", (e) => {
            stop(e);
        });


        bpmSlider.slider({
            min: drumMachine.bpmMin,
            max: drumMachine.bpmMax,
            orientation: "horizontal",
            value: scope.bpm,
            slide: (event, ui) => {
                drumMachine.bpm = ui.value;
                scope.bpm = ui.value;
                scope.$apply();
            }
        }).draggable();



        scope.updateSlider = function() {
            if (drumMachine.isInRangeBPM(scope.bpm)) {
                bpmSlider.slider("value", scope.bpm);
                drumMachine.bpm = scope.bpm;
            }
        }
    }



    function play(e) {
        e.preventDefault();
        e.stopPropagation();

        playBtn.css({
            backgroundColor: "transparent",
            backgroundImage: "url(./app/assets/icons/Play-50-green.png)"
        });

        stopBtn.css({
            backgroundColor: "transparent",
            backgroundImage: "url(./app/assets/icons/Stop-50-white.png)"
        });

        $scope.startSequencer();
    }


    function stop(e) {
        e.preventDefault();
        e.stopPropagation();

        stopBtn.css({
            backgroundColor: "transparent",
            backgroundImage: "url(./app/assets/icons/Stop-50-red.png)"
        });

        playBtn.css({
            backgroundColor: "transparent",
            backgroundImage: "url(./app/assets/icons/Play-50-white.png)"
        });

        $scope.stopSequencer();
    }



    function loadPresetFromJson(json) {
        drumMachine.loadPreset(json).then(tracks => {

            tracks.forEach(t => {
                drumMachine.tracks[t.id] = t;
            });

            $scope.bpm = drumMachine.bpm;
            bpmSlider.slider("value", $scope.bpm);
            $scope.$apply();


        }, error => {
            console.log(error);
        });
    }



    function initExportMidiMenu() {

        let API = $("nav#menu").data( "mmenu" );
        let li = $('<li><a href="#exportMidi" >Export midi</a></li>');
        li.click($scope.exportMidi);

        $("#menu-list").find( ".mm-listview" ).append( li );

        API.initPanels( $("#menu-list") );

    }




    function initPresetsMenu() {

        $http({
            url: "http://192.168.1.75:4500/api/presets",
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        }).then(response => {

            let presets = response.data;
            if (presets.length === 0) {
                return;
            }


            let liParent = $('<li><a href="/presets/">Presets</a></li>');
            let ul = $("<ul></ul>");
            liParent.append(ul);

            presets.forEach(preset => {

                let li = $('<li><a href="#">' + preset.name+ '</a></li>');
                li.click(() => {
                    loadPresetFromJson(preset);
                });

                ul.append(li);
            });

            let API = $("nav#menu").data( "mmenu" );
            $("#menu-list").find( ".mm-listview" ).append( liParent);
            API.initPanels( $("#menu-list") );


            initExportMidiMenu();

        }, errorResponse => {
            console.log(errorResponse);
            initExportMidiMenu();
        });

    }
















    /*
     * ---------------------------------------------------------------------------------------
     * init
     * ---------------------------------------------------------------------------------------
     */

    initDefaultTracks($scope, drumMachine);
    initSequencerControls($scope, drumMachine);

    $(window).ready(() => {
        initPresetsMenu();

    })

    // initDATgui(drumMachine);

}







