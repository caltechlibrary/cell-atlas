/**
 * Turns a dom element into an appendix accordion component.
 *
 * @param root The dom element being registered as a appendix 
 * accordion.
 */
let AppendixAccordion = function(root) {

    // Create references to frequently used dom elements.
    let entryHeaders = root.querySelectorAll(".appendix-accordion__entry-header");

    /**
     * Initializes appendix accordion. Might be unnecessary as 
     * it only calls onHashChange function.
     */
    let init = function() {
        onHashChange();
    };

    /**
     * Called on window hashchange. Opens accordion panel tied 
     * to current url hash if it exists.
     */
    let onHashChange = function() {
        let hash = window.location.hash.substring(1);
        let entryHeader = root.querySelector(`.appendix-accordion__entry-header[aria-controls='${hash}-panel']`);
        if(entryHeader && entryHeader.getAttribute("aria-expanded") == "false") toggleEntryPanel(entryHeader);
    };

    /**
     * Called on entryHeader click. Toggles open/close of 
     * accordion panel associated with header.
     * 
     * @param event click event that initiated this function.
     */
    let onHeaderClick = function(event) {
        let entryHeader = event.currentTarget;
        toggleEntryPanel(entryHeader);
    };

    /**
     * Toggles open/close of accordion panel associated with 
     * given entry header.
     * 
     * @param entryHeader dom element associated with accordion 
     * panel to toggle.
     */
    let toggleEntryPanel = function(entryHeader) {
        let accordionPanel = document.getElementById(entryHeader.getAttribute("aria-controls"));
        if(entryHeader.getAttribute("aria-expanded") == "false") {
            expandPanel(accordionPanel);
            entryHeader.setAttribute("aria-expanded", "true");
        } else {
            collapsePanel(accordionPanel);
            entryHeader.setAttribute("aria-expanded", "false");
        }
    };

    /**
     * Opens accordion panel.
     * 
     * The strategy for animating the expansion/collapsing of accordion 
     * panel can be found here: 
     * https://css-tricks.com/using-css-transitions-auto-dimensions/#aa-technique-3-javascript
     * 
     * @param accordionPanel dom element panel to be expanded.
     */
    let expandPanel = function(accordionPanel) {
        // Showing panel is a combination of removing css panel class and explicity setting a height value.

        accordionPanel.classList.remove("appendix-accordion__entry-panel--collapsed");

        // Transitions are prevented with global "preload" class. Need to do an alternative expansion method when it is unavailable.
        if(!document.querySelector("body").classList.contains("preload")) {
            // Because transitions don't work with "auto", need to set height explicitly and change it to "auto" after transition.
            accordionPanel.style.height = `${accordionPanel.scrollHeight}px`;
            accordionPanel.addEventListener("transitionend", onAccordionPanelExpanded, { once: true });
        } else {
            // If no transitions, remove inline height attribute (which is initially set to 0px) to show panel.
            accordionPanel.style.height = null;
        }
    };

    /**
     * Called on accordionPanel transitionend. Removes 
     * inline height styles on accordionPanel after it 
     * has transitioned to said height.
     * 
     * @param event transitioned event that initiated this function.
     */
    let onAccordionPanelExpanded = function(event) {
        // Just in case, make sure transitionend didn't fire for panel collapsing transition.
        if(!event.target.classList.contains("appendix-accordion__entry-panel--collapsed")) event.target.style.height = null;
    };

    /**
     * Closes accordion panel.
     * 
     * The strategy for animating the expansion/collapsing of accordion 
     * panel can be found here: 
     * https://css-tricks.com/using-css-transitions-auto-dimensions/#aa-technique-3-javascript
     * 
     * @param accordionPanel dom element panel to be closed.
     */
    let collapsePanel = function(accordionPanel) {
        // Because transitions don't work with "auto", need to set height explicitly before collapsing list.
        accordionPanel.style.height = `${accordionPanel.scrollHeight}px`;

        // Wait for above line of code to take affect so that transtion can work.
        window.requestAnimationFrame(() => {
            accordionPanel.classList.add("appendix-accordion__entry-panel--collapsed");
            accordionPanel.style.height = "0px";
        });
    };

    init();

    // Add neccessary event listeners to dom elements.
    window.addEventListener("hashchange", onHashChange);
    for(let entryHeader of entryHeaders) entryHeader.addEventListener("click", onHeaderClick);

};