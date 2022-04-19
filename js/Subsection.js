let Subsection = function(root, onNarrationOpenCallback = function(){},  onNarrationCloseCallback = function(){}) {

    let narrationPlayerEl = root.querySelector(".subsection__narration-player");
    let narrationToggleBtn = root.querySelector(".subsection__toggle-narration-btn");

    let toggleNarrationPlayer = function() {
        if(narrationPlayerEl.classList.contains("narration-player--hidden")) {
            narrationPlayerEl.classList.remove("narration-player--hidden");
            narrationToggleBtn.classList.add("subsection__toggle-narration-btn--activated");
            narrationToggleBtn.setAttribute("aria-expanded", "true");
            onNarrationOpenCallback(narrationPlayerEl);
        } else {
            narrationPlayerEl.classList.add("narration-player--hidden");
            narrationToggleBtn.classList.remove("subsection__toggle-narration-btn--activated");
            narrationToggleBtn.setAttribute("aria-expanded", "false");
            onNarrationCloseCallback(narrationPlayerEl);
        }
    };

    narrationToggleBtn.addEventListener("click", toggleNarrationPlayer);
};