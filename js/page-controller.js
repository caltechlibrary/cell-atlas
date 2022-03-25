(function() {
    let navEl = document.querySelector(".nav");
    let navBtn = document.querySelector(".header__nav-btn");
    let searchWidgetHeaderEl = document.querySelector(".search-widget.search-widget--header");
    let searchWidgetNavMenuEl = document.querySelector(".search-widget.search-widget--nav-menu");
    let progressBarEl = document.querySelector(".progress-bar");
    let footerEl = document.querySelector(".footer");
    let nav, searchWidgetHeader, searchWidgetNavMenu, progressBar, footer;

    let PageController = function() {
        let toggleNav = function() {
            if(nav.root.classList.contains("page__nav--collapsed")) {
                nav.root.classList.remove("page__nav--collapsed");
                if(window.innerWidth > 900) nav.root.querySelector("a").focus();
                window.sessionStorage.setItem("navOpened", true);
                window.addEventListener("click", clickCloseNav);
                window.addEventListener("keydown", keydownCloseNav);
            } else {
                nav.root.classList.add("page__nav--collapsed");
                navBtn.focus();
                window.sessionStorage.setItem("navOpened", false);
                window.removeEventListener("click", clickCloseNav);
                window.removeEventListener("keydown", keydownCloseNav);
            }
        };

        let clickCloseNav = function(event) {
            if(!nav.root.contains(event.target) && !navBtn.contains(event.target)) toggleNav();
        };

        let keydownCloseNav = function(event) {
            if(event.code == "Escape") toggleNav();
        };

        let initSearchWidget = function(event) {
            if(event.currentTarget.classList.contains("search-widget__open-btn")) {
                searchWidgetHeader.init();
            } else {
                searchWidgetNavMenu.init();
            }
        };

        let handleNavSearchBarFocus = function(event) {
            let chapterList = document.querySelector(".nav__chapter-list");
            let mobileControlsEl = document.querySelector(".page__mobile-controls");
            nav.root.classList.add("page__nav--searching");
            chapterList.classList.add("nav__chapter-list--searching");
            mobileControlsEl.classList.add("page__mobile-controls--hidden");
        };

        let handleNavSearchBarBlur = function(event) {
            let mobileControlsEl = document.querySelector(".page__mobile-controls");
            if(searchWidgetNavMenu.searchBarInput.value.length == 0) exitNavSearch();
            mobileControlsEl.classList.remove("page__mobile-controls--hidden");
        };

        let exitNavSearch = function() {
            let chapterList = document.querySelector(".nav__chapter-list");
            let mobileControlsEl = document.querySelector(".page__mobile-controls");
            nav.root.classList.remove("page__nav--searching");
            chapterList.classList.remove("nav__chapter-list--searching");
            mobileControlsEl.classList.remove("page__mobile-controls--hidden");
        };

        return {
            toggleNav,
            initSearchWidget,
            handleNavSearchBarFocus,
            handleNavSearchBarBlur,
            exitNavSearch
        };
    };

    let pageController = PageController();

    nav = NavWidget(navEl);
    navBtn.addEventListener("click", pageController.toggleNav);
    if(
        document.querySelector("[aria-current='page']") &&
        document.querySelector("[aria-current='page']").classList.contains("nav__has-section-list") && 
        typeof(Storage) !== "undefined" && 
        window.sessionStorage.getItem("navOpened") == "true"
    ) {
        pageController.toggleNav();
    } else {
        window.sessionStorage.setItem("navOpened", false);
    }

    searchWidgetHeader = SearchWidget(searchWidgetHeaderEl);
    searchWidgetHeader.openBtn.addEventListener("click", pageController.initSearchWidget, { once: true });
    searchWidgetNavMenu = SearchWidget(searchWidgetNavMenuEl);
    searchWidgetNavMenu.searchBarInput.addEventListener("focus", pageController.initSearchWidget, { once: true });
    searchWidgetNavMenu.searchBarInput.addEventListener("focus", pageController.handleNavSearchBarFocus);
    searchWidgetNavMenu.searchBarInput.addEventListener("blur", pageController.handleNavSearchBarBlur);
    searchWidgetNavMenu.searchExitBtn.addEventListener("click", pageController.exitNavSearch);

    if(progressBarEl) progressBar = ProgressBar(progressBarEl);

    footer = Footer(footerEl);

})();