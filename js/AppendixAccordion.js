let AppendixAccordion = function(root) {

    let entryHeaders = root.querySelectorAll(".appendix-accordion__entry-header");

    let init = function() {
        onHashChange();
    };

    let onHashChange = function() {
        let hash = window.location.hash.substring(1);
        let entryHeader = root.querySelector(`.appendix-accordion__entry-header[aria-controls='${hash}-panel']`);
        if(entryHeader && entryHeader.getAttribute("aria-expanded") == "false") toggleEntryPanel(entryHeader);
    };

    let onHeaderClick = function(event) {
        let entryHeader = event.currentTarget;
        toggleEntryPanel(entryHeader);
    };

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

    let expandPanel = function(accordionPanel) {
        accordionPanel.classList.remove("appendix-accordion__entry-panel--collapsed");
        if(!document.querySelector("body").classList.contains("preload")) {
            accordionPanel.style.height = `${accordionPanel.scrollHeight}px`;
            accordionPanel.addEventListener("transitionend", onAccordionPanelExpanded, { once: true });
        } else {
            accordionPanel.style.height = null;
        }
    };

    let onAccordionPanelExpanded = function(event) {
        if(!event.target.classList.contains("appendix-accordion__entry-panel--collapsed")) event.target.style.height = null;
    };

    let collapsePanel = function(accordionPanel) {
        accordionPanel.style.height = `${accordionPanel.scrollHeight}px`;
        window.requestAnimationFrame(() => {
            accordionPanel.classList.add("appendix-accordion__entry-panel--collapsed");
            accordionPanel.style.height = "0px";
        });
    };

    init();
    window.addEventListener("hashchange", onHashChange);
    for(let entryHeader of entryHeaders) entryHeader.addEventListener("click", onHeaderClick);

    return {
        root
    }

};