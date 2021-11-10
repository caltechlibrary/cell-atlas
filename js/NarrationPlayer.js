let NarrationPlayer = function(root) {

    let playbackBtn = root.querySelector(".narration-player__playback-btn");
    let seekBar = root.querySelector(".narration-player__seekbar");
    let currentTimeDisplay = root.querySelector(".narration-player__current-time-display");
    let totalTimeDisplay = root.querySelector(".narration-player__total-time-display");
    let audio = root.querySelector(".narration-player__audio-el");
    let initialized = false;

    let init = function() {
        let audioSrcEl = audio.querySelector("source");
        audio.addEventListener("loadedmetadata", onLoadedmetadata, { once: true });
        audioSrcEl.setAttribute("src", root.getAttribute("data-src"));
        audio.load();
        this.initialized = true;
    };

    let onLoadedmetadata = function() {
        seekBar.setAttribute("max", Math.round(audio.duration));
        setSeekbarValue();
        setTimeDisplay();
        playbackBtn.disabled = false;
        seekBar.disabled = false;
        attachEventListeners();
    };

    let attachEventListeners = function() {
        audio.addEventListener("play", onPlaybackChange);
        audio.addEventListener("pause", onPlaybackChange);
        audio.addEventListener("timeupdate", setSeekbarValue);
        audio.addEventListener("timeupdate", setTimeDisplay);
        playbackBtn.addEventListener("click", togglePlayback);
        seekBar.addEventListener("mousedown", onSeekbarMousedown);
        seekBar.addEventListener("keydown", onSeekbarKeydown);
        seekBar.addEventListener("input", onSeekbarInput);
    };

    let setSeekbarValue = function() {
        seekBar.value = audio.currentTime;
        seekBar.setAttribute("aria-label", `audio time scrubber ${getFormattedTime(audio.currentTime)} / ${getFormattedTime(audio.duration)}`);
        seekBar.setAttribute("aria-valuetext", `elapsed time: ${getFormattedTime(audio.currentTime)}`);
    };

    let setTimeDisplay = function() {
        let currentTime = getFormattedTime(audio.currentTime);
        let currentTimeTextNode = document.createTextNode(`${currentTime} `);
        if(currentTimeDisplay.firstChild) currentTimeDisplay.removeChild(currentTimeDisplay.firstChild);
        currentTimeDisplay.appendChild(currentTimeTextNode);
        currentTimeDisplay.setAttribute("aria-label", `elapsed time: ${currentTime}`);

        let totalTime = getFormattedTime(audio.duration);
        let totalTimeTextNode = document.createTextNode(`/ ${totalTime}`);
        if(totalTimeDisplay.firstChild) totalTimeDisplay.removeChild(totalTimeDisplay.firstChild);
        totalTimeDisplay.appendChild(totalTimeTextNode);
        totalTimeDisplay.setAttribute("aria-label", `total time: ${totalTime}`);
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
        } else {
            audio.pause();
        }
    };

    let onSeekbarMousedown = function() {
        if(!audio.paused) {
            audio.pause();
            seekBar.addEventListener("mouseup", togglePlayback, { once: true });
        }
    };

    let onSeekbarKeydown = function(event) {
        if( (event.code == "ArrowLeft" || event.code == "ArrowUp" || event.code == "ArrowDown" || event.code == "ArrowLeft") && !audio.paused ) {
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