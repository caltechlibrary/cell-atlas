(function() {
    let headerEl = document.querySelector(".header");
    let navEl = document.querySelector(".nav");
    let navBtn = document.querySelector(".header__nav-btn");
    let searchWidgetEls = document.querySelectorAll(".search-widget");
    let progressBarEl = document.querySelector(".progress-bar");
    let footerEl = document.querySelector(".footer");

    let navBtnClickCallback = function() {
        toggleNav();
    };

    let toggleNav = function() {
        if(navEl.classList.contains("page__nav--collapsed")) {
            navEl.classList.remove("page__nav--collapsed");
            if(window.innerWidth > 900) navEl.querySelector("a").focus();
            window.sessionStorage.setItem("navOpened", true);
            window.addEventListener("click", clickCloseNav);
            window.addEventListener("keydown", keydownCloseNav);
        } else {
            navEl.classList.add("page__nav--collapsed");
            navBtn.focus();
            window.sessionStorage.setItem("navOpened", false);
            window.removeEventListener("click", clickCloseNav);
            window.removeEventListener("keydown", keydownCloseNav);
        }
    };

    let clickCloseNav = function(event) {
        if(!navEl.contains(event.target) && !navBtn.contains(event.target)) toggleNav();
    };

    let keydownCloseNav = function(event) {
        if(event.code == "Escape") toggleNav();
    };

    let searchInputFocusCallback = function(event) {
        let mobileControlsEl = document.querySelector(".page__mobile-controls");
        navEl.classList.add("page__nav--searching");
        mobileControlsEl.classList.add("page__mobile-controls--hidden");
    };

    let searchInputBlurCallback = function(event) {
        let mobileControlsEl = document.querySelector(".page__mobile-controls");
        mobileControlsEl.classList.remove("page__mobile-controls--hidden");
    };

    let searchExitCallback = function() {
        navEl.classList.remove("page__nav--searching");
    };

    Header(headerEl, navBtnClickCallback);

    NavWidget(navEl, searchInputFocusCallback, searchInputBlurCallback, searchExitCallback);
    if(
        document.querySelector("[aria-current='page']") &&
        document.querySelector("[aria-current='page']").classList.contains("nav__has-section-list") && 
        typeof(Storage) !== "undefined" && 
        window.sessionStorage.getItem("navOpened") == "true"
    ) {
        toggleNav();
    } else {
        window.sessionStorage.setItem("navOpened", false);
    }

    for(let searchWidgetEl of searchWidgetEls) SearchWidget(searchWidgetEl);

    if(progressBarEl) ProgressBar(progressBarEl);

    Footer(footerEl);

})();