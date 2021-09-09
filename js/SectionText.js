let SectionText = {

    settings: {
        root: document.querySelector(".section-text"),
        mainContainer: document.querySelector(".section-text .section-text__main-container"),
        shelveBtn: document.querySelector(".section-text .section-text__shelve-btn"),
        unshelveBtn: document.querySelector(".section-text .section-text__unshelve-btn")
    },

    shelveText: function() {
        // Remove all main container elements from tab index
        SectionText._setMainTabIndex(-1);
        // Check if transitions are enabled
        if(document.querySelector("body").classList.contains("preload")) {
            // No transitions, add all necessary classes and toggle tabindex at once
            SectionText.settings.mainContainer.classList.add("section-text__main-container--shelved");
            SectionText.settings.mainContainer.classList.add("section-text__main-container--hidden");
            SectionText.settings.unshelveBtn.classList.remove("section-text__unshelve-btn--hidden");
            SectionText.settings.unshelveBtn.classList.remove("section-text__unshelve-btn--shelved");
            SectionText.settings.unshelveBtn.setAttribute("tabindex", 0);
        } else {
            // Event listener to remove main container visibility and bring out unshelve button once main container has transitioned off screen
            SectionText.settings.mainContainer.addEventListener("transitionend", SectionText._onMainContainerTransitionHide, { once: true });
            // Event listener to add unshelve button to tab order once it has transitioned on screen
            SectionText.settings.unshelveBtn.addEventListener("transitionend", SectionText._onUnshelveBtnTransitionShow, { once: true });
            // Shelve main container to start events
            SectionText.settings.mainContainer.classList.add("section-text__main-container--shelved");
        }
    },

    unshelveText: function() {
        SectionText.settings.unshelveBtn.setAttribute("tabindex", -1);
        // Check if transitions are enabled
        if(document.querySelector("body").classList.contains("preload")) {
            // No transitions, add all necessary classes and toggle tabindex at once
            SectionText.settings.unshelveBtn.classList.add("section-text__unshelve-btn--shelved");
            SectionText.settings.unshelveBtn.classList.add("section-text__unshelve-btn--hidden");
            SectionText.settings.mainContainer.classList.remove("section-text__main-container--hidden");
            SectionText.settings.mainContainer.classList.remove("section-text__main-container--shelved");
            SectionText._setMainTabIndex(0);
        } else {
            // Event listener to remove unshelve button visibility and bring out main container once unshelve button has transitioned off screen
            SectionText.settings.unshelveBtn.addEventListener("transitionend", SectionText._onUnshelveBtnTransitionHide, { once: true });
            // Event listener to add main container elements to tab index once it has transitioned on screen
            SectionText.settings.mainContainer.addEventListener("transitionend", SectionText._onMainContainerTransitionShow, { once: true });
            // Shelve unshelve button to start events
            SectionText.settings.unshelveBtn.classList.add("section-text__unshelve-btn--shelved");
        }
    },

    _onMainContainerTransitionHide: function() {
        if(SectionText.settings.mainContainer.classList.contains("section-text__main-container--shelved")) {
            SectionText.settings.mainContainer.classList.add("section-text__main-container--hidden");
            SectionText.settings.unshelveBtn.classList.remove("section-text__unshelve-btn--hidden");
            SectionText.settings.unshelveBtn.classList.remove("section-text__unshelve-btn--shelved");
        }
    },

    _onUnshelveBtnTransitionShow: function() {
        if(!SectionText.settings.unshelveBtn.classList.contains("section-text__unshelve-btn--shelved")) {
            SectionText.settings.unshelveBtn.setAttribute("tabindex", 0);
        }
    },

    _onUnshelveBtnTransitionHide: function() {
        if(SectionText.settings.unshelveBtn.classList.contains("section-text__unshelve-btn--shelved")) {
            SectionText.settings.unshelveBtn.classList.add("section-text__unshelve-btn--hidden");
            SectionText.settings.mainContainer.classList.remove("section-text__main-container--hidden");
            SectionText.settings.mainContainer.classList.remove("section-text__main-container--shelved");
        }
    },

    _onMainContainerTransitionShow: function() {
        if(!SectionText.settings.mainContainer.classList.contains("section-text__main-container--shelved")) {
            SectionText._setMainTabIndex(0);   
        }
    },

    _setMainTabIndex: function(tabIndex) {
        let tabbableEls = SectionText.settings.mainContainer.querySelectorAll("a, button, .section-text__content");
        for(let tabbableEl of tabbableEls) {
            tabbableEl.setAttribute("tabindex", tabIndex);
        }
    }

};