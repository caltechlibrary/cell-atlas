let VideoPlayer = function(root) {
    
    let video = root.querySelector(".video-player__video");
    let videoSrc = video.querySelector("source");
    let doi = root.getAttribute("data-doi");
    let vidName = root.getAttribute("data-vid-name");
    let controlsContainer = root.querySelector(".video-player__controls-container");
    let playBackBtn = root.querySelector(".video-player__control-btn-playback");
    let playBackBtnMobile = root.querySelector(".video-player__playback-btn-mobile");
    let timeDisplay = root.querySelector(".video-player__time-display");
    let qualityChanger = root.querySelector(".video-player__quality-changer");
    let openQualityChangerBtn = root.querySelector(".video-player__quality-changer-open-btn");
    let openQualityChangerBtnText = root.querySelector(".video-player__quality-changer-open-btn-text");
    let qualityOptionsMenu = root.querySelector(".video-player__quality-options-menu");
    let qualityOptionInputs = root.querySelectorAll(".video-player__quality-option-input");
    let fsBtn = root.querySelector(".video-player__control-btn-fs");
    let seekBar = root.querySelector(".video-player__seek-bar");
    let scrubToggle = root.querySelector(".video-player__scrub-toggle-checkbox");
    let scrubCanvas = root.querySelector(".video-player__scrub-canvas");
    let src1080, src480, formattedDuration, hideMobileControlsTimeout, percentBuffered = 0, frames = [], fps = 30;

    let init = function() {
        if(root.getAttribute("data-offline")) {
            loadSrc(`videos/${vidName}.mp4`);
        } else {
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
        seekBar.max = Math.round(video.duration * fps);
        updateTimeDisplay();
        checkWebpSupport();
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
        scrubToggle.addEventListener("change", onScrubToggle);
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
            controlsContainer.addEventListener("touchstart", onControlsContainerTouchStartMobile);
            controlsContainer.addEventListener("touchend", onControlsContainerTouchEndMobile);
            root.addEventListener("fullscreenchange", onMobileFullscreenchange);
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
        root.classList.add("video-player--playing");
        hideMobileControls();
    };

    let onPause = function() {
        root.classList.remove("video-player--playing");
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

    let onSeekBarKeyDown = function(event) {
        if((event.key == "ArrowUp" || event.key == "ArrowRight" || event.key == "ArrowDown" || event.key == "ArrowLeft") && !video.paused) {
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
        playBackBtnMobile.disabled = true;
        seekBar.disabled = true;
        if(window.innerWidth > 900) video.removeEventListener("click", togglePlayBack);
        video.removeEventListener("timeupdate", updateTimeDisplay);
        video.removeEventListener("timeupdate", updateSeekBar);
        seekBar.removeEventListener("mousedown", onSeekBarMouseDown);
        seekBar.removeEventListener("keydown", onSeekBarKeyDown);

        video.addEventListener("canplay", onSourceSwitchCanPlay, { once: true });

        if(quality == "1080") loadSrc(src1080);
        if(quality == "480") loadSrc(src480);
    };

    let onSourceSwitchCanPlay = function() {
        video.addEventListener("seeked", onSourceSwitchSeeked, { once: true });
        video.currentTime = (seekBar.value / parseInt(seekBar.max)) * video.duration;
    };

    let onSourceSwitchSeeked = function() {
        if(window.innerWidth > 900) video.addEventListener("click", togglePlayBack);
        video.addEventListener("timeupdate", updateTimeDisplay);
        video.addEventListener("timeupdate", updateSeekBar);
        seekBar.addEventListener("mousedown", onSeekBarMouseDown);
        seekBar.addEventListener("keydown", onSeekBarKeyDown);
        if(root.classList.contains("video-player--playing")) togglePlayBack();
        playBackBtn.disabled = false;
        playBackBtnMobile.disabled = false;
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
            root.classList.add("video-player--fullscreen");
        } else {
            root.classList.remove("video-player--fullscreen");
        }
    };

    let onVideoClickMobile = function() {
        if(video.paused) return;
        clearTimeout(hideMobileControlsTimeout);
        playBackBtnMobile.classList.add("video-player__playback-btn-mobile--show");
        controlsContainer.classList.add("video-player__controls-container--show");
        hideMobileControlsTimeout = setTimeout(hideMobileControls, 1000);
    };

    let hideMobileControls = function() {
        if(!qualityOptionsMenu.classList.contains("video-player__quality-options-menu--hidden")) return;
        playBackBtnMobile.classList.remove("video-player__playback-btn-mobile--show");
        controlsContainer.classList.remove("video-player__controls-container--show");
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

    let onControlsContainerTouchStartMobile = function() {
        clearTimeout(hideMobileControlsTimeout);
    };

    let onControlsContainerTouchEndMobile = function() {
        hideMobileControlsTimeout = setTimeout(hideMobileControls, 1000);
    };

    let onMobileFullscreenchange = function() {
        if(document.fullscreenElement) {
            screen.orientation.lock("landscape");
        } else {
            if(!video.paused) togglePlayBack();
            screen.orientation.unlock();
        }
    };

    let hide = function() {
        root.classList.add("video-player--hidden");
    };

    let show = function() {
        root.classList.remove("video-player--hidden");
    };

    // Experimental Scrub related functions
    let onScrubToggle = function() {
        if(scrubToggle.checked) {
            initScrub();
        } else {
            removeScrub();
        }
    };

    let initScrub = function() {
        // Preload images if we have not already
        if(frames.length == 0) preloadImages();

        // Disable buttons and methods that control video playback
        playBackBtn.disabled = true;
        openQualityChangerBtn.disabled = true;
        video.removeEventListener("click", togglePlayBack);

        // Pause video to go into scrub mode
        video.pause();

        // Add scrub related stylings to controls
        controlsContainer.classList.add("video-player__controls-container--scrubbing");

        // Initialize scrub functionality
        seekBar.addEventListener("input", paintFrameAtCurrValue);
    };

    let removeScrub = function() {
        // Enable buttons and methods that control video playback
        playBackBtn.disabled = false;
        openQualityChangerBtn.disabled = false;
        video.addEventListener("click", togglePlayBack);

        // Remove scrub related stylings to controls
        controlsContainer.classList.remove("video-player__controls-container--scrubbing");

        // Show video before removing scrub canvas
        video.classList.remove("video-player__video--hidden");

        // Remove scrub functionality
        seekBar.removeEventListener("input", paintFrameAtCurrValue);
        scrubCanvas.classList.add("video-player__scrub-canvas--hidden");
    };

    let preloadImages = function() {
        for(let i = 0; i < seekBar.max; i++) {
            frames[i] = new Image();
            frames[i].src = `https://www.cellstructureatlas.org/scrubbing/${vidName}_frame${i}.webp`;
        }
    };

    let paintFrameAtCurrValue = function() {
        if(frames.length > 0 && frames[seekBar.value] && frames[seekBar.value].complete) {
            // Hide video and show scrub canvas if we haven't already
            scrubCanvas.classList.remove("video-player__scrub-canvas--hidden");
            video.classList.add("video-player__video--hidden");

            scrubCanvas.src = frames[seekBar.value].src;
        }
    }

    let checkWebpSupport = function() {
        let webpFeatures = ["lossy", "lossless", "alpha", "animation"];

        let featureTestCallback = function(feature, result) {
            if(!result) return;
            if (webpFeatures.indexOf(feature) == webpFeatures.length - 1) {
                scrubToggle.disabled = false;
            } else {
                check_webp_feature(webpFeatures[webpFeatures.indexOf(feature) + 1], featureTestCallback);
            }
        };

        check_webp_feature(webpFeatures[0], featureTestCallback);
    };

    // check_webp_feature:
    //   'feature' can be one of 'lossy', 'lossless', 'alpha' or 'animation'.
    //   'callback(feature, result)' will be passed back the detection result (in an asynchronous way!)
    //   taken from https://developers.google.com/speed/webp/faq#in_your_own_javascript 
    function check_webp_feature(feature, callback) {
        var kTestImages = {
            lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
            lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
            alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",
            animation: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
        };
        var img = new Image();
        img.onload = function () {
            var result = (img.width > 0) && (img.height > 0);
            callback(feature, result);
        };
        img.onerror = function () {
            callback(feature, false);
        };
        img.src = "data:image/webp;base64," + kTestImages[feature];
    }

    video.addEventListener("loadedmetadata", initPlayer, { once: true });
    init();

    return {
        root,
        video,
        qualityOptionInputs,
        changeQuality,
        togglePlayBack,
        hide,
        show
    }

}