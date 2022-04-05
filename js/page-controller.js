(function() {
    let headerEl = document.querySelector(".header");
    let navEl = document.querySelector(".nav");
    let navBtn = document.querySelector(".header__nav-btn");
    let searchWidgetEls = document.querySelectorAll(".search-widget");
    let progressBarEl = document.querySelector(".progress-bar");
    let footerEl = document.querySelector(".footer");
    let header, nav, progressBar, footer;

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

        let searchInputFocusCallback = function(event) {
            let mobileControlsEl = document.querySelector(".page__mobile-controls");
            nav.root.classList.add("page__nav--searching");
            mobileControlsEl.classList.add("page__mobile-controls--hidden");
        };

        let searchInputBlurCallback = function(event) {
            let mobileControlsEl = document.querySelector(".page__mobile-controls");
            mobileControlsEl.classList.remove("page__mobile-controls--hidden");
        };

        let searchExitCallback = function() {
            nav.root.classList.remove("page__nav--searching");
        };

        return {
            toggleNav,
            searchInputFocusCallback,
            searchInputBlurCallback,
            searchExitCallback
        };
    };

    let pageController = PageController();

    header = Header(headerEl);

    nav = NavWidget(navEl, pageController.searchInputFocusCallback, pageController.searchInputBlurCallback, pageController.searchExitCallback);
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

    for(let searchWidgetEl of searchWidgetEls) SearchWidget(searchWidgetEl);

    if(progressBarEl) progressBar = ProgressBar(progressBarEl);

    footer = Footer(footerEl);

})();