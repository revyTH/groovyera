/**
 * ---------------------------------------------------------------------------------------
 * mainController.js
 * ---------------------------------------------------------------------------------------
 */


import { DrumMachine } from "../../audio/DrumMachine";
import { psyTrancePreset } from "../../audio/presets";


export function drumMachineController($scope, $compile, $http, FileSaver, Blob) {

    let drumMachine = new DrumMachine();
    let loadingContainer = $("#loadingContainer");
    let commentsLoadingOverlay = $("#commentsLoadingOverlay");
    let commentsLoadingSpinner = $("#commentsLoadingSpinner");
    let playBtn = $("#sequencerPlayButton");
    let stopBtn = $("#sequencerStopButton");
    let bpmSlider = $("#sequencerBPMslider");

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

    $scope.title = "Main Controller";
    $scope.tracks = [];
    $scope.ticksElements = [];
    $scope.bpm = drumMachine.bpm;
    $scope.isPlaying = drumMachine.isPlaying;
    $scope.isStopped = drumMachine.isStopped;
    $scope.removeTrack = removeTrack;
    $scope.integerval = /^\d*$/;
    $scope.beats = new Array(drumMachine.numberOfBeats).fill(false);
    $scope.username = "";
    $scope.commentToPost = "";
    $scope.comments = [];
    $scope.invalidUsernameMessage = "Give ya a name! (3-32 characters)";
    $scope.invalidCommentMessage = "Write something cool! (3-1000 characters)";








    /*
     * ---------------------------------------------------------------------------------------
     * UI
     * ---------------------------------------------------------------------------------------
     */

    $( "#accordion" ).accordion({
        animate: 200,
        collapsible: true,
        active: false,
        heightStyle: "content",
        // icons: { "header": "ui-icon-plus", "activeHeader": "ui-icon-minus" },
        beforeActivate: () => {
            if ($scope.comments.length === 0) {
                loadComments();
            }
        }
    });

    $("#postCommentBtn").button({
        icon: "ui-icon-pencil"
    });










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

                if($("textarea#commentArea, input#usernameInput").is(":focus")){
                    e.preventDefault();
                    e.stopPropagation();
                }
                else if ($scope.isStopped) {
                    play(e);
                } else {
                    stop(e);
                }
                break;

            default:
                break;
        }
    });


    // remove scroll down on spacebar
    window.addEventListener('keydown', function(e) {
        if(e.keyCode === 32 && e.target === document.body) {
            e.preventDefault();
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

        let preset = psyTrancePreset;

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




    $scope.postComment = ()=> {

        let data = {
            username: $scope.username,
            message: $scope.commentToPost
        };

        $http({
            url: 'http://localhost:4500/api/comments',
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            data: JSON.stringify(data)

        }).then(function (response) {
            console.log(response);
            $scope.comments.splice(0, 0, response.data);
            $scope.commentToPost = "";
            $scope.safeApply();
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

        enableLoadingSpinner();

        drumMachine._loadDefaultBuffers().then(() => {
            drumMachine._initDefaultTracks();
            $scope.tracks = drumMachine.tracks;
            $scope.$apply();
            disableLoadingSpinner();
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

        enableLoadingSpinner();

        drumMachine.loadPreset(json).then(tracks => {

            tracks.forEach(t => {
                drumMachine.tracks[t.id] = t;
            });

            $scope.bpm = drumMachine.bpm;
            bpmSlider.slider("value", $scope.bpm);
            $scope.$apply();
            disableLoadingSpinner();

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


            let liParent = $('<li><a href="#">Presets</a></li>');
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


    function loadComments() {

        enableCommentsLoadingSpinner();

        $http({
            url: 'http://localhost:4500/api/comments',
            method: "GET",
            headers: {
                "Accept" : "application/json"
            }

        }).then(function (response) {
            console.log(response);
            $scope.comments = response.data;
            $scope.safeApply();
            disableCommentsLoadingSpinner();
        }, function (response) {
            console.log(response);
        });

    }


    function enableLoadingSpinner() {
        setTimeout(() => {
            loadingContainer.addClass("loading-active");
        }, 500);
    }

    function disableLoadingSpinner() {
        setTimeout(() => {
            loadingContainer.removeClass("loading-active");
        }, 500);
    }

    function enableCommentsLoadingSpinner() {
        setTimeout(() => {
            commentsLoadingOverlay.addClass("loading-active");
            commentsLoadingSpinner.addClass("loading-active");
        }, 100);
    }

    function disableCommentsLoadingSpinner() {
        setTimeout(() => {
            commentsLoadingOverlay.removeClass("loading-active");
            commentsLoadingSpinner.removeClass("loading-active");
        }, 100);
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
    });

    // initDATgui(drumMachine);


}







