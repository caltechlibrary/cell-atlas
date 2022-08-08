/**
 * Turns a dom element into a subsection component.
 *
 * @param root The dom element being registered as a subsection component.
 * @param onNarrationOpenCallback Callback called when narration player is shown.
 * @param onNarrationCloseCallback Callback called when narration player is hidden.
 */
let Subsection = function(root, onNarrationOpenCallback = function(){},  onNarrationCloseCallback = function(){}) {

    // Create references to frequently used dom elements.
    let narrationPlayerEl = root.querySelector(".subsection__narration-player");
    let narrationToggleBtn = root.querySelector(".subsection__toggle-narration-btn");

    /**
     * Called on narrationToggleBtn click. Shows/hides narration player 
     * subcomponent.
     */
    let toggleNarrationPlayer = function() {
        /**
         * This component can be better decoupled by making narration player a bem element of subsection.
         * So managing classes like subsection___narration-player.
         */

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

    // Add neccessary event listeners to dom elements.
    narrationToggleBtn.addEventListener("click", toggleNarrationPlayer);
};