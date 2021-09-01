let SectionText = {

    settings: {
        root: document.querySelector(".section-text"),
        mainContainer: document.querySelector(".section-text .section-text__main-container"),
        shelveBtn: document.querySelector(".section-text .section-text__shelve-btn"),
        unshelveBtn: document.querySelector(".section-text .section-text__unshelve-btn")
    },

    init: function() {
        SectionText.bindUI();
    },

    bindUI: function() {
        SectionText.settings.shelveBtn.addEventListener("click", SectionText.shelveText);
        SectionText.settings.unshelveBtn.addEventListener("click", SectionText.unshelveText);
    },

    shelveText: function() {
        // Remove all main container elements from tab index
        SectionText.setMainTabIndex(-1);
        // Check if transitions are enabled
        if(document.querySelector("body").classList.contains("preload")) {
            SectionText.settings.mainContainer.classList.add("section-text__main-container--shelved");
            SectionText.settings.mainContainer.classList.add("section-text__main-container--hidden");
            SectionText.settings.unshelveBtn.classList.remove("section-text__unshelve-btn--hidden");
            SectionText.settings.unshelveBtn.classList.remove("section-text__unshelve-btn--shelved");
            SectionText.settings.unshelveBtn.setAttribute("tabindex", 0);
        } else {
            SectionText.settings.mainContainer.addEventListener("transitionend", function() {
                if(SectionText.settings.mainContainer.classList.contains("section-text__main-container--shelved")) {
                    SectionText.settings.mainContainer.classList.add("section-text__main-container--hidden");
                    SectionText.settings.unshelveBtn.classList.remove("section-text__unshelve-btn--hidden");
                    SectionText.settings.unshelveBtn.classList.remove("section-text__unshelve-btn--shelved");
                }
            }, { once: true });
            SectionText.settings.unshelveBtn.addEventListener("transitionend", function() {
                if(!SectionText.settings.unshelveBtn.classList.contains("section-text__unshelve-btn--shelved")) {
                    SectionText.settings.unshelveBtn.setAttribute("tabindex", 0);
                }
            }, { once: true });
            SectionText.settings.mainContainer.classList.add("section-text__main-container--shelved");
        }
    },

    unshelveText: function() {
        SectionText.settings.unshelveBtn.setAttribute("tabindex", -1);
        // Check if transitions are enabled
        if(document.querySelector("body").classList.contains("preload")) {
            SectionText.settings.unshelveBtn.classList.add("section-text__unshelve-btn--shelved");
            SectionText.settings.unshelveBtn.classList.add("section-text__unshelve-btn--hidden");
            SectionText.settings.mainContainer.classList.remove("section-text__main-container--hidden");
            SectionText.settings.mainContainer.classList.remove("section-text__main-container--shelved");
            // Add all main container elements back to tab index
            SectionText.setMainTabIndex(0);
        } else {
            SectionText.settings.unshelveBtn.addEventListener("transitionend", function() {
                if(SectionText.settings.unshelveBtn.classList.contains("section-text__unshelve-btn--shelved")) {
                    SectionText.settings.unshelveBtn.classList.add("section-text__unshelve-btn--hidden");
                    SectionText.settings.mainContainer.classList.remove("section-text__main-container--hidden");
                    SectionText.settings.mainContainer.classList.remove("section-text__main-container--shelved");
                }
            }, { once: true });
            SectionText.settings.mainContainer.addEventListener("transitionend", function() {
                if(!SectionText.settings.mainContainer.classList.contains("section-text__main-container--shelved")) {
                    // Add all main container elements back to tab index
                    SectionText.setMainTabIndex(0);   
                }
            }, { once: true });
            SectionText.settings.unshelveBtn.classList.add("section-text__unshelve-btn--shelved");
        }
    },

    setMainTabIndex: function(tabIndex) {
        let tabbableEls = SectionText.settings.mainContainer.querySelectorAll("a, button, .section-text__content");
        for(let tabbableEl of tabbableEls) {
            tabbableEl.setAttribute("tabindex", tabIndex);
        }
    }

};