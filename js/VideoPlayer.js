let VideoPlayer = function(root) {
    
    let video = root.querySelector(".video-player__video");
    let videoSrc = video.querySelector("source");
    let doi = root.getAttribute("data-doi");
    let vidName = root.getAttribute("data-vid-name");
    let controlsContainer = root.querySelector(".video-player__controls-container");
    let playBackBtn = root.querySelector(".video-player__control-btn-playback");
    let playBackBtnMobile = root.querySelector(".video-player__playback-btn-mobile");
    let playIcon = root.querySelector(".video-player__control-icon-play");
    let playIconMobile = root.querySelector(".video-player__playback-btn-mobile-play-icon");
    let pauseIcon = root.querySelector(".video-player__control-icon-pause");
    let pauseIconMobile = root.querySelector(".video-player__playback-btn-mobile-pause-icon");
    let timeDisplay = root.querySelector(".video-player__time-display");
    let qualityChanger = root.querySelector(".video-player__quality-changer");
    let openQualityChangerBtn = root.querySelector(".video-player__quality-changer-open-btn");
    let openQualityChangerBtnText = root.querySelector(".video-player__quality-changer-open-btn-text");
    let qualityOptionsMenu = root.querySelector(".video-player__quality-options-menu");
    let qualityOptionInputs = root.querySelectorAll(".video-player__quality-option-input");
    let fsBtn = root.querySelector(".video-player__control-btn-fs");
    let fsIcon = root.querySelector(".video-player__control-icon-fs");
    let exitFsIcon = root.querySelector(".video-player__control-icon-exit-fs");
    let seekBar = root.querySelector(".video-player__seek-bar");
    let scrubCanvas = root.querySelector(".video-player__scrub-canvas");
    let scrubContext = scrubCanvas.getContext("2d");
    let src1080, src480, paintInterval, formattedDuration, hideMobileControlsTimeout, percentBuffered = 0, fps = 10, scrubImages = {};

    let init = function() {
        src480 = `https://www.cellstructureatlas.org/videos/${vidName}_480p.mp4`;
        if(doi) {
            fetch(`https://api.datacite.org/dois/${doi}/media`)
                .then(res => res.json())
                .then(function(data) {
                    src1080 = data.data[0].attributes.url;
                    initSrc();
                });
        } else {
            src1080 = `https://www.cellstructureatlas.org/videos/${vidName}.mp4`;
            initSrc();
        }
    };

    let initSrc = function() {
        if(window.sessionStorage.getItem("vidQuality") == "480") {
            updateQualityChanger("480");
            loadSrc(src480);
        } else {
            updateQualityChanger("1080");
            loadSrc(src1080);
        }
    };

    let updateQualityChanger = function(quality) {
        let qualityInput = root.querySelector(`.video-player__quality-option-input[value='${quality}']`);
        let qualityTextNode = document.createTextNode(`${quality}p`);
        qualityInput.checked = true;
        if(openQualityChangerBtnText.firstChild) openQualityChangerBtnText.removeChild(openQualityChangerBtnText.firstChild);
        openQualityChangerBtnText.appendChild(qualityTextNode);
    };

    let loadSrc = function(source) {
        videoSrc.setAttribute("src", source);
        video.load();
    }

    let initPlayer = function() {
        formattedDuration = getFormattedTime(video.duration);
        updateTimeDisplay();
        if(window.createImageBitmap) resizeScrubCanvas();
        attachEventListeners();
    };

    let attachEventListeners = function() {
        playBackBtn.addEventListener("click", togglePlayBack);
        video.addEventListener("play", onPlay);
        video.addEventListener("pause", onPause);
        video.addEventListener("timeupdate", updateTimeDisplay);
        video.addEventListener("timeupdate", updateSeekBar);
        video.addEventListener("progress", updatePercentBuffered);
        seekBar.addEventListener("mousedown", onSeekBarMouseDown);
        seekBar.addEventListener("keydown", onSeekBarKeyDown);
        seekBar.addEventListener("input", onSeekBarInput);
        openQualityChangerBtn.addEventListener("click", toggleQualityOptionsMenu);
        fsBtn.addEventListener("click", toggleFullscreen);
        root.addEventListener("fullscreenchange", onFullscreenChange);
        root.addEventListener("webkitfullscreenchange", onFullscreenChange);
        if(window.innerWidth > 900) {
            video.addEventListener("click", togglePlayBack);
        } else {
            video.addEventListener("click", onVideoClickMobile);
            video.addEventListener("play", forceFullscreenMobile);
            playBackBtnMobile.addEventListener("click", togglePlayBack);
            playBackBtnMobile.addEventListener("transitionend", onPlayBackBtnMobileTransitionEnd);
            controlsContainer.addEventListener("touchstart", onControlsContainerTouchStartMobile);
            controlsContainer.addEventListener("touchend", onControlsContainerTouchEndMobile);
            controlsContainer.addEventListener("transitionend", onControlsContainerTransitionEndMobile);
            root.addEventListener("fullscreenchange", forceVideoPause);
        }
        if(window.innerWidth > 900 && window.createImageBitmap) {
            window.addEventListener("resize", resizeScrubCanvas);
            video.addEventListener("playing", startPaintInterval);
            video.addEventListener("pause", endPaintInterval);
            video.addEventListener("seeked", paintCurrentFrame);
            video.addEventListener("emptied", resetScrub);
            seekBar.addEventListener("mousedown", showScrubCanvas);
            seekBar.addEventListener("keydown", showScrubCanvas);
            seekBar.addEventListener("mouseup", hideScrubCanvas);
            seekBar.addEventListener("keyup", hideScrubCanvas);
            seekBar.addEventListener("input", paintSeekedFrame);
        }
    };

    let getFormattedTime = function(timeSeconds) {
        let minutesFormatted = (timeSeconds >= 60) ? Math.floor(timeSeconds / 60) : 0;
        let secondsFormatted = Math.round(timeSeconds) - (minutesFormatted * 60);
        if(secondsFormatted < 10) secondsFormatted = `0${secondsFormatted}`;
        return `${minutesFormatted}:${secondsFormatted}`;
    };

    let updateTimeDisplay = function() {
        let timeTextNode = document.createTextNode(`${getFormattedTime(video.currentTime)} / ${formattedDuration}`);
        timeDisplay.removeChild(timeDisplay.firstChild);
        timeDisplay.appendChild(timeTextNode);
    };

    let togglePlayBack = function() {
        if (video.paused || video.ended) {
            video.play();
        } else {
            video.pause();
        }
    };

    let onPlay = function() {
        playIcon.classList.add("video-player__control-icon--hidden");
        playIconMobile.classList.add("video-player__playback-btn-mobile-icon--hidden");
        pauseIcon.classList.remove("video-player__control-icon--hidden");
        pauseIconMobile.classList.remove("video-player__playback-btn-mobile-icon--hidden");
        controlsContainer.classList.add("video-player__controls-container--playing");
        playBackBtnMobile.classList.add("video-player__playback-btn-mobile--playing");
        hideMobileControls();
    };

    let onPause = function() {
        playIcon.classList.remove("video-player__control-icon--hidden");
        playIconMobile.classList.remove("video-player__playback-btn-mobile-icon--hidden");
        pauseIcon.classList.add("video-player__control-icon--hidden");
        pauseIconMobile.classList.add("video-player__playback-btn-mobile-icon--hidden");
        controlsContainer.classList.remove("video-player__controls-container--hidden");
        controlsContainer.classList.remove("video-player__controls-container--playing");
        playBackBtnMobile.classList.remove("video-player__playback-btn-mobile--hidden-mobile");
        playBackBtnMobile.classList.remove("video-player__playback-btn-mobile--playing");
    };

    let updateSeekBar = function() {
        seekBar.value = Math.round((video.currentTime / video.duration) * parseInt(seekBar.max));
        updateSeekBarBackground();
    };

    let updateSeekBarBackground = function() {
        let seekBarValuePercent = (seekBar.value / parseInt(seekBar.max)) * 100;
        seekBar.style.background = `linear-gradient(90deg, #fff 0% ${seekBarValuePercent}%, #bfbfbf ${seekBarValuePercent + 0.1}% ${percentBuffered}%, #717171 ${percentBuffered + 0.1}%)`;
    };

    let updatePercentBuffered = function() {
        for(let i = 0; i < video.buffered.length; i++) {
            if(video.buffered.start(video.buffered.length - 1 - i) < video.currentTime || video.buffered.start(video.buffered.length - 1 - i) <= 0) {
                percentBuffered = (video.buffered.end(video.buffered.length - 1 - i) / video.duration) * 100;
                updateSeekBarBackground();
                break;
            }
        }
    };

    let onSeekBarMouseDown = function() {
        if(!video.paused) {
            video.pause();
            seekBar.addEventListener("mouseup", togglePlayBack, { once: true });
        }
    };

    let onSeekBarKeyDown = function() {
        if(!video.paused) {
            video.pause();
            seekBar.addEventListener("keyup", togglePlayBack, { once: true });
        }
    };

    let onSeekBarInput = function() {
        video.currentTime = (seekBar.value / parseInt(seekBar.max)) * video.duration;
        updateSeekBarBackground();
    };

    let toggleQualityOptionsMenu = function() {
        if(qualityOptionsMenu.classList.contains("video-player__quality-options-menu--hidden")) {
            openQualityChangerBtn.classList.add("video-player__quality-changer-open-btn--activated");
            qualityOptionsMenu.classList.remove("video-player__quality-options-menu--transition-open");
            qualityOptionsMenu.classList.add("video-player__quality-options-menu--transition-closed");
            qualityOptionsMenu.classList.remove("video-player__quality-options-menu--hidden");
            window.addEventListener("click", autoCloseQualityOptionsMenu);
            window.addEventListener("keyup", autoCloseQualityOptionsMenu);
        } else {
            qualityOptionsMenu.addEventListener("transitionend", onQualityMenuClose, { once: true });
            qualityOptionsMenu.classList.remove("video-player__quality-options-menu--transition-closed");
            qualityOptionsMenu.classList.add("video-player__quality-options-menu--transition-open");
            qualityOptionsMenu.classList.add("video-player__quality-options-menu--hidden");
            window.removeEventListener("click", autoCloseQualityOptionsMenu);
            window.removeEventListener("keyup", autoCloseQualityOptionsMenu);
        }
    };

    let onQualityMenuClose = function() {
        if(qualityOptionsMenu.classList.contains("video-player__quality-options-menu--hidden")) {
            openQualityChangerBtn.classList.remove("video-player__quality-changer-open-btn--activated");
        }
    };

    let autoCloseQualityOptionsMenu = function(event) {
        if(!qualityChanger.contains(event.target)) toggleQualityOptionsMenu();
    };

    let changeQuality = function(quality) {
        updateQualityChanger(quality);

        playBackBtn.disabled = true;
        seekBar.disabled = true;
        video.removeEventListener("click", togglePlayBack);
        video.removeEventListener("timeupdate", updateTimeDisplay);
        video.removeEventListener("timeupdate", updateSeekBar);
        seekBar.removeEventListener("mousedown", onSeekBarMouseDown);
        seekBar.removeEventListener("keydown", onSeekBarKeyDown);
        if(window.createImageBitmap) {
            video.removeEventListener("seeked", paintCurrentFrame);
            seekBar.removeEventListener("mousedown", showScrubCanvas);
            seekBar.removeEventListener("keydown", showScrubCanvas);
        }

        video.addEventListener("canplay", onSourceSwitchCanPlay, { once: true });

        if(quality == "1080") loadSrc(src1080);
        if(quality == "480") loadSrc(src480);
    };

    let onSourceSwitchCanPlay = function() {
        video.addEventListener("seeked", onSourceSwitchSeeked, { once: true });
        video.currentTime = (seekBar.value / parseInt(seekBar.max)) * video.duration;
    };

    let onSourceSwitchSeeked = function() {
        video.addEventListener("click", togglePlayBack);
        video.addEventListener("timeupdate", updateTimeDisplay);
        video.addEventListener("timeupdate", updateSeekBar);
        seekBar.addEventListener("mousedown", onSeekBarMouseDown);
        seekBar.addEventListener("keydown", onSeekBarKeyDown);
        if(window.createImageBitmap) {
            video.addEventListener("seeked", paintCurrentFrame);
            seekBar.addEventListener("mousedown", showScrubCanvas);
            seekBar.addEventListener("keydown", showScrubCanvas);
        }
        if(playIcon.classList.contains("video-player__control-icon--hidden")) togglePlayBack();
        playBackBtn.disabled = false;
        seekBar.disabled = false;
    };

    let toggleFullscreen = function() {
        if(document.fullscreenElement == root || document.webkitFullscreenElement == root) {
            if(document.exitFullscreen) {
                document.exitFullscreen();
            } else if(document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        } else if(!document.fullscreenElement || !document.webkitFullscreenElement) {
            if (root.requestFullscreen) {
                root.requestFullscreen();
            } else if (root.webkitRequestFullscreen) {
                root.webkitRequestFullscreen();
            }
        }
    };

    let onFullscreenChange = function() {
        if(document.fullscreenElement || document.webkitFullscreenElement) {
            fsBtn.classList.remove("video-player__control-btn-fs--hidden-mobile");
            fsIcon.classList.add("video-player__control-icon--hidden");
            exitFsIcon.classList.remove("video-player__control-icon--hidden");
            video.classList.add("video-player__video--fullscreen");
        } else {
            fsBtn.classList.add("video-player__control-btn-fs--hidden-mobile");
            fsIcon.classList.remove("video-player__control-icon--hidden");
            exitFsIcon.classList.add("video-player__control-icon--hidden");
            video.classList.remove("video-player__video--fullscreen");
        }
    };

    let resizeScrubCanvas = function() {
        let height = video.getBoundingClientRect().height;
        let width = video.getBoundingClientRect().width;
        let intrinsicRatio = video.videoWidth / video.videoHeight;
        let currentRatio = width / height;
        if(currentRatio > intrinsicRatio) {
            scrubCanvas.setAttribute("height", `${height}px`);
            scrubCanvas.setAttribute("width", `${height * intrinsicRatio}px`);
        } else {
            scrubCanvas.setAttribute("width", `${width}px`);
            scrubCanvas.setAttribute("height", `${width / intrinsicRatio}px`);
        }
    };

    let startPaintInterval = function() {
        paintInterval = setInterval(paintCurrentFrame, 1000 / fps);
    };

    let endPaintInterval = function() {
        clearInterval(paintInterval);
    };

    let paintCurrentFrame = async function() {
        let frameTime = Math.round(video.currentTime  * fps) / fps;
        if(!scrubImages[frameTime]) {
            scrubContext.drawImage(video, 0, 0, scrubCanvas.width, scrubCanvas.height);
            imageData = scrubContext.getImageData(0, 0, scrubCanvas.width, scrubCanvas.height);
            imageBitmap = await createImageBitmap(imageData);
            scrubImages[frameTime] = imageBitmap;
        }
    };

    let resetScrub = function() {
        endPaintInterval();
        scrubImages = {};
    };

    let showScrubCanvas = function() {
        scrubCanvas.classList.remove("video-player__scrub-canvas--hidden");
    };

    let hideScrubCanvas = function() {
        if(video.seeking) {
            video.addEventListener("seeked", hideScrubCanvas, { once: true });
        } else {
            scrubCanvas.classList.add("video-player__scrub-canvas--hidden");
        }
    };

    let paintSeekedFrame = function() {
        let seekedTime = (seekBar.value / parseInt(seekBar.max)) * video.duration;
        let frameTime = Math.round(seekedTime  * fps) / fps;
        if(scrubImages[frameTime]) scrubContext.drawImage(scrubImages[frameTime], 0, 0, scrubCanvas.width, scrubCanvas.height);
    };

    let onVideoClickMobile = function() {
        if(video.paused) return;
        clearTimeout(hideMobileControlsTimeout);
        playBackBtnMobile.classList.remove("video-player__playback-btn-mobile--hidden-mobile");
        playBackBtnMobile.classList.add("video-player__playback-btn-mobile--show-mobile");
        controlsContainer.classList.remove("video-player__controls-container--hidden");
        controlsContainer.classList.add("video-player__controls-container--show-mobile");
        hideMobileControlsTimeout = setTimeout(hideMobileControls, 1000);
    };

    let hideMobileControls = function() {
        if(!qualityOptionsMenu.classList.contains("video-player__quality-options-menu--hidden")) return;
        playBackBtnMobile.classList.remove("video-player__playback-btn-mobile--show-mobile");
        controlsContainer.classList.remove("video-player__controls-container--show-mobile");
    };

    let forceFullscreenMobile = function() {
        if(!document.fullscreenElement || !video.webkitDisplayingFullscreen) {
            if (root.requestFullscreen) {
                root.requestFullscreen();
            } else if (video.webkitEnterFullscreen) {
                video.webkitEnterFullscreen();
            }
        }
    };

    let onPlayBackBtnMobileTransitionEnd = function() {
        if(
            playBackBtnMobile.classList.contains("video-player__playback-btn-mobile--playing") &&
            !playBackBtnMobile.classList.contains("video-player__playback-btn-mobile--show-mobile")
        ) {
            playBackBtnMobile.classList.add("video-player__playback-btn-mobile--hidden-mobile");
        }
    };

    let onControlsContainerTouchStartMobile = function() {
        clearTimeout(hideMobileControlsTimeout);
    };

    let onControlsContainerTouchEndMobile = function() {
        hideMobileControlsTimeout = setTimeout(hideMobileControls, 1000);
    };

    let onControlsContainerTransitionEndMobile = function() {
        if(
            controlsContainer.classList.contains("video-player__controls-container--playing") &&
            !controlsContainer.classList.contains("video-player__controls-container--show-mobile")
        ) {
            controlsContainer.classList.add("video-player__controls-container--hidden");
        }
    };

    let forceVideoPause = function() {
        if(!document.fullscreenElement && !video.paused) togglePlayBack();
    };

    let hide = function() {
        root.classList.add("video-player--hidden");
    };

    let show = function() {
        root.classList.remove("video-player--hidden");
    };

    video.addEventListener("loadedmetadata", initPlayer, { once: true });
    init();

    return {
        root,
        video,
        qualityOptionInputs,
        changeQuality,
        resizeScrubCanvas,
        togglePlayBack,
        hide,
        show
    }

}