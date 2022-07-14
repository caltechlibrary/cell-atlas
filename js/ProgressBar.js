/**
 * Creates a progress bar widget.
 *
 * @param root The dom element being registered as a progress bar.
 */
let ProgressBar = function(root) {

    // Create references to frequently used dom elements.
    let currPosLabel = root.querySelector(".progress-bar__current-position-label");
    let currPosPopUp = root.querySelector(".progress-bar__current-position-popup");

    // Used to manage delay on progress pop up hiding.
    let hidePopUpTimeout;

    /**
     * Initializes progress bar.
     */
    let init = function() {
        // Get half-length of progress pop up in pixels.
        let popUpHalfLength = currPosPopUp.getBoundingClientRect().width / 2;
        let currPosLabelDimensions = currPosLabel.getBoundingClientRect();

        // Properly align pop up to current position label to prevent overflow. 
        // Use half-length of pop up to calculate overflow as if we are center aligning by default.
        if(currPosLabelDimensions.left - popUpHalfLength <= 0) {
            // Center alignment would cause overflow to the left.
            currPosPopUp.classList.add("progress-bar__current-position-popup--left-aligned");
        } else if(currPosLabelDimensions.right + popUpHalfLength >= window.innerWidth) {
            // Center alignment would cause overflow to the right.
            currPosPopUp.classList.add("progress-bar__current-position-popup--right-aligned");
        } else {
            // No overflow on left/right.
            currPosPopUp.classList.add("progress-bar__current-position-popup--centered");
        }
    };

    /**
     * Called on currPosLabel mouseenter and focusin. Shows 
     * current position pop up.
     * 
     * @param event mouseenter or focusin event that initiated 
     * this function.
     */
    let showPopUp = function() {
        // Clear hide pop up timeout.
        window.clearTimeout(hidePopUpTimeout);

        currPosPopUp.classList.remove("progress-bar__current-position-popup--hidden");

        // Add keyboard shortcut to close pop up.
        window.addEventListener("keydown", forceClosePopUp);
    };

    /**
     * Called on window keydown. Force closes current 
     * position pop up.
     * 
     * @param event keydown event that initiated this function.
     */
    let forceClosePopUp = function(event) {
        // Only close pop up if esc key is pressed.
        if(event.code == "Escape") hidePopUp();
    };

    /**
     * Called on currPosLabel mouseleave. Starts timeout
     * to hide current position pop up.
     * 
     * @param event mouseleave event that initiated this function.
     */
    let initHidePopUp = function() {
        // Store reference to timeout so we can manage it in other events.
        hidePopUpTimeout = setTimeout(hidePopUp, 500);
    };

    /**
     * Called on currPosLabel focusout. Hides current 
     * position pop up.
     */
    let hidePopUp = function() {
        // Remove keyboard shortcut to close pop up.
        window.removeEventListener("keydown", forceClosePopUp);
        
        currPosPopUp.classList.add("progress-bar__current-position-popup--hidden");
    };

    // Add neccessary event listeners to dom elements.
    currPosLabel.addEventListener("mouseenter", showPopUp);
    currPosLabel.addEventListener("mouseleave", initHidePopUp);
    currPosLabel.addEventListener("focusin", showPopUp);
    currPosLabel.addEventListener("focusout", hidePopUp);

    // Initialize progress bar.
    init();

};