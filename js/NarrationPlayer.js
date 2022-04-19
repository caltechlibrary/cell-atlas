let NarrationPlayer = function(root, onPlayCallback = function(){}, onPauseCallback = function(){}) {

    let playbackBtn = root.querySelector(".narration-player__playback-btn");
    let seekBar = root.querySelector(".narration-player__seekbar");
    let currentTimeDisplay = root.querySelector(".narration-player__current-time-display");
    let totalTimeDisplay = root.querySelector(".narration-player__total-time-display");
    let audio = root.querySelector(".narration-player__audio-el");
    let offline = root.getAttribute("data-offline");
    let initialized = false;
    let totalTime;

    let init = function() {
        let audioSrcEl = audio.querySelector("source");
        audio.addEventListener("loadedmetadata", onLoadedmetadata, { once: true });
        if(offline) {
            audioSrcEl.setAttribute("src", `audio/${root.getAttribute("data-src")}`);
        } else {
            audioSrcEl.setAttribute("src", `https://www.cellstructureatlas.org/audio/${root.getAttribute("data-src")}`);
        }
        audio.load();
        this.initialized = true;
    };

    let onLoadedmetadata = function() {
        seekBar.setAttribute("max", Math.round(audio.duration));
        totalTime = getFormattedTime(audio.duration);
        totalTimeDisplay.replaceChild(document.createTextNode(`/ ${totalTime}`), totalTimeDisplay.firstChild);
        totalTimeDisplay.setAttribute("aria-label", `total time: ${totalTime}`);
        updateCurrentTime();
        attachEventListeners();
        playbackBtn.disabled = false;
        seekBar.disabled = false;
    };

    let attachEventListeners = function() {
        audio.addEventListener("play", onPlaybackChange);
        audio.addEventListener("pause", onPlaybackChange);
        audio.addEventListener("timeupdate", updateCurrentTime);
        playbackBtn.addEventListener("click", togglePlayback);
        seekBar.addEventListener("pointerdown", onSeekbarPointerDown);
        seekBar.addEventListener("keydown", onSeekbarKeydown);
        seekBar.addEventListener("input", onSeekbarInput);
    };

    let updateCurrentTime = function() {
        let currentTime = getFormattedTime(audio.currentTime);
        currentTimeDisplay.replaceChild(document.createTextNode(`${currentTime} `), currentTimeDisplay.firstChild);
        currentTimeDisplay.setAttribute("aria-label", `elapsed time: ${currentTime}`);
        seekBar.value = audio.currentTime;
        seekBar.setAttribute("aria-label", `audio time scrubber ${currentTime} / ${totalTime}`);
        seekBar.setAttribute("aria-valuetext", `elapsed time: ${currentTime}`);
    };

    let getFormattedTime = function(seconds) {
        let minutesFormatted = Math.floor(seconds / 60);
        let secondsFormatted = Math.floor(seconds % 60);
        if(secondsFormatted < 10) secondsFormatted = `0${secondsFormatted}`;
        return `${minutesFormatted}:${secondsFormatted}`;
    };

    let onPlaybackChange = function() {
        let playIcon = root.querySelector(".narration-player__playback-btn-play-icon");
        let pauseIcon = root.querySelector(".narration-player__playback-btn-pause-icon");
        if(audio.paused) {
            playbackBtn.setAttribute("aria-label", "Play");
            playIcon.classList.remove("narration-player__playback-btn-icon--hidden");
            pauseIcon.classList.add("narration-player__playback-btn-icon--hidden");
        } else {
            playbackBtn.setAttribute("aria-label", "Pause");
            playIcon.classList.add("narration-player__playback-btn-icon--hidden");
            pauseIcon.classList.remove("narration-player__playback-btn-icon--hidden");
        }
    };

    let togglePlayback = function() {
        if(audio.paused) {
            audio.play();
            onPlayCallback();
        } else {
            audio.pause();
            onPauseCallback();
        }
    };

    let onSeekbarPointerDown = function() {
        if(!audio.paused) {
            audio.pause();
            seekBar.addEventListener("pointerup", togglePlayback, { once: true });
        }
    };

    let onSeekbarKeydown = function(event) {
        if( (event.code == "ArrowRight" || event.code == "ArrowUp" || event.code == "ArrowDown" || event.code == "ArrowLeft") && !audio.paused ) {
            audio.pause();
            seekBar.addEventListener("keyup", togglePlayback, { once: true });
        }
    };

    let onSeekbarInput = function() {
        audio.currentTime = seekBar.value;
    };

    return {
        root,
        audio,
        initialized,
        init,
        togglePlayback,
    }

};