let SectionText = {

    settings: {
        root: document.querySelector(".section-text"),
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
            SectionText.settings.root.classList.add("section-text--shelved");
            SectionText.settings.unshelveBtn.classList.add("section-text__unshelve-btn--on-screen");
        } else {
            SectionText.settings.root.addEventListener("transitionend", function() {
                SectionText.settings.unshelveBtn.classList.add("section-text__unshelve-btn--on-screen");
            }, { once: true });
            SectionText.settings.root.classList.add("section-text--shelved");
        }
    },

    unshelveText: function() {
        // Check if transitions are enabled
        if(document.querySelector("body").classList.contains("preload")) {
            SectionText.settings.unshelveBtn.classList.remove("section-text__unshelve-btn--on-screen");
            SectionText.settings.root.classList.remove("section-text--shelved");
        } else {
            SectionText.settings.unshelveBtn.addEventListener("transitionend", function() {
                SectionText.settings.root.classList.remove("section-text--shelved");
            }, { once: true });
            SectionText.settings.unshelveBtn.classList.remove("section-text__unshelve-btn--on-screen");
        }
    }

};