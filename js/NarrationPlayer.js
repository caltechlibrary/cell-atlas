let NarrationPlayer = function(root) {

    let playbackBtn = root.querySelector(".narration-player__playback-btn");
    let seekBar = root.querySelector(".narration-player__seekbar");
    let timeDisplay = root.querySelector(".narration-player__time-display");
    let audio = root.querySelector(".narration-player__audio-el");

    let init = function() {
        seekBar.setAttribute("max", Math.round(audio.duration));
        setTimeDisplay();
    };

    let setTimeDisplay = function() {
        let timeTextNode = document.createTextNode(`${getFormattedTime(audio.currentTime)} / ${getFormattedTime(audio.duration)}`);
        if(timeDisplay.firstChild) timeDisplay.removeChild(timeDisplay.firstChild);
        timeDisplay.appendChild(timeTextNode);
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
            playIcon.classList.remove("narration-player__playback-btn-icon--hidden");
            pauseIcon.classList.add("narration-player__playback-btn-icon--hidden");
        } else {
            playIcon.classList.add("narration-player__playback-btn-icon--hidden");
            pauseIcon.classList.remove("narration-player__playback-btn-icon--hidden");
        }
    };

    let onTimeUpdate = function() {
        seekBar.value = audio.currentTime;
        setTimeDisplay();
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

    audio.addEventListener("play", onPlaybackChange);
    audio.addEventListener("pause", onPlaybackChange);
    audio.addEventListener("timeupdate", onTimeUpdate);
    playbackBtn.addEventListener("click", togglePlayback);
    seekBar.addEventListener("mousedown", onSeekbarMousedown);
    seekBar.addEventListener("keydown", onSeekbarKeydown);
    seekBar.addEventListener("input", onSeekbarInput);

    if(audio.readyState > 0) {
        init();
    } else {
        audio.addEventListener("loadedmetadata", init);
    }

    return {
        root
    }

};