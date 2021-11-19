(function() {
    let navEl = document.querySelector(".nav");
    let navBtn = document.querySelector(".header__nav-btn");

    let NavController = function() {
        let toggleNav = function() {
            if(nav.root.classList.contains("nav--collapsed")) {
                nav.show();
                if(window.innerWidth > 900) nav.root.querySelector("a").focus();
                window.sessionStorage.setItem("navOpened", true);
                window.addEventListener("click", clickCloseNav);
                window.addEventListener("keydown", keydownCloseNav);
            } else {
                nav.hide();
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

    let navController = NavController();

    nav = NavWidget(navEl);
    navBtn.addEventListener("click", navController.toggleNav);
    if(
        document.querySelector("[aria-current='page']") &&
        document.querySelector("[aria-current='page']").classList.contains("nav__has-section-list") && 
        typeof(Storage) !== "undefined" && 
        window.sessionStorage.getItem("navOpened") == "true"
    ) {
        navController.toggleNav();
    } else {
        window.sessionStorage.setItem("navOpened", false);
    }

})();