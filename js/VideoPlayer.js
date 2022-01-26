let VideoPlayer = function(root) {
    
    let video = root.querySelector(".video-player__video");
    let videoSrc = video.querySelector("source");
    let doi = root.getAttribute("data-doi");
    let vidName = root.getAttribute("data-vid-name");
    let playBackBtn = root.querySelector(".video-player__control-btn-playback");
    let playBackBtnMobile = root.querySelector(".video-player__playback-btn-mobile");
    let timeDisplay = root.querySelector(".video-player__time-display");
    let qualityChanger = root.querySelector(".video-player__quality-changer");
    let openQualityChangerBtn = root.querySelector(".video-player__quality-changer-open-btn");
    let openQualityChangerBtnText = root.querySelector(".video-player__quality-changer-open-btn-text");
    let qualityOptionInputs = root.querySelectorAll(".video-player__quality-option-input");
    let fsBtn = root.querySelector(".video-player__control-btn-fs");
    let seekBar = root.querySelector(".video-player__seek-bar");
    let src1080, src480, hideMobileControlsTimeout, percentBuffered = 0, wasPlaying = false;

    let init = async function() {
        // Set default quality based on session storage variable
        let vidQuality = (window.sessionStorage.getItem("vidQuality") == "480") ? "480" : "1080";

        // Set variables for 1080/480 src
        if(doi) { // If doi, generate source strings from that
            let res = await fetch(`https://api.datacite.org/dois/${doi}/media`);
            let data = await res.json();
            src1080 = data.data[0].attributes.url;
            src480 = `${src1080.substring(0, src1080.indexOf(".mp4"))}_480p.mp4`;
        } else { // If no doi, fallback to vidName variable which is set by build script
            src1080 = `https://www.cellstructureatlas.org/videos/${vidName}.mp4`;
            src480 = `https://www.cellstructureatlas.org/videos/${vidName}_480p.mp4`;
        }

        // Add event listener to init player functionality when source is loaded
        video.addEventListener("loadedmetadata", initPlayer, { once: true });

        // Load source in video element
        loadSrc((vidQuality == "480") ? src480 : src1080);

        // Update quality changer text
        updateQualityChanger(vidQuality);
    };

    let loadSrc = function(source) {
        videoSrc.setAttribute("src", source);
        video.load();
    }

    let initPlayer = function() {
        // Update time display now that we have video metadata
        updateTimeDisplay();

        // Attach all player event listeners
        root.addEventListener("fullscreenchange", onFullscreenChange);
        root.addEventListener("webkitfullscreenchange", onFullscreenChange);
        video.addEventListener("play", onPlay);
        video.addEventListener("pause", onPause);
        video.addEventListener("timeupdate", updateTimeDisplay);
        video.addEventListener("timeupdate", updateSeekBar);
        video.addEventListener("progress", updatePercentBuffered);
        playBackBtn.addEventListener("click", togglePlayBack);
        openQualityChangerBtn.addEventListener("click", toggleQualityOptionsMenu);
        fsBtn.addEventListener("click", toggleFullscreen);
        seekBar.addEventListener("mousedown", onSeekBarMouseDown);
        seekBar.addEventListener("keydown", onSeekBarKeyDown);
        seekBar.addEventListener("input", onSeekBarInput);
        if(window.innerWidth > 900) {
            video.addEventListener("click", togglePlayBack);
        } else {
            root.addEventListener("fullscreenchange", onMobileFullscreenchange);
            root.addEventListener("touchstart", onMobileTouchstart);
            root.addEventListener("touchend", onMobileTouchend);
            video.addEventListener("play", forceFullscreenMobile);
            playBackBtnMobile.addEventListener("click", togglePlayBack);
        }
    };

    let onPlay = function() {
        root.classList.add("video-player--playing");
    };

    let onPause = function() {
        root.classList.remove("video-player--playing");
    };

    let updateTimeDisplay = function() {
        timeDisplay.textContent = `${getFormattedTime(video.currentTime)} / ${getFormattedTime(video.duration)}`;
    };

    let getFormattedTime = function(timeSeconds) {
        let minutesFormatted = (timeSeconds >= 60) ? Math.floor(timeSeconds / 60) : 0;
        let secondsFormatted = Math.round(timeSeconds) - (minutesFormatted * 60);
        if(secondsFormatted < 10) secondsFormatted = `0${secondsFormatted}`;
        return `${minutesFormatted}:${secondsFormatted}`;
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

    let togglePlayBack = function() {
        if (video.paused || video.ended) {
            video.play();
        } else {
            video.pause();
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
        if(qualityChanger.classList.contains("video-player__quality-changer--closed")) {
            qualityChanger.classList.remove("video-player__quality-changer--closed");
            window.addEventListener("click", autoCloseQualityOptionsMenu);
            window.addEventListener("keyup", autoCloseQualityOptionsMenu);
        } else {
            qualityChanger.classList.add("video-player__quality-changer--closed");
            window.removeEventListener("click", autoCloseQualityOptionsMenu);
            window.removeEventListener("keyup", autoCloseQualityOptionsMenu);
        }
    };

    let autoCloseQualityOptionsMenu = function(event) {
        if(!qualityChanger.contains(event.target)) toggleQualityOptionsMenu();
    };

    let changeQuality = function(quality) {
        // Store video playstate to use after source switching
        wasPlaying = !video.paused;

        // Update quality changer to reflect new quality
        updateQualityChanger(quality);

        // Disable player functionality that would be problematic during quality switching
        playBackBtn.disabled = true;
        playBackBtnMobile.disabled = true;
        seekBar.disabled = true;
        if(window.innerWidth > 900) video.removeEventListener("click", togglePlayBack);
        video.removeEventListener("timeupdate", updateTimeDisplay);
        video.removeEventListener("timeupdate", updateSeekBar);
        seekBar.removeEventListener("mousedown", onSeekBarMouseDown);
        seekBar.removeEventListener("keydown", onSeekBarKeyDown);

        // Add event listener to resume player functionality after switching sources
        video.addEventListener("loadedmetadata", onSourceSwitchLoadedmetadata, { once: true });

        loadSrc(quality == "1080" ? src1080 : src480);
    };

    let updateQualityChanger = function(quality) {
        let qualityInput = root.querySelector(`.video-player__quality-option-input[value='${quality}']`);
        qualityInput.checked = true;
        openQualityChangerBtnText.textContent = `${quality}p`;
    };

    let onSourceSwitchLoadedmetadata = function() {
        // Set video currentTime to whatever the seekbar is at
        video.currentTime = (seekBar.value / parseInt(seekBar.max)) * video.duration;

        // Enable player functionality that was disabled before
        playBackBtn.disabled = false;
        playBackBtnMobile.disabled = false;
        seekBar.disabled = false;
        if(window.innerWidth > 900) video.addEventListener("click", togglePlayBack);
        video.addEventListener("timeupdate", updateTimeDisplay);
        video.addEventListener("timeupdate", updateSeekBar);
        seekBar.addEventListener("mousedown", onSeekBarMouseDown);
        seekBar.addEventListener("keydown", onSeekBarKeyDown);

        // Resume video if it was playing before
        if(wasPlaying) togglePlayBack();
    };

    let toggleFullscreen = function() {
        if (document.fullscreenElement == root || document.webkitFullscreenElement == root) {
            if (document.exitFullscreen) document.exitFullscreen(); 
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        } else if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            if (root.requestFullscreen) root.requestFullscreen(); 
            else if (root.webkitRequestFullscreen) root.webkitRequestFullscreen();
        }
    };

    let onFullscreenChange = function() {
        if (document.fullscreenElement || document.webkitFullscreenElement) root.classList.add("video-player--fullscreen");
        else root.classList.remove("video-player--fullscreen");
    };

    let onMobileTouchstart = function() {
        clearTimeout(hideMobileControlsTimeout);
        root.classList.add("video-player--show-controls");
    };

    let onMobileTouchend = function() {
        hideMobileControlsTimeout = setTimeout(hideMobileControls, 1000);
    };

    let hideMobileControls = function() {
        if(qualityChanger.classList.contains("video-player__quality-changer--closed")) root.classList.remove("video-player--show-controls");
    };

    let forceFullscreenMobile = function() {
        if (root.requestFullscreen) root.requestFullscreen();
        else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
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