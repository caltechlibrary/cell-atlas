let NavWidget = function(root) {
    
    let sectionListToggles = root.querySelectorAll(".nav__section-list-toggle");

    let init = function() {
        let currentPath = window.location.pathname.split("/")[1];
        let currentPageLink = root.querySelector(`[href='${currentPath}']`);
        let currentLinkLiParent, currentSectionList, currSectionListToggle;
        if(currentPageLink) {
            currentLinkLiParent = currentPageLink.closest(".nav__entry");
            currentSectionList = currentLinkLiParent.querySelector(".nav__section-list");
            currSectionListToggle = root.querySelector(`[aria-controls='${currentSectionList.id}']`)
            expandSectionList(currentSectionList);
            currSectionListToggle.setAttribute("aria-expanded", "true");
            currentPageLink.setAttribute("aria-current", "page");
            currentPageLink.classList.add("nav__link--current");
        }
    };

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
        if(!document.querySelector("body").classList.contains("preload")) {
            sectionList.style.height = `${sectionList.scrollHeight}px`;
            sectionList.addEventListener("transitionend", onSectionListExpanded, { once: true });
        } else {
            sectionList.style.height = "auto";
        }
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

    init();
    for(let sectionListToggle of sectionListToggles) sectionListToggle.addEventListener("click", toggleSectionList);

    return {
        root,
        show,
        hide
    };

};