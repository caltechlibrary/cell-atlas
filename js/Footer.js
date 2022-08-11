/**
 * Turns a dom element into a footer component.
 *
 * @param root The dom element being registered as a footer.
 */
let Footer = function(root) {

    // Create references to frequently used dom elements.
    let progressToggle = root.querySelector(".footer__progress-toggle");
    let progressBar = root.querySelector(".footer__progress-bar");

    /**
     * Initializes footer by persisting progress bar 
     * visibility based on user session.
     */
    let init = function() {
        // Check for web storage support before using it.
        if (typeof(Storage) !== "undefined") {
            let showProgress = window.sessionStorage.getItem("showProgress");
            if(!showProgress || showProgress == "true") toggleProgressBar();
        }

        progressToggle.classList.remove("footer__progress-toggle--uninitialized");
    };

   /**
    * Called on progressToggle click. Toggles 
    * visibility of progress bar.
    */
    let toggleProgressBar = function() {
        /**
         * progressToggle el has role of "switch", which uses "aria-checked" attribute.
         * Updating session storage provides functionality to persist progress bar visibility.
         */
        if(progressToggle.getAttribute("aria-checked") == "false") {
            progressToggle.setAttribute("aria-checked", "true");
            progressToggle.classList.add("footer__progress-toggle--on");
            progressBar.classList.remove("footer__progress-bar--shelved");
            window.sessionStorage.setItem("showProgress", true);
        } else {
            progressToggle.setAttribute("aria-checked", "false");
            progressToggle.classList.remove("footer__progress-toggle--on");
            progressBar.classList.add("footer__progress-bar--shelved");
            window.sessionStorage.setItem("showProgress", false);
        }
    };

    // Progress bar/toggle does not render on all pages and contains the only functionality for footer components.
    if(progressToggle) {
        progressToggle.addEventListener("click", toggleProgressBar);
        init();
    }
    
};