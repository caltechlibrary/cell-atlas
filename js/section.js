let sectionTextMaterial = document.querySelector(".section-text__content");
if(sectionTextMaterial) addTypeFocusToggle(sectionTextMaterial);

let comparisonVideoButtons = document.querySelectorAll(".book-section-comparison-button-container button");
for(let comparisonVideoButton of comparisonVideoButtons) {
    addTypeFocusToggle(comparisonVideoButton);
}

// Add event listener to video player to shelf text on first play
let video = document.querySelector(".main-non-text-container video");
if(video) {
    // Source the video using the DOI only if a local path is not being used
    createVideoPlayer(video);
}

// Get sources for modal videos
let modalVideos = document.querySelectorAll(".subsection-modal-container video");
if(modalVideos) {
    for(let modalVideo of modalVideos) {
        createVideoPlayer(modalVideo);
    }
}

document.addEventListener("keydown", function(event) {
    let focusedElement = document.activeElement;

    if(event.key === "ArrowLeft" || event.key === "ArrowRight") {
        if(focusedElement.tagName == "INPUT") return;
        let direction = (event.key === "ArrowLeft") ? "prev" : "next" ;
        let link = document.querySelector(`a[data-nav='${direction}']`);
        if(link) link.click();
    } else if(event.key == "ArrowUp" || event.key == "ArrowDown") {
        if(focusedElement.tagName == "INPUT") return;
        let textMaterial = document.querySelector(".section-text__content");
        let modalOverlay = document.getElementById("modalOverlay");
        if(modalOverlay && modalOverlay.style.display == "block") {
            let modalContainers = document.getElementsByClassName("subsection-modal-container");
            for(let modalContainer of modalContainers) {
                if(modalContainer.style.display == "flex") {
                    let modalMaterial = modalContainer.querySelector(".subsection-modal-text");
                    modalMaterial.focus();
                }
            }
        } else if(textMaterial && textMaterial.getAttribute("tabindex") == "0") {
            textMaterial.focus();
        }
    } else if(event.key == " ") {
        if(focusedElement.tagName == "BUTTON" || focusedElement.type == "checkbox" || focusedElement.type == "search") return;
        let modalOverlay = document.getElementById("modalOverlay");
        let nonTextContent = document.querySelector(".main-non-text-container");
        let videoPlayer;
        if(modalOverlay && modalOverlay.style.display == "block") {
            let modalContainers = document.getElementsByClassName("subsection-modal-container");
            for(let modalContainer of modalContainers) {
                if(modalContainer.style.display == "flex") {
                    let modalText = modalContainer.querySelector(".subsection-modal-text");
                    if(modalText.contains(focusedElement)) return;
                    videoPlayer = modalContainer.querySelector(".book-section-video-player");
                }
            }
        } else if(nonTextContent) {
            let textMaterial = document.querySelector(".section-text__content");
            if(textMaterial.contains(focusedElement)) return;
            videoPlayer = nonTextContent.querySelector(".book-section-video-player");
        }
        if(videoPlayer) {
            let playerId = videoPlayer.getAttribute("data-player");
            let selectedTab = document.querySelector(`.book-section-comparison-button-container button[data-player='${playerId}'][data-state='selected']`);
            let videoTab = document.querySelector(`.book-section-comparison-button-container button[data-player='${playerId}'][value='video']`);
            if(!videoTab || (selectedTab && selectedTab.value == "video")) {
                let playPauseButton = document.getElementById(`${playerId}-playPauseButton`);
                playPauseButton.click();
            }
        }
    }
});

// Check url to see if modal anchor is included. If so, trigger button press
let secUrl = window.location.href;
let secSplit = secUrl.split("#");
if(secSplit.length > 1) {
    let buttons = [];
    let anchor = secSplit[1];
    let learnMore = document.querySelector(".learn-more");
    if(learnMore) buttons = learnMore.getElementsByTagName("button");
    for(let button of buttons){
        if (button.value == anchor) {
            button.click();
        }
    }
}

let progressBar = document.getElementById("customBookProgress");
if(progressBar) {
    let progressPopUp = document.getElementById("progressPopUp");
    let progressMarker = document.getElementById("progressBarMarker");
    let posElementsContainer = document.getElementById("posElementsContainer");
    let progressSwitchInput = document.querySelector(".progress-switch-input");
    let progressSwitchSlider = document.querySelector(".progress-switch-slider");
    let footer = document.querySelector("footer");
    let hideProgTimeout;

    if (typeof(Storage) !== "undefined") {
        let progressOn = window.sessionStorage.getItem("progressOn");
        if(!progressOn || progressOn == "true") {
            progressSwitchInput.checked = true;
            progressBar.classList.add("showing");
            progressBar.classList.add("unshelfed");
        } else {
            progressSwitchInput.checked = false;
        }
        progressSwitchSlider.classList.add("is-showing");
        if(document.getElementsByTagName("body")[0].classList.contains("preload")) {
            window.addEventListener("load", () => {
                progressSwitchInput.removeAttribute("disabled");
            });
        } else {
            progressSwitchInput.removeAttribute("disabled");
        }
    }

    posElementsContainer.addEventListener("mouseenter", function() {
        let halfLength = progressPopUp.scrollWidth / 2;
        if(hideProgTimeout) window.clearTimeout(hideProgTimeout);
        progressPopUp.classList.remove("progress-popup-hidden");
        if(progressMarker.getBoundingClientRect().left - halfLength <= 0) {
            progressPopUp.style.transform = `initial`;
            progressPopUp.style.right = "initial";
            progressPopUp.style.left = `0.25em`;
        } else if(progressMarker.getBoundingClientRect().right + halfLength >= window.innerWidth) {
            progressPopUp.style.transform = `initial`;
            progressPopUp.style.left = `initial`;
            progressPopUp.style.right = `0.25em`;
        } else {
            progressPopUp.style.transform = `translate(-50%, 0)`;
            progressPopUp.style.right = `initial`;
            progressPopUp.style.left = `${progressMarker.getAttribute("data-percent")}%`;
        }
    });
    posElementsContainer.addEventListener("mouseleave", function() {
        hideProgTimeout = setTimeout(function() {
            progressPopUp.setAttribute("style", "");
            progressPopUp.classList.add("progress-popup-hidden");
        }, 500);
    });

    progressSwitchInput.addEventListener("change", function(event) {
        if(progressSwitchInput.checked) {
            window.sessionStorage.setItem("progressOn", true);
            progressBar.classList.add("showing");
            progressBar.classList.add("unshelfed");
        } else {
            window.sessionStorage.setItem("progressOn", false);
            progressBar.classList.remove("unshelfed");
            progressBar.addEventListener("transitionend", function() {
                if(progressBar.getBoundingClientRect().top > footer.getBoundingClientRect().top) progressBar.classList.remove("showing");
            }, { once: true });
        }
    });
    progressSwitchSlider.addEventListener("click", function() {
        progressSwitchSlider.classList.add("mouse-focus");
    });

    progressSwitchInput.addEventListener("keydown", function() {
        progressSwitchSlider.classList.remove("mouse-focus");
    });
}

let sectionImgs = document.getElementsByClassName("content-img");
for(let sectionImg of sectionImgs) {
    let parentModal = sectionImg.parentElement;
    let fsContainer = sectionImg.querySelector(".content-img__fullscreen-container");
    let imgContainer = sectionImg.querySelector(".content-img__img-container");
    let img = sectionImg.querySelector(".content-img__img");
    let enlargeBtn = sectionImg.querySelector(".content-img__enlarge-btn");
    let minBtn = sectionImg.querySelector(".content-img__minimize-btn");
    let openBottom = imgContainer.classList.contains("content-img__img-container--open-bottom");
    let aspectRatio;
    let onImgLoad = function() {
        aspectRatio = img.width / img.height;
        enlargeBtn.disabled = false;
        minBtn.disabled = false;
    }
    if(img.complete) {
        onImgLoad();
    } else {
        img.addEventListener("load", onImgLoad);
    }

    enlargeBtn.addEventListener("click", function() {
        enlargeBtn.classList.add("content-img__btn--hidden");
        minBtn.classList.remove("content-img__btn--hidden");
        imgContainer.classList.add("content-img__img-container--enlarged");
        if(openBottom) imgContainer.classList.remove("content-img__img-container--open-bottom");
        if(window.innerWidth >= 900) {
            positionEnlargedImg();
            window.addEventListener("resize", positionEnlargedImg);
        } else {
            if(fsContainer.requestFullscreen) {
                fsContainer.requestFullscreen();
            } else {
                fsContainer.classList.add("content-img__fullscreen-container--fs-polyfill");
                imgContainer.classList.add("content-img__img-container--fs-polyfill");
            }
        }
    });
    minBtn.addEventListener("click", function() {
        minBtn.classList.add("content-img__btn--hidden");
        enlargeBtn.classList.remove("content-img__btn--hidden");
        imgContainer.classList.remove("content-img__img-container--enlarged");
        if(openBottom) imgContainer.classList.add("content-img__img-container--open-bottom");
        if(window.innerWidth >= 900) {
            imgContainer.style.width = "initial";
            imgContainer.style.top = "initial";
            imgContainer.style.height = "initial";
            window.removeEventListener("resize", positionEnlargedImg);
        } else {
            if(fsContainer.requestFullscreen) {
                document.exitFullscreen()
            } else {
                fsContainer.classList.remove("content-img__fullscreen-container--fs-polyfill");
                imgContainer.classList.remove("content-img__img-container--fs-polyfill");
            }
        }
    });

    let positionEnlargedImg = function() {
        let header = document.querySelector("header");
        let footer = document.querySelector("footer");
        let posTop = header.offsetHeight + ((footer.getBoundingClientRect().top - header.getBoundingClientRect().bottom) / 2);
        let availHeight = (footer.getBoundingClientRect().top - header.getBoundingClientRect().bottom) - 50;
        let availWidth = window.innerWidth - 100;
        let imageWidth = availHeight * aspectRatio;
        if(imageWidth < availWidth) {
            imgContainer.style.width = `${imageWidth}px`;
        } else {
            imgContainer.style.width = `${availWidth}px`;
        }
        imgContainer.style.top = `${posTop}px`;
    }
}

function showModal(el) {
    if(video && !video.paused) video.pause();
    let modalId = el.getAttribute("value");
    // openModal is defined in modal.js
    openModal(modalId);

    // Fix modal canvas size. Would use custom events, but IE does not support the recommended methods.
    let modal = document.getElementById(modalId);
    let videoPlayer = modal.querySelector(".book-section-video-player");
    if(!videoPlayer) return;
    let videoEl = videoPlayer.querySelector("video");
    let playerId = videoEl.getAttribute("id");
    let videoPaintCanvas = videoPlayer.querySelector(`#${playerId}-videoPaintCanvas`);
    let videoScrubCanvas = videoPlayer.querySelector(`#${playerId}-videoScrubCanvas`);

    videoPaintCanvas.setAttribute("width", `${videoEl.offsetHeight * (16/9)}px`);
    videoPaintCanvas.setAttribute("height", `${videoEl.offsetHeight}px`);
    videoScrubCanvas.setAttribute("width", `${videoEl.offsetHeight * (16/9)}px`);
    videoScrubCanvas.setAttribute("height", `${videoEl.offsetHeight}px`);

    setTimeout(function() {
        videoPaintCanvas.setAttribute("width", `${videoEl.offsetHeight * (16/9)}px`);
        videoPaintCanvas.setAttribute("height", `${videoEl.offsetHeight}px`);
        videoScrubCanvas.setAttribute("width", `${videoEl.offsetHeight * (16/9)}px`);
        videoScrubCanvas.setAttribute("height", `${videoEl.offsetHeight}px`);
    }, 500)
    
}

function createVideoPlayer(videoEl) {
    let playerId = videoEl.getAttribute("id");
    let doi = videoEl.getAttribute("doi");
    let highSrc;
    let medSrc;
    let parentMediaViewer = videoEl.closest(".media-viewer");
    let videoTabBtn = parentMediaViewer.querySelector(".media-viewer__tab-btn[value='vid']");
    let videoPlayer = document.querySelector(`.book-section-video-player[data-player='${playerId}']`);
    let videoControls = videoPlayer.querySelector(".book-section-video-player-controls");
    let playPauseButton = videoControls.querySelector(`#${playerId}-playPauseButton`);
    let videoTimeStatus = videoControls.querySelector(`#${playerId}-videoTimeStatus`);
    let qualityChangerDesktop = videoControls.querySelector(`#${playerId}-qualityChanger`);
    let qualityChangerOpenBtn;
    let qualityText;
    if(qualityChangerDesktop) {
        qualityChangerOpenBtn = qualityChangerDesktop.querySelector("button");
        qualityText = qualityChangerDesktop.querySelector("button span");
    }
    let playerQualityInputs = document.querySelectorAll(`.video-quality-changer-entry input[data-player='${playerId}']`);
    let allPageQualityInputs = document.querySelectorAll(".video-quality-changer-entry input");
    let fullScreenButton = videoControls.querySelector(`#${playerId}-fullScreenButton`);
    let seekBar = videoControls.querySelector(`#${playerId}-seekBar`);
    let videoPaintCanvas = videoPlayer.querySelector(`#${playerId}-videoPaintCanvas`);
    let videoScrubCanvas = videoPlayer.querySelector(`#${playerId}-videoScrubCanvas`);
    let paintContext = videoPaintCanvas.getContext("2d");
    let scrubContext = videoScrubCanvas.getContext("2d");
    seekBar.bufferPercent = 0;
    let videoDuration;
    let fps = 15;
    let frameImages;
    let frameInterval;

    window.addEventListener("pagehide", function(event) {
        if(event.persisted === true) {
            if(!videoEl.paused){
                seekBar.setAttribute("autocomplete", "on");
                videoEl.pause();
            }
        } else {
            seekBar.setAttribute("autocomplete", "off");
        }
    });

    addTypeFocusToggle(playPauseButton);
    addTypeFocusToggle(fullScreenButton);
    addTypeFocusToggle(seekBar);

    window.addEventListener("resize", resizeCanvases);
    videoEl.addEventListener("loadedmetadata", initializePlayer);
    videoEl.addEventListener("canplay", enablePlayer, { once: true });
    videoEl.addEventListener("play", onVidPlay);
    videoEl.addEventListener("pause", onVidPause);
    videoEl.addEventListener("timeupdate", handleTimeUpdate);
    videoEl.addEventListener("progress", updateBufferedTime);
    if(!OFFLINE && window.createImageBitmap) {
        videoEl.addEventListener("playing", initializeFrameInterval);
        videoEl.addEventListener("seeked", onSeeked);
        videoEl.addEventListener("ended", clearFrameInterval);
        videoEl.addEventListener("waiting", clearFrameInterval);
    }
    if(videoTabBtn) videoTabBtn.addEventListener("click", resizeCanvases);
    if(videoEl === document.querySelector(".main-non-text-container video")) {
        let nonTextSection = document.querySelector(".main-non-text-container");
        nonTextSection.addEventListener("transitionend", resizeCanvases);
    }
    playPauseButton.addEventListener('click', togglePlayPause);
    if(qualityChangerOpenBtn) qualityChangerOpenBtn.addEventListener("click", toggleQualityChanger);
    for(let qualityInput of allPageQualityInputs) {
        qualityInput.addEventListener("change", loadQuality);
    }
    fullScreenButton.addEventListener("click", toggleFullscreen);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);
    seekBar.addEventListener("input", handleSeekInput);
    seekBar.addEventListener("mousedown", pauseOnSeekControl);
    seekBar.addEventListener("keydown", pauseOnSeekControl);
    seekBar.addEventListener("mouseup", hideScrubCanvas);
    seekBar.addEventListener("keyup", hideScrubCanvas); 

    if(!OFFLINE) {
        let currQuality = window.sessionStorage.getItem("vidQuality");
        let qualityValue = (currQuality == "Med") ? "480" : "1080";
        let dataFile = videoEl.getAttribute("data-file");
        let dataFileMed = `${dataFile.substring(0, dataFile.length-4)}_480p.mp4`;
        let source = document.createElement("source");

        videoEl.appendChild(source);
        medSrc = `https://www.cellstructureatlas.org/videos/${dataFileMed}`;

        if(currQuality == "Med") {
            source.setAttribute("src", medSrc);
            videoEl.load();
        } else if(!doi) {
            source.setAttribute("src", highSrc);
            videoEl.load();
        }

        if(doi) {
            let doiUrl = 'https://api.datacite.org/dois/' + doi + '/media';
            fetch(doiUrl)
                .then(function(res) {
                    return res.json();
                })
                .then(function(data){
                    highSrc = data.data[0].attributes.url;
                    if(currQuality == "High" || !currQuality) {
                        source.setAttribute("src", highSrc);
                        videoEl.load();
                    }
                });
        } else {
            highSrc = `https://www.cellstructureatlas.org/videos/${dataFile}`;
            if(currQuality == "High" || !currQuality) {
                source.setAttribute("src", highSrc);
                videoEl.load();
            }
        }

        updateQualityChanger(qualityValue);
    }

    function resizeCanvases() {
        if(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            if(window.innerHeight > (window.innerWidth * (videoEl.videoHeight/videoEl.videoWidth))) {
                videoPaintCanvas.setAttribute("width", `${Math.round(videoEl.offsetWidth)}px`);
                videoPaintCanvas.setAttribute("height", `${Math.round(videoEl.offsetWidth * (9/16))}px`);
                videoScrubCanvas.setAttribute("width", `${Math.round(videoEl.offsetWidth)}px`);
                videoScrubCanvas.setAttribute("height", `${Math.round(videoEl.offsetWidth * (9/16))}px`);
            } else {
                videoPaintCanvas.setAttribute("width", `${Math.round(videoEl.offsetHeight * (16/9))}px`);
                videoPaintCanvas.setAttribute("height", `${Math.round(videoEl.offsetHeight)}px`);
                videoScrubCanvas.setAttribute("width", `${Math.round(videoEl.offsetHeight * (16/9))}px`);
                videoScrubCanvas.setAttribute("height", `${Math.round(videoEl.offsetHeight)}px`);
            }
        } else {
            videoPaintCanvas.setAttribute("width", `${Math.round(videoEl.offsetHeight * (16/9))}px`);
            videoPaintCanvas.setAttribute("height", `${Math.round(videoEl.offsetHeight)}px`);
            videoScrubCanvas.setAttribute("width", `${Math.round(videoEl.offsetHeight * (16/9))}px`);
            videoScrubCanvas.setAttribute("height", `${Math.round(videoEl.offsetHeight)}px`);
            setTimeout(function() {
                videoPaintCanvas.setAttribute("width", `${Math.round(videoEl.offsetHeight * (16/9))}px`);
                videoPaintCanvas.setAttribute("height", `${Math.round(videoEl.offsetHeight)}px`);
                videoScrubCanvas.setAttribute("width", `${Math.round(videoEl.offsetHeight * (16/9))}px`);
                videoScrubCanvas.setAttribute("height", `${Math.round(videoEl.offsetHeight)}px`);
            }, 200);
        }
    }

    function initializePlayer() {
        clearFrameInterval();
        resizeCanvases();
        updateBufferedTime(videoEl, seekBar);
        frameImages = {};
        if(!videoDuration) {
            videoDuration = videoEl.duration;
            seekBar.step = `${1/fps}`;
            let totalMinutes = (videoDuration >= 60) ? Math.floor(videoDuration / 60) : 0;
            let seconds = Math.round(videoDuration) - (totalMinutes * 60);
            let secondsFormatted = (seconds < 10) ? `0${seconds}` : seconds;
            videoTimeStatus.innerHTML = `0:00 / ${totalMinutes}:${secondsFormatted}`;
        }
    }

    function enablePlayer() {
        playPauseButton.removeAttribute("disabled");
        fullScreenButton.removeAttribute("disabled");
        seekBar.removeAttribute("disabled");
        if(window.innerWidth > 900) videoEl.addEventListener("click", () => playPauseButton.click());
    }

    function onVidPlay() {
        videoPlayer.addEventListener("mouseleave", hidePlayerControls);
        videoPlayer.addEventListener("mouseenter", showPlayerControls);
        togglePlayState();
    }

    function onVidPause() {
        clearFrameInterval();
        videoControls.style.opacity = 1;
        videoPlayer.removeEventListener("mouseleave", hidePlayerControls);
        videoPlayer.removeEventListener("mouseenter", showPlayerControls);
        togglePlayState();
    }

    function hidePlayerControls() {
        videoControls.style.opacity = 0;
    }
    
    function showPlayerControls() {
        videoControls.style.opacity = 1;
    }

    function togglePlayState() {
        if (videoEl.paused || videoEl.ended) {
            playPauseButton.setAttribute('data-state', 'play');
        }
        else {
            playPauseButton.setAttribute('data-state', 'pause');
        }
    }

    function handleTimeUpdate() {
        if(videoEl.readyState > 0) {
            seekBar.value = (videoEl.currentTime / videoDuration) * 100;
            updateSeekBar();
            updateTimeStamp();
        }
    }

    function updateBufferedTime() {
        if (videoDuration > 0) {
            for (var i = 0; i < videoEl.buffered.length; i++) {
                if (videoEl.buffered.start(videoEl.buffered.length - 1 - i) < videoEl.currentTime || videoEl.buffered.start(videoEl.buffered.length - 1 - i) <= 0) {
                    seekBar.bufferPercent = (videoEl.buffered.end(videoEl.buffered.length - 1 - i) / videoDuration) * 100;
                    updateSeekBar(seekBar);
                    break;
                }
            }
        }
    }

    function initializeFrameInterval() {
        frameInterval = setInterval(function(){
            saveFrame();
        }, 1000/fps);
    }

    async function onSeeked() {
        // Overide scrub by displaying video and save frame to scrub
        let seekedTime = videoEl.currentTime;
        let roundedSeekedTime = Math.round(seekedTime * fps) / fps;
        // Check if frame does not exist already
        if(roundedSeekedTime in frameImages) return;
        videoScrubCanvas.style.display = "none";
        await saveFrame();
        scrubContext.drawImage(frameImages[roundedSeekedTime], 0, 0, videoScrubCanvas.width, videoScrubCanvas.height);
    }

    async function saveFrame() {
        let currentFrameTime = videoEl.currentTime;
        if(Math.round(currentFrameTime * fps) / fps in frameImages) return;
        paintContext.drawImage(videoEl, 0, 0, videoPaintCanvas.width, videoPaintCanvas.height);
        imageData = paintContext.getImageData(0, 0, videoPaintCanvas.width, videoPaintCanvas.height);
        imageBitmap = await createImageBitmap(imageData);
        frameImages[Math.round(currentFrameTime * fps) / fps] = imageBitmap;
    }

    function clearFrameInterval() {
        clearInterval(frameInterval);
    }

    function togglePlayPause() {
        if (videoEl.paused || videoEl.ended) {
            videoEl.play();
        } else {
            videoEl.pause();
        }
    }

    function toggleQualityChanger() {
        let changerContainer = qualityChangerDesktop.querySelector(".video-quality-changer");
        let state = qualityChangerDesktop.getAttribute("data-state");
    
        if(state == "expanded") {
            collapseChanger();
        } else {
            let qualityInputs = qualityChangerDesktop.getElementsByTagName("input");
            for(let qualityInput of qualityInputs) {
                qualityInput.setAttribute("tabindex", "0");
            }
            changerContainer.removeEventListener("transitionend", collapseState);
            qualityChangerDesktop.setAttribute("data-state", "expanded");
            changerContainer.style.padding = "3px 0 1.5em 3px";
            changerContainer.style.height = "4.5em";
            window.addEventListener("click", closeChangerClick);
        }
    }

    function collapseChanger() {
        let changerContainer = qualityChangerDesktop.querySelector(".video-quality-changer");
        let qualityInputs = qualityChangerDesktop.getElementsByTagName("input");
        for(let qualityInput of qualityInputs) {
            qualityInput.setAttribute("tabindex", "-1");
        }
        changerContainer.style.height = 0;
        changerContainer.style.padding = 0;
        window.removeEventListener("click", closeChangerClick);
        if(document.querySelector("body").classList.contains("preload")) {
            qualityChangerDesktop.setAttribute("data-state", "collapsed");
        } else {
            changerContainer.addEventListener("transitionend", collapseState, { once: true });
        }
    }

    function collapseState(event) {
        qualityChangerDesktop.setAttribute("data-state", "collapsed");
    }
    
    function closeChangerClick(event) {
        if(qualityChangerDesktop && !qualityChangerDesktop.contains(event.target)) {
            collapseChanger();
        }
    }

    function loadQuality(event) {
        let qualityInput = event.currentTarget;
        let vidQuality = (qualityInput.value == "480") ? "Med" : "High";
        let source = videoEl.querySelector("source");
        let currentTime = videoEl.currentTime;
        let paused = videoEl.paused;

        window.sessionStorage.setItem("vidQuality", vidQuality);
        videoEl.setAttribute("preload", "none");
        for(let playerQualityInput of playerQualityInputs) {
            if(playerQualityInput == event.target) {
                videoEl.setAttribute("preload", "metadata");
            }
        }
        updateQualityChanger(qualityInput.value);

        if(vidQuality == "High") {
            source.setAttribute("src", highSrc);
        } else {
            source.setAttribute("src", medSrc);
        }

        videoEl.load();
        videoEl.addEventListener("canplay", function() {
            videoEl.currentTime = currentTime;
            if(!paused) videoEl.play();
        }, { once: true });
    }

    function updateQualityChanger(quality) {
        qualityText.innerHTML = `${quality}p`;
        let qualityInputs = document.querySelectorAll(`.video-quality-changer-entry input[data-player='${playerId}'][value='${quality}']`);
        for(qualityInput of qualityInputs) {
            qualityInput.checked = true;
        }
    }

    function toggleFullscreen() {
        if(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            window.addEventListener("touchstart", detectSwipe);
            videoPlayer.classList.remove("book-section-video-player-fullscreen");
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        } else {
            if (videoPlayer.requestFullscreen) {
                videoPlayer.requestFullscreen();
            } else if (videoPlayer.webkitRequestFullscreen) { /* Safari */
                videoPlayer.webkitRequestFullscreen();
            } else if (videoPlayer.msRequestFullscreen) { /* IE11 */
                videoPlayer.msRequestFullscreen();
            }
        }
        document.activeElement.blur();
    }

    function handleFullscreenChange() {
        if(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            window.removeEventListener("touchstart", detectSwipe);
            videoPlayer.classList.add("book-section-video-player-fullscreen");
        } else {
            window.addEventListener("touchstart", detectSwipe);
            videoPlayer.classList.remove("book-section-video-player-fullscreen");
        }
        resizeCanvases();
    }

    function handleSeekInput() {
        let seekBarTime = (parseFloat(seekBar.value) / 100) * videoDuration;

        if(!OFFLINE && window.createImageBitmap) {
            videoScrubCanvas.style.display = "block";
            let roundedTime = Math.round(seekBarTime * fps) / fps;
            if(roundedTime in frameImages) {
                scrubContext.drawImage(frameImages[roundedTime], 0, 0, videoScrubCanvas.width, videoScrubCanvas.height);
            }   
        }

        videoEl.currentTime = seekBarTime;
        updateSeekBar();
        updateTimeStamp();
    }

    function pauseOnSeekControl(event) {
        if(event.type == "keydown") {
            if(event.key != "ArrowDown" && event.key != "ArrowLeft" && event.key != "ArrowRight" && event.key != "ArrowUp") return;
        }
        if(!videoEl.paused) {
            videoEl.pause();
            seekBar.addEventListener("keyup", autoResumeVid);
            seekBar.addEventListener("mouseup", autoResumeVid);
        }
    }

    function autoResumeVid(event) {
        event.target.removeEventListener("keyup", autoResumeVid);
        event.target.removeEventListener("mouseup", autoResumeVid);
        videoEl.play();
    }

    function hideScrubCanvas() {
        if(videoEl.seeking) {
            videoEl.addEventListener("seeked", function() {
                videoScrubCanvas.style.display = "none";
            }, { once: true });
        } else {
            videoScrubCanvas.style.display = "none";
        }
    }
    
    function updateSeekBar() {
        let percentage = parseFloat(seekBar.value);
        let background = `linear-gradient(90deg, #ffffff 0% ${percentage}%, #bfbfbf ${percentage+0.1}% ${seekBar.bufferPercent+0.1}%, #717171 ${seekBar.bufferPercent+0.1}%)`;
        seekBar.style.background = background;
    }
    
    function updateTimeStamp() {
        let totalTime = videoTimeStatus.innerHTML.split("/")[1].trim();
        let currentTime = (parseFloat(seekBar.value) / 100) * videoDuration;
        let minute = (currentTime >= 60) ? Math.floor(currentTime / 60) : 0;
        let seconds = (minute > 0) ? currentTime - (minute * 60) : currentTime;
        seconds = Math.round(seconds);
        let secondsFormatted = (seconds < 10) ? `0${seconds}` : seconds;
        videoTimeStatus.innerHTML = `${minute}:${secondsFormatted} / ${totalTime}`;
    }
}

function toggleImageSlider(el) {
    let selectedValue = el.getAttribute("value");
    let videoPlayerId = el.getAttribute("data-player");
    let videoQualitySwitcherMobile = document.querySelector(`.video-quality-changer-mobile[data-player='${videoPlayerId}']`);
    let videoContainer = document.querySelector(`.book-section-video-player[data-player='${videoPlayerId}']`);
    let videoElement = videoContainer.querySelector("video");
    let comparissonFullBackground = document.querySelector(`#fullBackground-${videoPlayerId}`);
    let currSelectedButton = el.parentElement.querySelector("button[data-state='selected']");

    if(!videoElement.paused) videoElement.pause();

    if(selectedValue == "image") {
        comparissonFullBackground.style.display = "block";
        videoContainer.style.display = "none";
        if(window.innerWidth <= 900 && videoQualitySwitcherMobile) videoQualitySwitcherMobile.style.display = "none";
    } else {
        comparissonFullBackground.style.display = "none";
        videoContainer.style.display = "flex";
        if(window.innerWidth <= 900 && videoQualitySwitcherMobile) videoQualitySwitcherMobile.style.display = "flex";
    }
    currSelectedButton.setAttribute("data-state", "");
    el.setAttribute("data-state", "selected");
}