(function() {
    let navEl = document.querySelector(".nav");
    let navBtn = document.querySelector(".header__nav-btn");
    let nav;

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

        return {
            toggleNav
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

})();