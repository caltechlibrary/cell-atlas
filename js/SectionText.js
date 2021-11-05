let SectionText = function(root, narrationPlayer) {

    let mainContainer = root.querySelector(".section-text .section-text__main-container");
    let shelveBtn = root.querySelector(".section-text .section-text__shelve-btn");
    let unshelveBtn = root.querySelector(".section-text .section-text__unshelve-btn");
    let narrationToggleBtn = root.querySelector(".section-text__toggle-narration-btn");

    let setMainTabIndex = function(tabIndex) {
        let tabbableEls = mainContainer.querySelectorAll("a, button, .section-text__content");
        for(let tabbableEl of tabbableEls) tabbableEl.setAttribute("tabindex", tabIndex);
    };

    let toggleNarrationPlayer = function() {
        let showIcon = root.querySelector(".section-text__toggle-narration-btn-show-icon");
        let hideIcon = root.querySelector(".section-text__toggle-narration-btn-hide-icon");
        if(narrationPlayer.root.classList.contains("narration-player--hidden")) {
            narrationPlayer.root.classList.remove("narration-player--hidden");
            showIcon.classList.add("section-text__toggle-narration-btn-icon--hidden");
            hideIcon.classList.remove("section-text__toggle-narration-btn-icon--hidden");
            narrationToggleBtn.classList.add("section-text__toggle-narration-btn--activated");
        } else {
            narrationPlayer.root.classList.add("narration-player--hidden");
            showIcon.classList.remove("section-text__toggle-narration-btn-icon--hidden");
            hideIcon.classList.add("section-text__toggle-narration-btn-icon--hidden");
            narrationToggleBtn.classList.remove("section-text__toggle-narration-btn--activated");
            if(!narrationPlayer.audio.paused) narrationPlayer.togglePlayback();
        }
    };

    narrationToggleBtn.addEventListener("click", toggleNarrationPlayer);

    return {
        root,
        mainContainer,
        shelveBtn,
        unshelveBtn,
        setMainTabIndex
    }
}