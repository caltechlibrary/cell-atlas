/**
 * Creates a narration player widget and returns narration player
 * object.
 *
 * @param root The dom element being registered as a narration player.
 * @param onPlayCallback Callback fired when narration player is played.
 * @param onPauseCallback Callback fired when narration player is paused.
 */
let NarrationPlayer = function(root, onPlayCallback = function(){}, onPauseCallback = function(){}) {

    // Create frequently used variables and references to frequently used dom elements.
    let playbackBtn = root.querySelector(".narration-player__playback-btn");
    let seekBar = root.querySelector(".narration-player__seekbar");
    let currentTimeDisplay = root.querySelector(".narration-player__current-time-display");
    let totalTimeDisplay = root.querySelector(".narration-player__total-time-display");
    let audio = root.querySelector(".narration-player__audio-el");
    let offline = root.getAttribute("data-offline");
    let initialized = false;
    let totalTime;

    /**
     * Initialize narration player by setting audio source. Not called
     * in NarrationPlayer but instead returned as public method to give 
     * control of when source audio is loaded.
     */
    let init = function() {
        let audioSrcEl = audio.querySelector("source");

        // Add event listener to initialize player functionality once source is loaded.
        audio.addEventListener("loadedmetadata", onLoadedmetadata, { once: true });

        // Set correct source to load based on online/offline version.
        if(offline) {
            audioSrcEl.setAttribute("src", `audio/${root.getAttribute("data-src")}`);
        } else {
            audioSrcEl.setAttribute("src", `https://www.cellstructureatlas.org/audio/${root.getAttribute("data-src")}`);
        }

        audio.load();
        this.initialized = true;
    };

    /**
     * Initialize narration player functionality. Called in init()
     * when audio source metadata is loaded.
     */
    let onLoadedmetadata = function() {
        seekBar.setAttribute("max", Math.round(audio.duration));

        // Update total time display element
        totalTime = getFormattedTime(audio.duration);
        totalTimeDisplay.replaceChild(document.createTextNode(`/ ${totalTime}`), totalTimeDisplay.firstChild);
        totalTimeDisplay.setAttribute("aria-label", `total time: ${totalTime}`);

        updateCurrentTime();
        attachEventListeners();

        // Enable narration player controls since correct functionality is added.
        playbackBtn.disabled = false;
        seekBar.disabled = false;
    };

    /**
     * Add event listners used to facilitate narration player 
     * functionality. Called in onLoadedmetadata() while functionality
     * is being setup.
     */
    let attachEventListeners = function() {
        audio.addEventListener("play", onPlaybackChange);
        audio.addEventListener("pause", onPlaybackChange);
        audio.addEventListener("timeupdate", updateCurrentTime);
        playbackBtn.addEventListener("click", togglePlayback);

        // Using pointerdown for seekbar operations is problematic on Chrome
        // Android. Refer to onSeekbarPointerDown comments for more.
        seekBar.addEventListener("pointerdown", onSeekbarPointerDown);

        seekBar.addEventListener("keydown", onSeekbarKeydown);
        seekBar.addEventListener("input", onSeekbarInput);
    };

    /**
     * Update current time/seek bar dom elem based on current time of audio 
     * dom elem. Fired on audio elem timeupdate event added in attachEventListeners() 
     * and called when source metadata is loaded in onLoadedmetadata().
     */
    let updateCurrentTime = function() {
        let currentTime = getFormattedTime(audio.currentTime);
        currentTimeDisplay.replaceChild(document.createTextNode(`${currentTime} `), currentTimeDisplay.firstChild);
        currentTimeDisplay.setAttribute("aria-label", `elapsed time: ${currentTime}`);
        seekBar.value = audio.currentTime;
        seekBar.setAttribute("aria-label", `audio time scrubber ${currentTime} / ${totalTime}`);
        seekBar.setAttribute("aria-valuetext", `elapsed time: ${currentTime}`);
    };

    /**
     * Helper function to convert seconds into time familiar minute/second 
     * format MM:SS. Returns formated time string.
     *
     * @param seconds Number of seconds.
     */
    let getFormattedTime = function(seconds) {
        let minutesFormatted = Math.floor(seconds / 60);
        let secondsFormatted = Math.floor(seconds % 60);
        if(secondsFormatted < 10) secondsFormatted = `0${secondsFormatted}`;
        return `${minutesFormatted}:${secondsFormatted}`;
    };

    /**
     * Update playback button attributes root styles based on playback
     * state. Fired on audio elem play/pause event added in attachEventListeners().
     */
    let onPlaybackChange = function() {
        if(audio.paused) {
            playbackBtn.setAttribute("aria-label", "Play");
            root.classList.remove("narration-player--playing");
        } else {
            playbackBtn.setAttribute("aria-label", "Pause");
            root.classList.add("narration-player--playing");
        }
    };

    /**
     * Toggle audio elem playback and call correct onPlayCallback/onPauseCallback 
     * funcitons. Fired on playback btn click event added in attachEventListeners(), 
     * used as a helper function, and returned as a public method of player.
     */
    let togglePlayback = function() {
        if(audio.paused) {
            audio.play();
            onPlayCallback();
        } else {
            audio.pause();
            onPauseCallback();
        }
    };

    /**
     * Pause and set up automatic playback when pointer is used for seek. 
     * Fired on seekbar pointerdown event added in attachEventListeners().
     * 
     * Known bug: It appears that pointerup does not fired on Chrome Android
     * when the pointer is moved before the pointerup event. This results in
     * audio not resuming on seek and possibly stacking an unknown amount
     * of event listners on pointerup.
     */
    let onSeekbarPointerDown = function() {
        // Set up automatic playback only audio is already playing on seek
        if(!audio.paused) {
            audio.pause();
            seekBar.addEventListener("pointerup", togglePlayback, { once: true });
        }
    };

    /**
     * Pause and set up automatic playback when keyboard is used to seek. 
     * Fired on seekbar keydown event added in attachEventListeners().
     */
    let onSeekbarKeydown = function(event) {
        // Set up automatic playback only if key is correct and audio is already playing on seek
        if( (event.code == "ArrowRight" || event.code == "ArrowUp" || event.code == "ArrowDown" || event.code == "ArrowLeft") && !audio.paused ) {
            audio.pause();
            seekBar.addEventListener("keyup", togglePlayback, { once: true });
        }
    };

    /**
     * Update audio current time when seekbar input is changed. Fired
     * on seekbar input event added in attachEventListeners().
     */
    let onSeekbarInput = function() {
        audio.currentTime = seekBar.value;
    };

    /**
     * Return public properties/methods. Not all are used and can be removed.
     */
    return {
        root,
        audio,
        initialized,
        init,
        togglePlayback,
    }

};