(function() {
    let searchWidgetHeaderEl = document.querySelector(".search-widget.search-widget--header");
    let searchWidgetNavMenuEl = document.querySelector(".search-widget.search-widget--nav-menu");
    let searchWidgetHeader, searchWidgetNavMenu;
    let SearchController = (function() {

        let initSearchWidget = function(event) {
            if(event.currentTarget.classList.contains("search-widget__open-btn")) {
                searchWidgetHeader.init();
            } else {
                searchWidgetNavMenu.init();
            }
        };

        let handleNavSearchBarFocus = function(event) {
            let navMenu = document.querySelector(".nav-menu");
            let sectionList = document.querySelector(".nav-menu__section-list");
            let mobileNavFooter = document.querySelector(".mobile-footer-data");
            navMenu.classList.add("nav-menu--searching");
            sectionList.classList.add("nav-menu__section-list--searching");
            mobileNavFooter.classList.add("mobile-footer-data--searching");
        };

        let handleNavSearchBarBlur = function(event) {
            let navMenu = document.querySelector(".nav-menu");
            let sectionList = document.querySelector(".nav-menu__section-list");
            let mobileNavFooter = document.querySelector(".mobile-footer-data");
            if(searchWidgetNavMenu.searchBarInput.value.length == 0) {
                navMenu.classList.remove("nav-menu--searching");
                sectionList.classList.remove("nav-menu__section-list--searching");
                mobileNavFooter.classList.remove("mobile-footer-data--searching");
            }
        };

        return {
            initSearchWidget,
            handleNavSearchBarFocus,
            handleNavSearchBarBlur
        };

    })();

    searchWidgetHeader = SearchWidget(searchWidgetHeaderEl);
    searchWidgetNavMenu = SearchWidget(searchWidgetNavMenuEl);
    searchWidgetHeader.openBtn.addEventListener("click", SearchController.initSearchWidget, { once: true });
    searchWidgetNavMenu.searchBarInput.addEventListener("focus", SearchController.initSearchWidget, { once: true });
    searchWidgetNavMenu.searchBarInput.addEventListener("focus", SearchController.handleNavSearchBarFocus);
    searchWidgetNavMenu.searchBarInput.addEventListener("blur", SearchController.handleNavSearchBarBlur);
})();