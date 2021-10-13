(function() {
    let searchWidgetHeaderEl = document.querySelector(".search-widget.search-widget--header");
    let searchWidgetNavMenuEl = document.querySelector(".search-widget.search-widget--nav-menu");
    let searchWidgetHeader, searchWidgetNavMenu;
    let SectionController = {

        shelveText: function() {
            let nonTextSection = document.getElementById("nonTextContent");
            nonTextSection.style.right = "0";
            nonTextSection.style.width = "100%";
            SectionText.shelveText();
        },

        unshelveText: function() {
            let nonTextSection = document.getElementById("nonTextContent");
            nonTextSection.style.right = "62%";
            nonTextSection.style.width = "62%";
            SectionText.unshelveText();
        },

        handleNavSearchBarFocus: function(event) {
            let navMenu = document.querySelector(".nav-menu");
            navMenu.classList.add("nav-menu--searching");
        },

        handleNavSearchBarBlur: function(event) {
            let navMenu = document.querySelector(".nav-menu");
            if(searchWidgetNavMenu.searchBarInput.value.length == 0) navMenu.classList.remove("nav-menu--searching");
        },

        initSearchWidget: function(event) {
            if(event.currentTarget.classList.contains("search-widget__open-btn")) {
                searchWidgetHeader.init();
            } else {
                searchWidgetNavMenu.init();
            }
        }

    };

    searchWidgetHeader = SearchWidget(searchWidgetHeaderEl);
    searchWidgetNavMenu = SearchWidget(searchWidgetNavMenuEl);
    searchWidgetHeader.openBtn.addEventListener("click", SectionController.initSearchWidget, { once: true });
    searchWidgetNavMenu.searchBarInput.addEventListener("focus", SectionController.initSearchWidget, { once: true });
    searchWidgetNavMenu.searchBarInput.addEventListener("focus", SectionController.handleNavSearchBarFocus);
    searchWidgetNavMenu.searchBarInput.addEventListener("blur", SectionController.handleNavSearchBarBlur);
    SectionText.settings.shelveBtn.addEventListener("click", SectionController.shelveText);
    SectionText.settings.unshelveBtn.addEventListener("click", SectionController.unshelveText);
    if(video && window.innerWidth > 900) video.addEventListener("play", SectionController.shelveText, { once: true });
})();