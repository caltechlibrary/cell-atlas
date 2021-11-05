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
        if(narrationPlayer.root.classList.contains("narration-player--hidden")) {
            narrationPlayer.root.classList.remove("narration-player--hidden");
        } else {
            narrationPlayer.root.classList.add("narration-player--hidden");
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