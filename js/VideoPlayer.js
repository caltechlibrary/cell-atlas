let VideoPlayer = function(root) {
    
    let video = root.querySelector(".video-player__video");
    let videoSrc = video.querySelector("source");
    let doi = root.getAttribute("data-doi");
    let vidFile = root.getAttribute("data-vid-file");
    let controlsContainer = root.querySelector(".video-player__controls-container");
    let playBackBtn = root.querySelector(".video-player__control-btn-playback");
    let playIcon = root.querySelector(".video-player__control-icon-play");
    let pauseIcon = root.querySelector(".video-player__control-icon-pause");
    let timeDisplay = root.querySelector(".video-player__time-display");
    let openQualityChangerBtn = root.querySelector(".video-player__quality-changer-open-btn");
    let qualityOptionsMenu = root.querySelector(".video-player__quality-options-menu");
    let fsBtn = root.querySelector(".video-player__control-btn-fs");
    let fsIcon = root.querySelector(".video-player__control-icon-fs");
    let exitFsIcon = root.querySelector(".video-player__control-icon-exit-fs");
    let seekBar = root.querySelector(".video-player__seek-bar");
    let scrubCanvas = root.querySelector(".video-player__scrub-canvas");
    let scrubContext = scrubCanvas.getContext("2d");
    let paintInterval, formattedDuration, percentBuffered = 0, fps = 10, scrubImages = {};

    let init = function() {
        if(doi) {
            fetch(`https://api.datacite.org/dois/${doi}/media`)
                .then(res => res.json())
                .then(function(data){ loadSrc(data.data[0].attributes.url) });
        } else {
            loadSrc(`https://www.cellstructureatlas.org/videos/${vidFile}`);
        }
    };

    let loadSrc = function(source) {
        videoSrc.setAttribute("src", source);
        video.load();
    }

    let onLoadedMetadata = function() {
        formattedDuration = getFormattedTime(video.duration);
        updateTimeDisplay();
        if(window.createImageBitmap) resizeScrubCanvas();
        attachEventListeners();
    };

    let attachEventListeners = function() {
        controlsContainer.addEventListener("focusin", onControlsContainerFocusIn);
        controlsContainer.addEventListener("focusout", onControlsContainerFocusOut);
        playBackBtn.addEventListener("click", togglePlayBack);
        video.addEventListener("click", togglePlayBack);
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
        if(window.createImageBitmap) {
            window.addEventListener("resize", resizeScrubCanvas);
            video.addEventListener("playing", startPaintInterval);
            video.addEventListener("pause", endPaintInterval);
            video.addEventListener("seeked", paintCurrentFrame);
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

    let onControlsContainerFocusIn = function() {
        controlsContainer.classList.add("video-player__controls-container--has-focus");
    };

    let onControlsContainerFocusOut = function() {
        controlsContainer.classList.remove("video-player__controls-container--has-focus");
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
        pauseIcon.classList.remove("video-player__control-icon--hidden");
        controlsContainer.classList.add("video-player__controls-container--playing");
    };

    let onPause = function() {
        playIcon.classList.remove("video-player__control-icon--hidden");
        pauseIcon.classList.add("video-player__control-icon--hidden");
        controlsContainer.classList.remove("video-player__controls-container--playing");
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
        } else {
            openQualityChangerBtn.classList.remove("video-player__quality-changer-open-btn--activated");
            qualityOptionsMenu.classList.remove("video-player__quality-options-menu--transition-closed");
            qualityOptionsMenu.classList.add("video-player__quality-options-menu--transition-open");
            qualityOptionsMenu.classList.add("video-player__quality-options-menu--hidden");
        }
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
            fsIcon.classList.add("video-player__control-icon--hidden");
            exitFsIcon.classList.remove("video-player__control-icon--hidden");
        } else {
            fsIcon.classList.remove("video-player__control-icon--hidden");
            exitFsIcon.classList.add("video-player__control-icon--hidden");
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

    let paintCurrentFrame = async function() {
        let frameTime = Math.round(video.currentTime  * fps) / fps;
        if(!scrubImages[frameTime]) {
            scrubContext.drawImage(video, 0, 0, scrubCanvas.width, scrubCanvas.height);
            imageData = scrubContext.getImageData(0, 0, scrubCanvas.width, scrubCanvas.height);
            imageBitmap = await createImageBitmap(imageData);
            scrubImages[frameTime] = imageBitmap;
        }
    };

    let endPaintInterval = function() {
        clearInterval(paintInterval);
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

    video.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
    init();

}