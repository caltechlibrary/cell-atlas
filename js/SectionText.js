let SectionText = function(root) {

    let mainContainer = root.querySelector(".section-text .section-text__main-container");
    let shelveBtn = root.querySelector(".section-text .section-text__shelve-btn");
    let unshelveBtn = root.querySelector(".section-text .section-text__unshelve-btn");

    let shelveText = function() {
        // Remove all main container elements from tab index
        setMainTabIndex(-1);
        // Check if transitions are enabled
        if(document.querySelector("body").classList.contains("preload")) {
            // No transitions, add all necessary classes and toggle tabindex at once
            root.classList.add("section-text-shelved");
            mainContainer.classList.add("section-text__main-container--hidden");
            unshelveBtn.classList.remove("section-text__unshelve-btn--hidden");
            unshelveBtn.classList.remove("section-text__unshelve-btn--shelved");
            unshelveBtn.setAttribute("tabindex", 0);
        } else {
            // Event listener to remove main container visibility and bring out unshelve button once main container has transitioned off screen
            root.addEventListener("transitionend", onMainContainerTransitionHide, { once: true });
            // Event listener to add unshelve button to tab order once it has transitioned on screen
            unshelveBtn.addEventListener("transitionend", onUnshelveBtnTransitionShow, { once: true });
            // Shelve main container to start events
            root.classList.add("section-text-shelved");
        };
    }

    let unshelveText = function() {
        unshelveBtn.setAttribute("tabindex", -1);
        // Check if transitions are enabled
        if(document.querySelector("body").classList.contains("preload")) {
            // No transitions, add all necessary classes and toggle tabindex at once
            unshelveBtn.classList.add("section-text__unshelve-btn--shelved");
            unshelveBtn.classList.add("section-text__unshelve-btn--hidden");
            mainContainer.classList.remove("section-text__main-container--hidden");
            root.classList.remove("section-text-shelved");
            setMainTabIndex(0);
        } else {
            // Event listener to remove unshelve button visibility and bring out main container once unshelve button has transitioned off screen
            unshelveBtn.addEventListener("transitionend", onUnshelveBtnTransitionHide, { once: true });
            // Event listener to add main container elements to tab index once it has transitioned on screen
            root.addEventListener("transitionend", onMainContainerTransitionShow, { once: true });
            // Shelve unshelve button to start events
            unshelveBtn.classList.add("section-text__unshelve-btn--shelved");
        }
    };

    let setMainTabIndex = function(tabIndex) {
        let tabbableEls = mainContainer.querySelectorAll("a, button, .section-text__content");
        for(let tabbableEl of tabbableEls) tabbableEl.setAttribute("tabindex", tabIndex);
    };

    let onMainContainerTransitionHide = function() {
        if(root.classList.contains("section-text-shelved")) {
            mainContainer.classList.add("section-text__main-container--hidden");
            unshelveBtn.classList.remove("section-text__unshelve-btn--hidden");
            unshelveBtn.classList.remove("section-text__unshelve-btn--shelved");
        }
    };

    let onUnshelveBtnTransitionShow = function() {
        if(!unshelveBtn.classList.contains("section-text__unshelve-btn--shelved")) unshelveBtn.setAttribute("tabindex", 0);
    };

    let onUnshelveBtnTransitionHide = function() {
        if(unshelveBtn.classList.contains("section-text__unshelve-btn--shelved")) {
            unshelveBtn.classList.add("section-text__unshelve-btn--hidden");
            mainContainer.classList.remove("section-text__main-container--hidden");
            root.classList.remove("section-text-shelved");
        }
    };

    let onMainContainerTransitionShow = function() {
        if(!root.classList.contains("section-text-shelved")) setMainTabIndex(0);
    }

    return {
        shelveBtn,
        unshelveBtn,
        shelveText,
        unshelveText
    }
}