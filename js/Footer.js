let Footer = function(root, progressBar) {

    let progressToggle = root.querySelector(".footer__progress-toggle");

    let init = function() {
        if (typeof(Storage) !== "undefined") {
            let showProgress = window.sessionStorage.getItem("showProgress");
            if(!showProgress || showProgress == "true") toggleProgressBar();
        }
        progressToggle.classList.remove("footer__progress-toggle--uninitialized");
    };

    let toggleProgressBar = function() {
        if(progressToggle.getAttribute("aria-checked") == "false") {
            progressToggle.setAttribute("aria-checked", "true");
            progressToggle.classList.add("footer__progress-toggle--on");
            progressBar.root.classList.remove("progress-bar--shelved");
            window.sessionStorage.setItem("showProgress", true);
        } else {
            progressToggle.setAttribute("aria-checked", "false");
            progressToggle.classList.remove("footer__progress-toggle--on");
            progressBar.root.classList.add("progress-bar--shelved");
            window.sessionStorage.setItem("showProgress", false);
        }
    };

    progressToggle.addEventListener("click", toggleProgressBar);

    init();

    return {
        root
    }
};