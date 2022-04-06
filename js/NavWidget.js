let NavWidget = function(root, onSearchInputFocusCallback = function(){}, onSearchInputBlurCallback = function(){}, onSearchExitCallback = function(){}) {
    
    let searchBarInput = root.querySelector(".nav__search-bar-input");
    let searchExitBtn = root.querySelector(".nav__exit-btn");
    let chapterList = root.querySelector(".nav__chapter-list");
    let sectionListToggles = root.querySelectorAll(".nav__section-list-toggle");

    let init = function() {
        let pathComponents = window.location.pathname.split("/");
        let currentPath = pathComponents[pathComponents.length - 1];
        let currentPageLink = root.querySelector(`[href='${currentPath}']`);
        let currentLinkLiParent, currentSectionList, currSectionListToggle;
        if(currentPageLink) {
            currentPageLink.setAttribute("aria-current", "page");
            currentPageLink.classList.add("nav__link--current");
            currentLinkLiParent = currentPageLink.closest(".nav__entry");
            currentSectionList = currentLinkLiParent.querySelector(".nav__section-list");
            if(currentSectionList) {
                currSectionListToggle = root.querySelector(`[aria-controls='${currentSectionList.id}']`)
                expandSectionList(currentSectionList);
                currSectionListToggle.setAttribute("aria-expanded", "true");
            }
        }
    };

    let handleSearchInputFocus = function() {
        chapterList.classList.add("nav__chapter-list--searching");
        onSearchInputFocusCallback();
    };

    let handleSearchInputBlur = function() {
        if(searchBarInput.value.length == 0) exitSearch();
        onSearchInputBlurCallback();
    };

    let exitSearch = function() {
        chapterList.classList.remove("nav__chapter-list--searching");
        onSearchExitCallback();
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

    init();
    searchBarInput.addEventListener("focus", handleSearchInputFocus);
    searchBarInput.addEventListener("blur", handleSearchInputBlur);
    searchExitBtn.addEventListener("click", exitSearch);
    for(let sectionListToggle of sectionListToggles) sectionListToggle.addEventListener("click", toggleSectionList);

    return {
        root
    };

};