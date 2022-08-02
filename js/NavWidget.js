/**
 * Creates a navigation widget.
 *
 * @param root The dom element being registered as a navigation widget.
 * @param onSearchInputFocusCallback Callback fired when search input
 * is focused.
 * @param onSearchInputBlurCallback Callback fired when focus is 
 * removed from search input.
 * @param onSearchExitCallback Callback fired when search exit button 
 * is clicked.
 */
let NavWidget = function(root, onSearchInputFocusCallback = function(){}, onSearchInputBlurCallback = function(){}, onSearchExitCallback = function(){}) {
    
    // Create references to frequently used dom elements.
    let searchBarInput = root.querySelector(".nav__search-bar-input");
    let searchExitBtn = root.querySelector(".nav__exit-btn");
    let chapterList = root.querySelector(".nav__chapter-list");
    let sectionListToggles = root.querySelectorAll(".nav__section-list-toggle");

    /**
     * Initializes display (not functionality) of nav widget.
     */
    let init = function() {
        // Determine if link exists in nav menu of current page.

        // Get relative path of current page.
        let pathComponents = window.location.pathname.split("/");
        let currentPath = pathComponents[pathComponents.length - 1];
        // Use path to select associated nav link.
        let currentPageLink = root.querySelector(`[href='${currentPath}']`);
        let currentLinkLiParent, currentSectionList, currSectionListToggle;

        // If associated nav link to current path exists (some paths aren't listed in nav menu), modify initial display of menu.
        if(currentPageLink) {
            currentPageLink.setAttribute("aria-current", "page");
            currentPageLink.classList.add("nav__link--current");

            // Each link is a child of a .nav__entry block. Use that block to check if part of a section list.
            currentLinkLiParent = currentPageLink.closest(".nav__entry");
            // I think alternatively, you could just use currentPageLink.closest(".nav__section-list").
            currentSectionList = currentLinkLiParent.querySelector(".nav__section-list");
            // If link is part of a section list, expand it.
            if(currentSectionList) {
                currSectionListToggle = root.querySelector(`[aria-controls='${currentSectionList.id}']`)
                expandSectionList(currentSectionList);
                currSectionListToggle.setAttribute("aria-expanded", "true");
            }
        }
    };

    /**
     * Called on searchBarInput focus. Enters nav search mode and 
     * fires onSearchInputFocusCallback.
     */
    let handleSearchInputFocus = function() {
        // Hide nav contents while searching. Alternatively, this could be better managed with a parent .nav--searching class.
        chapterList.classList.add("nav__chapter-list--searching");
        onSearchInputFocusCallback();
    };

    /**
     * Called on searchBarInput blur. Determines if nav search should exit and 
     * fires onSearchInputBlurCallback.
     */
    let handleSearchInputBlur = function() {
        // Only exit search mode if there is no current input in search bar.
        if(searchBarInput.value.length == 0) exitSearch();
        onSearchInputBlurCallback();
    };

    /**
     * Called on searchExitBtn click. Exits nav search mode and fires 
     * onSearchExitCallback.
     */
    let exitSearch = function() {
        // Reshow nav contents. Alternatively, this could be better managed with a parent .nav--searching class.
        chapterList.classList.remove("nav__chapter-list--searching");
        onSearchExitCallback();
    };

    /**
     * Called on sectionListToggle click. Toggles expansion of section list 
     * associated with the sectionListToggle that fired this function.
     * 
     * @param event click event that initiated this function.
     */
    let toggleSectionList = function(event) {
        let sectionListToggle = event.currentTarget;
        let sectionList = root.querySelector(`#${sectionListToggle.getAttribute("aria-controls")}`);
        let currExpandedToggle = root.querySelector(`.nav__section-list-toggle[aria-expanded='true']`);
        let currExpandedSectionList;

        // If there is a currently expanded toggle and it is not this one, we need to collapse its section list.
        if(currExpandedToggle && sectionListToggle != currExpandedToggle) {
            currExpandedSectionList = root.querySelector(`#${currExpandedToggle.getAttribute("aria-controls")}`);
            collapseSectionList(currExpandedSectionList);
            currExpandedToggle.setAttribute("aria-expanded", "false");
        }
        
        // Toggle expansion of associated toggle section list.
        if(sectionListToggle.getAttribute("aria-expanded") == "false") {
            expandSectionList(sectionList);
            sectionListToggle.setAttribute("aria-expanded", "true");
        } else {
            collapseSectionList(sectionList);
            sectionListToggle.setAttribute("aria-expanded", "false");
        }
    };

    /**
     * Expands a given section list.
     * 
     * The strategy for animating the expansion/collapsing of section 
     * list can be found here: 
     * https://css-tricks.com/using-css-transitions-auto-dimensions/#aa-technique-3-javascript
     * 
     * @param sectionList dom element section list to be expanded.
     */
    let expandSectionList = function(sectionList) {
        sectionList.classList.remove("nav__section-list--collapsed");

        /**
         * Animations are prevented with global "preload" class. Because expansion animation depends on transition, we 
         * need to do an alternative expansion method when it is unavailable.
         */
        if(!document.querySelector("body").classList.contains("preload")) {
            // Because transitions don't work with "auto", need to set height explicitly and change it to "auto" after transition.
            sectionList.style.height = `${sectionList.scrollHeight}px`;
            sectionList.addEventListener("transitionend", onSectionListExpanded, { once: true });
        } else {
            sectionList.style.height = "auto";
        }
    };

    /**
     * Called on sectionList transitionend.
     * 
     * @param event transitionend event that initiated this function.
     */
    let onSectionListExpanded = function(event) {
        // Only remove height if section list is expanded.
        if(!event.target.classList.contains("nav__section-list--collapsed")) event.target.style.height = null;
    };

    /**
     * Collapses a given section list.
     * 
     * The strategy for animating the expansion/collapsing of section 
     * list can be found here: 
     * https://css-tricks.com/using-css-transitions-auto-dimensions/#aa-technique-3-javascript
     * 
     * @param sectionList dom element section list to be collapsed.
     */
    let collapseSectionList = function(sectionList) {
        // Because transitions don't work with "auto", need to set height explicitly before collapsing list.
        sectionList.style.height = `${sectionList.scrollHeight}px`;

        // Wait for above line of code to take affect so that transtion can work.
        window.requestAnimationFrame(() => {
            sectionList.classList.add("nav__section-list--collapsed");
            sectionList.style.height = "0px";
        });
    };


    init();

    // Add neccessary event listeners to dom elements.
    // In offline version, search widget is not rendered in nav menu.
    if(searchBarInput) {
        searchBarInput.addEventListener("focus", handleSearchInputFocus);
        searchBarInput.addEventListener("blur", handleSearchInputBlur);
        searchExitBtn.addEventListener("click", exitSearch);
    }
    for(let sectionListToggle of sectionListToggles) sectionListToggle.addEventListener("click", toggleSectionList);

};