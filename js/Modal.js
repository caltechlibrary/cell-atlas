/**
 * Turns a dom element into a modal component and returns a 
 * modal object.
 *
 * @param root The dom element being registered as a modal.
 * @param onOpenCallback Callback fired when modal is shown.
 * @param onCloseCallback Callback fired when modal is closed.
 */
let Modal = function(root, onOpenCallback = function(){},  onCloseCallback = function(){}) {

    // Create references to frequently used dom elements.
    let modalContainer = root.querySelector(".modal__modal-container");
    let exitBtn = root.querySelector(".modal__exit-btn");
    let focusableEls = root.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    let lastFocused;

    /**
     * Returned as method on modal object. Shows the modal.
     */
    let show = function() {
        // Store "global" reference to element that will be focused on modal close.
        lastFocused = document.activeElement;        

        root.classList.remove("modal--hidden");

        /**
         * Need to focus 1st focusable visible element on open. On mobile, this is the "X" close button. On desktop, 
         * this does not show. So we would focus the 2nd element. Focus correct one depending on context.
         */
        focusableEls[(window.innerWidth < 900) ? 0 : 1].focus();

        // Add listener that provides keyboard functionality for open modals.
        document.addEventListener("keydown", onOpenModalKeyDown);

        onOpenCallback();
    };

    /**
     * Called on document keydown. Provides keyboard functionality 
     * to modals like focus traping and keyboard shortcut hiding.
     * 
     * @param event keydown event that initiated this function.
     */
    let onOpenModalKeyDown = function(event) {
        if(event.key == "Escape") {
            hide();
        } else if(event.key == "Tab") {
            /**
             * Keep focus within modal whenever Tab key is pressed. Preventing default event when we manage focus is used 
             * to prevent the browser from focusing the next element after we have already set focus manaully.
             */ 
            if(!root.contains(event.target) || (event.target == focusableEls[focusableEls.length - 1] && !event.shiftKey)) {
                /**
                 * If tabbing from last element or if focus some how lands outside of modal, focus 1st focusable visible 
                 * element in modal. On mobile, this is the "X" close button. On desktop, this does not show. So we focus 
                 * the 2nd element. Focus correct one depending on context.
                 */
                focusableEls[window.innerWidth < 900 ? 0 : 1].focus();
                event.preventDefault();
            } else if(event.target == focusableEls[window.innerWidth < 900 ? 0 : 1] && event.shiftKey) {
                // If shift-tabbing from 1st element, need to focus last focusable element.
                focusableEls[focusableEls.length - 1].focus();
                event.preventDefault();
            }
        }
    };

    /**
     * Called on exitBtn click. Returned as method on modal 
     * object. Closes the modal.
     */
    let hide = function() {
        onCloseCallback();

        root.classList.add("modal--hidden");

        // Remove listener that provides keyboard functionality for open modals.
        document.removeEventListener("keydown", onOpenModalKeyDown);

        // Focus the last focused element that was stored on modal open.
        lastFocused.focus();
    };

    /**
     * Called on root click. Hides modal when background is clicked.
     * 
     * @param event click event that initiated this function.
     */
    let onRootClick = function(event) {
        if(!modalContainer.contains(event.target)) hide();
    };

    // Add neccessary event listeners to dom elements.
    root.addEventListener("click", onRootClick);
    exitBtn.addEventListener("click", hide);

    // Return modal object.
    return {
        root,
        show,
        hide
    }

};