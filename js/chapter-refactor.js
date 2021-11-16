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
                window.addEventListener("click", clickCloseNav);
                window.addEventListener("keydown", keydownCloseNav);
            } else {
                nav.hide();
                navBtn.focus();
                window.removeEventListener("click", clickCloseNav);
                window.removeEventListener("keydown", keydownCloseNav);
            }
        };

        return {
            toggleNav
        };

    };

    let chapterController = ChapterController();

    nav = NavWidget(navEl);
    navBtn.addEventListener("click", chapterController.toggleNav);

    progressBar = ProgressBar(progressBarEl);

    footer = Footer(footerEl, progressBar);
})();