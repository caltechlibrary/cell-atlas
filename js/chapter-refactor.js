(function() {
    let navEl = document.querySelector(".nav");
    let navBtn = document.querySelector(".header__nav-btn");
    let progressBarEl = document.querySelector(".progress-bar");
    let footerEl = document.querySelector(".footer");
    let progressBar, footer;

    let ChapterController = function() {

        let toggleNav = function() {
            if(nav.root.classList.contains("nav--collapsed")) {
                nav.show();
                nav.root.querySelector("a").focus();
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

    let chapterController = ChapterController();

    nav = NavWidget(navEl);
    navBtn.addEventListener("click", chapterController.toggleNav);
    if(typeof(Storage) !== "undefined" && window.sessionStorage.getItem("navOpened") == "true") chapterController.toggleNav();

    progressBar = ProgressBar(progressBarEl);

    footer = Footer(footerEl, progressBar);
})();