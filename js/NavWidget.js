let NavWidget = function(root) {
    
    let sectionListToggles = root.querySelectorAll(".nav__section-list-toggle");

    let toggleSectionList = function(event) {
        let sectionListToggle = event.currentTarget;
        let sectionList = root.querySelector(`#${sectionListToggle.getAttribute("aria-controls")}`);
        let currExpandedToggle = root.querySelector(`.nav__section-list-toggle[aria-expanded='true']`);
        let currExpandedSectionList;

        if(currExpandedToggle && sectionListToggle != currExpandedToggle) {
            currExpandedSectionList = root.querySelector(`#${currExpandedToggle.getAttribute("aria-controls")}`);
            currExpandedSectionList.classList.add("nav__section-list--hidden");
            currExpandedToggle.setAttribute("aria-expanded", "false");
        }
        
        if(sectionListToggle.getAttribute("aria-expanded") == "false") {
            sectionList.classList.remove("nav__section-list--hidden");
            sectionListToggle.setAttribute("aria-expanded", "true");
        } else {
            sectionList.classList.add("nav__section-list--hidden");
            sectionListToggle.setAttribute("aria-expanded", "false");
        }
    };

    for(let sectionListToggle of sectionListToggles) sectionListToggle.addEventListener("click", toggleSectionList);

    return {
        root
    };

};