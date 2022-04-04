let Subsection = function(root, onNarrationOpenCallback = function(){},  onNarrationCloseCallback = function(){}) {

    let narrationPlayerEl = root.querySelector(".narration-player");
    let narrationToggleBtn = root.querySelector(".subsection__toggle-narration-btn");

    let toggleNarrationPlayer = function() {
        let showIcon = root.querySelector(".subsection__toggle-narration-btn-show-icon");
        let hideIcon = root.querySelector(".subsection__toggle-narration-btn-hide-icon");
        if(narrationPlayerEl.classList.contains("narration-player--hidden")) {
            narrationPlayerEl.classList.remove("narration-player--hidden");
            showIcon.classList.add("subsection__toggle-narration-btn-icon--hidden");
            hideIcon.classList.remove("subsection__toggle-narration-btn-icon--hidden");
            narrationToggleBtn.classList.add("subsection__toggle-narration-btn--activated");
            narrationToggleBtn.setAttribute("aria-label", "Close narration player");
            onNarrationOpenCallback(narrationPlayerEl);
        } else {
            narrationPlayerEl.classList.add("narration-player--hidden");
            showIcon.classList.remove("subsection__toggle-narration-btn-icon--hidden");
            hideIcon.classList.add("subsection__toggle-narration-btn-icon--hidden");
            narrationToggleBtn.classList.remove("subsection__toggle-narration-btn--activated");
            narrationToggleBtn.setAttribute("aria-label", "Open narration player");
            onNarrationCloseCallback(narrationPlayerEl);
        }
    };

    narrationToggleBtn.addEventListener("click", toggleNarrationPlayer);
};