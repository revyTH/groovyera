/**
 * ---------------------------------------------------------------------------------------
 * mainController.js
 * ---------------------------------------------------------------------------------------
 */


import { DrumMachine } from "../../audio/DrumMachine";
import { psyTrancePreset } from "../../audio/presets";
import { groovyRockPreset } from "../../audio/presets";

// const baseServerUrl = "http://localhost:4500";
// const baseServerUrl = "http://192.168.1.72:4500";
// const baseServerUrl = "http://192.168.1.75:4500";
const baseServerUrl = "https://groove-monkey.herokuapp.com";


export function drumMachineController($scope, $compile, $http, $interval, FileSaver, Blob, socketEvents) {

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

    $scope.preset = {
        name: "",
        categorySelected: undefined,
        categories: []
    };


    $scope.tracks = drumMachine.tracks;
    $scope.safeApply();






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

    /*
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
    */







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
            url: baseServerUrl + '/api/midi',
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


    $scope.populateCategories = () => {
        return new Promise((resolve, reject) => {
            $http({
                url: baseServerUrl + "/api/categories",
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }).then(response => {
                // console.log(response);
                let categories = response.data;
                // categories.forEach(c => {
                //     $scope.categories.push(c.name);
                // });
                $scope.preset.categories = categories;
                resolve(categories);

            }, error => {
                console.log(error);
                reject(error);
            });
        });
    };


    $scope.loadPreset = () => {

        $http({
            url: baseServerUrl + "/api/presets",
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


    $scope.savePreset = () => {

        let formData = new FormData();
        let jsonPreset = drumMachine.buildJsonPreset($scope.preset.name, $scope.preset.categorySelected.name);


        for (let id in drumMachine.tracks) {

            if (drumMachine.tracks.hasOwnProperty(id)) {
                let track = drumMachine.tracks[id];

                let blob = new Blob([track.sampleData.originalBuffer], {
                    // type: track.sampleData.extension ? "audio/" + track.sampleData.extension : "octet-stream"
                    type: "octet-stream"
                });

                formData.append("sample", blob, track.sampleData.fileName);
            }
        }


        formData.append("preset", jsonPreset);


        let xhr = new XMLHttpRequest();



        xhr.open( 'POST', baseServerUrl + '/api/presets', true );
        xhr.setRequestHeader("Accept", "application/json");
        xhr.onload = () => {
            // created
            if (xhr.status === 201) {
                toastOk("Preset saved! ;-)");
                $scope.onPresetCancel();
            }
            else if (xhr.status === 409) {
                console.log(xhr.response);
                toastError("Preset name " + $scope.preset.name + " already taken for category " + $scope.preset.categorySelected.name);
            }
            else {
                toastError("Ops! Something went wrong :-(");
                $scope.onPresetCancel();
            }
        };
        xhr.send( formData );



    };


    $scope.uploadFiles = () => {

        let formData = new FormData();

        // $('input[type="file"]').each(function(index) {
        //
        //     let fileList = $(this)[0].files;
        //
        //     for(let i = 0; i < fileList.length; i++) {
        //         let file = fileList[i];
        //         formData.append(file.name, file);
        //     }
        // });






        // drumMachine.tracks.forEach(track => {
        //
        //     console.log(track);
        //     let buffer = track.buffer;
        //     let blob = new Blob(buffer);
        //     formData.append(track.name, blob, "campione.wav");
        //
        // });

        for (let id in drumMachine.tracks) {
            if (drumMachine.tracks.hasOwnProperty(id)) {
                let track = drumMachine.tracks[id];


                let blob = new Blob([track.sampleData.originalBuffer], {
                    // type: track.sampleData.extension ? "audio/" + track.sampleData.extension : "octet-stream"
                    type: "octet-stream"
                });

                formData.append("sample", blob, track.sampleData.fileName);
            }
        }



        let obj = {
            name: "track",
            bpm: 120,
            tracks: [
                {
                    name: "kick"
                },
                {
                    name: "snare"
                }
            ]
        };

        formData.append("preset", JSON.stringify(obj));


        let xhr = new XMLHttpRequest();



        xhr.open( 'POST', baseServerUrl + '/api/upload', true );
        xhr.setRequestHeader("Accept", "application/json");
        xhr.onload = handler;
        xhr.send( formData );

        function handler(e) {
            console.log(e);
        }

        // $http({
        //     url: "http://localhost:4500/upload",
        //     method: "POST",
        //     transformRequest: angular.identity,
        //     header: {
        //         "Content-Type": undefined,
        //     },
        //     data: formData
        // }).then(response => {
        //     console.log(response);
        // }, error => {
        //     console.log(error);
        // });



    };


    $scope.postComment = ()=> {

        let data = {
            username: $scope.username,
            message: $scope.commentToPost
        };

        $http({
            url: baseServerUrl + '/api/comments',
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            data: JSON.stringify(data)

        }).then(function (response) {
            console.log(response);
        }, function (response) {
            console.log(response);
        });

    };


    $scope.onPresetCancel = () => {
        $(".save-preset-container").remove();
    };


    $scope.onPresetSave = () => {
        $scope.savePreset();
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


    function initPresetsMenu(categories) {

        $('li[id="presetsMenu"]').remove();

        $http({
            url: baseServerUrl + "/api/presets",
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        }).then(response => {

            let presetsData = response.data;
            if (presetsData.length === 0) {
                return;
            }


            let liParent = $('<li id="presetsMenu"><a href="#">Presets</a></li>');
            let ulParent = $("<ul></ul>");
            liParent.append(ulParent);


            categories.forEach(category => {

                let match = presetsData.find(e => { return e._id === category.name; });

                if (!match) {
                   return;
                }

                let categoryPresets = match.presets;

                let liCategory = $('<li><a href="#">' + category.name + '</a></li>');
                let ul = $("<ul></ul>");


                categoryPresets.forEach(preset => {
                    let li = $('<li><a href="#">' + preset.name + '</a></li>');
                    li.click(() => {
                        loadPresetFromJson(preset);
                    });

                    ul.append(li);
                });

                liCategory.append(ul);
                ulParent.append(liCategory);

            });


            let API = $("nav#menu").data( "mmenu" );
            $("#menu-list").find( ".mm-listview li:first" ).after( liParent );
            API.initPanels( $("#menu-list") );


        }, errorResponse => {
            console.log(errorResponse);
            initExportMidiMenu();
        });
    }


    function initSavePresetMenu() {
        let li = $('<li><a href="#">Save preset</a></li>');

        li.click(() => {
            let savePreset = angular.element(document.createElement('save-preset'));
            let domElem = $compile( savePreset )( $scope );
            angular.element(document.body).append(domElem);
        });

        let API = $("nav#menu").data( "mmenu" );
        $("#menu-list").find( ".mm-listview" ).append( li );
        API.initPanels( $("#menu-list") );
    }


    function loadComments() {

        enableCommentsLoadingSpinner();

        $http({
            url: baseServerUrl + '/api/comments',
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
        }, 0);
    }


    function disableLoadingSpinner() {
        setTimeout(() => {
            loadingContainer.removeClass("loading-active");
        }, 1500);
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


    function toastError(text) {
        $.toast({
            text : text,
            showHideTransition : 'slide',  // It can be plain, fade or slide
            bgColor : '#ff4a40',              // Background color for toast
            textColor : '#fff',            // text color
            allowToastClose : false,       // Show the close button or not
            hideAfter : 3000,              // `false` to make it sticky or time in miliseconds to hide after
            stack : 5,                     // `fakse` to show one stack at a time count showing the number of toasts that can be shown at once
            textAlign : 'left',            // Alignment of text i.e. left, right, center
            position : 'top-right'       // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values to position the toast on page
        });
    }


    function toastOk(text) {
        $.toast({
            text : text,
            showHideTransition : 'slide',  // It can be plain, fade or slide
            bgColor : '#05a2fc',              // Background color for toast
            textColor : '#fff',            // text color
            allowToastClose : false,       // Show the close button or not
            hideAfter : 3000,              // `false` to make it sticky or time in miliseconds to hide after
            stack : 5,                     // `fakse` to show one stack at a time count showing the number of toasts that can be shown at once
            textAlign : 'left',            // Alignment of text i.e. left, right, center
            position : 'top-right'       // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values to position the toast on page
        });
    }
















    /**
     * ---------------------------------------------------------------------------------------
     * init
     * ---------------------------------------------------------------------------------------
     */

    const socket = io.connect(baseServerUrl);
    initSequencerControls($scope, drumMachine);

    $(window).ready(() => {
        initSavePresetMenu();
        initExportMidiMenu();

        $scope.populateCategories().then(categories => {
            initPresetsMenu(categories);
        });

        $interval(() => {
            $scope.populateCategories().then(categories => {
                console.log("$interval: populateCategories");
            })
        }, 20000);

        socket.on(socketEvents.newPreset, data => {
            console.log(socketEvents.newPreset, data);
            initPresetsMenu($scope.preset.categories);
        });

        socket.on(socketEvents.newComment, comment => {
            // toastOk("Comment posted!");
            $scope.comments.splice(0, 0, comment);
            $scope.commentToPost = "";
            $scope.safeApply();
        });

    });



}







