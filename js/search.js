(function() {
    let searchWidgetHeaderEl = document.querySelector(".search-widget.search-widget--header");
    let searchWidgetNavMenuEl = document.querySelector(".search-widget.search-widget--nav-menu");
    let mobileControlsEl = document.querySelector(".mobile-controls");
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
            let navMenu = document.querySelector(".nav");
            let chapterList = document.querySelector(".nav__chapter-list");
            navMenu.classList.add("nav--searching");
            chapterList.classList.add("nav__chapter-list--searching");
            mobileControlsEl.classList.add("page__mobile-controls--hidden");
        };

        let handleNavSearchBarBlur = function(event) {
            if(searchWidgetNavMenu.searchBarInput.value.length == 0) exitNavSearch();
            mobileControlsEl.classList.remove("page__mobile-controls--hidden");
        };

        let exitNavSearch = function() {
            let navMenu = document.querySelector(".nav");
            let chapterList = document.querySelector(".nav__chapter-list");
            navMenu.classList.remove("nav--searching");
            chapterList.classList.remove("nav__chapter-list--searching");
            mobileControlsEl.classList.remove("page__mobile-controls--hidden");
        };

        return {
            initSearchWidget,
            handleNavSearchBarFocus,
            handleNavSearchBarBlur,
            exitNavSearch
        };

    })();

    searchWidgetHeader = SearchWidget(searchWidgetHeaderEl);
    searchWidgetNavMenu = SearchWidget(searchWidgetNavMenuEl);
    searchWidgetHeader.openBtn.addEventListener("click", SearchController.initSearchWidget, { once: true });
    searchWidgetNavMenu.searchBarInput.addEventListener("focus", SearchController.initSearchWidget, { once: true });
    searchWidgetNavMenu.searchBarInput.addEventListener("focus", SearchController.handleNavSearchBarFocus);
    searchWidgetNavMenu.searchBarInput.addEventListener("blur", SearchController.handleNavSearchBarBlur);
    searchWidgetNavMenu.searchExitBtn.addEventListener("click", SearchController.exitNavSearch);
})();