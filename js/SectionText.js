/**
 * Turns a dom element into a section text component.
 * 
 * Ideally, this component should not be aware of the narration player 
 * through the narrationPlayer object. Ideally, that would be delegated 
 * to some callback functions.
 *
 * @param root The dom element being registered as a section text component.
 * @param shelveCallback Callback called when shelve button is clicked.
 * @param unshelveCallback Callback called when unshelve button is clicked.
 * @param narrationPlayer Narration player object that is a subcomponent of 
 * this section text.
 */
let SectionText = function(root, shelveCallback = function(){}, unshelveCallback = function(){}, narrationPlayer) {

    // Create references to frequently used dom elements.
    let shelveBtn = root.querySelector(".section-text .section-text__shelve-btn");
    let unshelveBtn = root.querySelector(".section-text__unshelve-btn");
    let stopNarrationBtn = root.querySelector(".section-text__stop-narration-btn");
    let narrationToggleBtn = root.querySelector(".section-text__toggle-narration-btn");

    /**
     * Called on shelveBtn click. Fires shelveCallback.
     */
    let shelveText = function() {
        shelveCallback();
    };

    /**
     * Called on unshelveBtn click. Fires unshelveCallback.
     */
    let unshelveText = function() {
        unshelveCallback();
    };

    /**
     * Called on narrationToggleBtn click. Shows/hides narration player 
     * subcomponent.
     * 
     * I believe this can be refactored where this listener does not 
     * depend on narration player subcomponent. Can use bem modifier to 
     * show/hide player (ex: .section-text__narration-player--hidden) and 
     * callback functions to init and toggle playback of player.
     */
    let toggleNarrationPlayer = function() {
        if(narrationPlayer.root.classList.contains("narration-player--hidden")) {
            // Players are initialized the first time they are shown to users.
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

    /**
     * Called on narrationPlayer play. Shows stop narration btn 
     * within unshelve button.
     * 
     * This is where I think this component's dependency on the narration 
     * player subcomponent object arises. I was not sure how to react to 
     * player playback events in the callback style I use.
     */
    let showStopNarrationBtn = function() {
        stopNarrationBtn.classList.remove("section-text__stop-narration-btn--hidden");
    };

    /**
     * Called on narrationPlayer pause. Hides stop narration btn 
     * within unshelve button.
     * 
     * This is where I think this component's dependency on the narration 
     * player subcomponent object arises. I was not sure how to react to 
     * player playback events in the callback style I use.
     */
    let hideStopNarrationBtn = function() {
        stopNarrationBtn.classList.add("section-text__stop-narration-btn--hidden");
    };

    /**
     * Called on stopNarrationBtn click. Pauses narration player 
     * subcomponent.
     * 
     * I believe this can also be refactored where this listener does not 
     * depend on narration player subcomponent. Can use a callback function 
     * to toggle the playback of narration player.
     */
    let onStopNarrationBtnClick = function() {
        if(!narrationPlayer.audio.paused) narrationPlayer.togglePlayback();
    };

    // Add neccessary event listeners to dom elements.
    shelveBtn.addEventListener("click", shelveText);
    unshelveBtn.addEventListener("click", unshelveText);
    // Not sure why I checked for narrationPlayer. I believe it will always render.
    if(narrationPlayer) {
        narrationToggleBtn.addEventListener("click", toggleNarrationPlayer);
        narrationPlayer.audio.addEventListener("play", showStopNarrationBtn);
        narrationPlayer.audio.addEventListener("pause", hideStopNarrationBtn);
        stopNarrationBtn.addEventListener("click", onStopNarrationBtnClick);
    }

}