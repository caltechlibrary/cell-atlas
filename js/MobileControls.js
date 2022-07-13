/**
 * Creates a mobile controls widget.
 *
 * @param root The dom element being registered as a mobile control.
 * @param onControlClickCallback Callback fired when a control is clicked.
 */
let MobileControls = function(root, onControlClickCallback) {

    // Create references to frequently used dom elements.
    let controlBtns = root.querySelectorAll(".mobile-controls__btn");

    /**
     * Called on controlBtn click. Visually updates currently 
     * selected control and calls onControlClickCallback.
     * 
     * @param event click event that initiated this function.
     */
    let handleControlsClick = function(event) {
        let controlBtn = event.currentTarget;
        let currSelected = root.querySelector(".mobile-controls__btn--selected");

        // If clicked button is currently selected, return.
        if(controlBtn == currSelected) return;

        // Update classes for prev/curr selected controls.
        currSelected.classList.remove("mobile-controls__btn--selected");
        controlBtn.classList.add("mobile-controls__btn--selected");

        // Pass curr selected control value to callback.
        onControlClickCallback(controlBtn.value);
    };

    // Add neccessary event listeners to dom elements.
    for(let controlBtn of controlBtns) controlBtn.addEventListener("click", handleControlsClick);

};