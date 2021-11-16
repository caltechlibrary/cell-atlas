let NavWidget = function(root) {
    
    let sectionListToggles = root.querySelectorAll(".nav__section-list-toggle");

    let toggleSectionList = function(event) {
        let sectionListToggle = event.currentTarget;
        let sectionList = root.querySelector(`#${sectionListToggle.getAttribute("aria-controls")}`);
        let currExpandedToggle = root.querySelector(`.nav__section-list-toggle[aria-expanded='true']`);
        let currExpandedSectionList;

        if(currExpandedToggle && sectionListToggle != currExpandedToggle) {
            currExpandedSectionList = root.querySelector(`#${currExpandedToggle.getAttribute("aria-controls")}`);
            collapseSectionList(currExpandedSectionList);
            currExpandedToggle.setAttribute("aria-expanded", "false");
        }
        
        if(sectionListToggle.getAttribute("aria-expanded") == "false") {
            expandSectionList(sectionList);
            sectionListToggle.setAttribute("aria-expanded", "true");
        } else {
            collapseSectionList(sectionList);
            sectionListToggle.setAttribute("aria-expanded", "false");
        }
    };

    let expandSectionList = function(sectionList) {
        sectionList.classList.remove("nav__section-list--collapsed");
        sectionList.style.height = `${sectionList.scrollHeight}px`;
        sectionList.addEventListener("transitionend", onSectionListExpanded, { once: true });
    };

    let onSectionListExpanded = function(event) {
        if(!event.target.classList.contains("nav__section-list--collapsed")) event.target.style.height = null;
    };

    let collapseSectionList = function(sectionList) {
        sectionList.style.height = `${sectionList.scrollHeight}px`;
        window.requestAnimationFrame(() => {
            sectionList.classList.add("nav__section-list--collapsed");
            sectionList.style.height = "0px";
        });
    };

    let show = function() {
        root.classList.remove("nav--collapsed");
    };

    let hide = function() {
        root.classList.add("nav--collapsed");
    };

    for(let sectionListToggle of sectionListToggles) sectionListToggle.addEventListener("click", toggleSectionList);

    return {
        root,
        show,
        hide
    };

};