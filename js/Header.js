/**
 * Creates a header widget.
 *
 * @param root The dom element being registered as a header.
 * @param navBtnClickCallback Callback fired when navigation 
 * menu button is clicked.
 */
let Header = function(root, navBtnClickCallback = function() {}) {

    // Create references to frequently used dom elements.
    let navBtn = root.querySelector(".header__nav-btn");
    let openSearchBtn = root.querySelector(".header__open-search-btn");
    let searchWidget = root.querySelector(".header__search-widget");
    let searchBarInput = root.querySelector(".header__search-bar-input");
    let searchResultList = root.querySelector(".header__result-list")

    /**
     * Called on navBtn click. Fires navBtnClickCallback.
     * 
     * @param event click event that initiated this function.
     */
    let onNavBtnClick = function() {
        navBtnClickCallback();
    };

    /**
     * Called on openSearchBtn click. Opens search widget.
     * 
     * @param event click event that initiated this function.
     */
    let openSearchWidget = function() {
        // Hide open search button.
        openSearchBtn.classList.add("header__open-search-btn--hidden");
        
        searchWidget.classList.remove("header__search-widget--hidden");
        openSearchBtn.setAttribute("aria-expanded", "true");

        // Add event listener to close search widget when click is fired outside header.
        window.addEventListener("click", autoCloseSearchWidget);
    };

    /**
     * Called on window click. Auto-closes search widget when 
     * non-header el is clicked.
     * 
     * @param event click event that initiated this function.
     */
    let autoCloseSearchWidget = function(event) {
        if(!root.contains(event.target)) closeSearchWidget();
    };

    /**
     * Closes the search widget.
     */
    let closeSearchWidget = function() {
        // Remove event listener to auto-close so that this function won't fire again.
        window.removeEventListener("click", autoCloseSearchWidget);

        openSearchBtn.setAttribute("aria-expanded", "false");

        /**
         * Search widget and its result list visual state are managed separately. Need to hide both explicitly. 
         * See comments in onSearchInputFocus on ideas to change this.
         */
        searchResultList.classList.add("header__result-list--hidden");
        searchWidget.classList.remove("header__search-widget--active");
        searchWidget.classList.add("header__search-widget--hidden");

        // Show open search button as it is hidden while the search widget is open.
        openSearchBtn.classList.remove("header__open-search-btn--hidden");
    };

    /**
     * Called on searchBarInput click. Shows search result list.
     */
    let onSearchInputFocus = function() {
        /**
         * Could be possible to have result list visibility dependent on active class in css, as the intention for 
         * the header search widget is to only show the result list when the search input is focused. I have not 
         * tested this yet, just an idea.
         */
        searchWidget.classList.add("header__search-widget--active");
        searchResultList.classList.remove("header__result-list--hidden");
    };

    // Add neccessary event listeners to dom elements.
    navBtn.addEventListener("click", onNavBtnClick);

    // In offline version, search widget is not rendered in header.
    if(searchWidget) {
        openSearchBtn.addEventListener("click", openSearchWidget);
        searchBarInput.addEventListener("focus", onSearchInputFocus);
    }

};