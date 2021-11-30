let AppendixAccordion = function(root) {

    let entryHeaders = root.querySelectorAll(".appendix-accordion__entry-header");

    let toggleEntryPanel = function(event) {
        let entryHeader = event.currentTarget;
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

    for(let entryHeader of entryHeaders) entryHeader.addEventListener("click", toggleEntryPanel);

    return {
        root
    }

};

(function() {

    let appendixAccordionEl = document.querySelector(".appendix-accordion");
    let appendixAccordion = AppendixAccordion(appendixAccordionEl);

})();