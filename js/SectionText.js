let SectionText = function(root, shelveCallback = function(){}, unshelveCallback = function(){}, narrationPlayer) {

    let shelveBtn = root.querySelector(".section-text .section-text__shelve-btn");
    let unshelveBtn = root.querySelector(".section-text__unshelve-btn");
    let stopNarrationBtn = root.querySelector(".section-text__stop-narration-btn");
    let narrationToggleBtn = root.querySelector(".section-text__toggle-narration-btn");

    let shelveText = function() {
        shelveCallback();
    };

    let unshelveText = function() {
        unshelveCallback();
    };

    let toggleNarrationPlayer = function() {
        if(narrationPlayer.root.classList.contains("narration-player--hidden")) {
            if(!narrationPlayer.initialized) narrationPlayer.init();
            narrationPlayer.root.classList.remove("narration-player--hidden");
            narrationToggleBtn.classList.add("section-text__toggle-narration-btn--activated");
            narrationToggleBtn.setAttribute("aria-expanded", "true");
        } else {
            narrationPlayer.root.classList.add("narration-player--hidden");
            narrationToggleBtn.classList.remove("section-text__toggle-narration-btn--activated");
            narrationToggleBtn.setAttribute("aria-expanded", "false");
            if(!narrationPlayer.audio.paused) narrationPlayer.togglePlayback();
        }
    };

    let showStopNarrationBtn = function() {
        stopNarrationBtn.classList.remove("section-text__stop-narration-btn--hidden");
    };

    let hideStopNarrationBtn = function() {
        stopNarrationBtn.classList.add("section-text__stop-narration-btn--hidden");
    };

    let onStopNarrationBtnClick = function() {
        if(!narrationPlayer.audio.paused) narrationPlayer.togglePlayback();
    };

    shelveBtn.addEventListener("click", shelveText);
    unshelveBtn.addEventListener("click", unshelveText);
    if(narrationPlayer) {
        narrationToggleBtn.addEventListener("click", toggleNarrationPlayer);
        narrationPlayer.audio.addEventListener("play", showStopNarrationBtn);
        narrationPlayer.audio.addEventListener("pause", hideStopNarrationBtn);
        stopNarrationBtn.addEventListener("click", onStopNarrationBtnClick);
    }

}