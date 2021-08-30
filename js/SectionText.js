let SectionText = {

    settings: {
        root: document.querySelector(".section-text"),
        mainContainer: document.querySelector(".section-text__main-container"),
        shelveBtn: document.querySelector(".section-text__shelve-btn"),
        unshelveBtn: document.querySelector(".section-text__unshelve-btn")
    },

    init: function() {
        SectionText.bindUI();
    },

    bindUI: function() {
        SectionText.settings.shelveBtn.addEventListener("click", SectionText.shelveText);
        SectionText.settings.unshelveBtn.addEventListener("click", SectionText.unshelveText);
    },

    shelveText: function() {
        // Check if transitions are enabled
        if(document.querySelector("body").classList.contains("preload")) {
            SectionText.settings.mainContainer.classList.add("section-text__main-container--shelved");
            SectionText.settings.unshelveBtn.classList.remove("section-text__unshelve-btn--shelved");
        } else {
            SectionText.settings.mainContainer.addEventListener("transitionend", function() {
                SectionText.settings.unshelveBtn.classList.remove("section-text__unshelve-btn--shelved");
            }, { once: true });
            SectionText.settings.mainContainer.classList.add("section-text__main-container--shelved");
        }
    },

    unshelveText: function() {
        // Check if transitions are enabled
        if(document.querySelector("body").classList.contains("preload")) {
            SectionText.settings.unshelveBtn.classList.add("section-text__unshelve-btn--shelved");
            SectionText.settings.mainContainer.classList.remove("section-text__main-container--shelved");
        } else {
            SectionText.settings.unshelveBtn.addEventListener("transitionend", function() {
                SectionText.settings.mainContainer.classList.remove("section-text__main-container--shelved");
            }, { once: true });
            SectionText.settings.unshelveBtn.classList.add("section-text__unshelve-btn--shelved");
        }
    }

};