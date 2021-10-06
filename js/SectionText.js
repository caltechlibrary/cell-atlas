let SectionText = function(root) {

    let mainContainer = root.querySelector(".section-text .section-text__main-container");
    let shelveBtn = root.querySelector(".section-text .section-text__shelve-btn");
    let unshelveBtn = root.querySelector(".section-text .section-text__unshelve-btn");

    let setMainTabIndex = function(tabIndex) {
        let tabbableEls = mainContainer.querySelectorAll("a, button, .section-text__content");
        for(let tabbableEl of tabbableEls) tabbableEl.setAttribute("tabindex", tabIndex);
    };

    return {
        root,
        mainContainer,
        shelveBtn,
        unshelveBtn,
        setMainTabIndex
    }
}