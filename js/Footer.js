let Footer = function(root, progressBar) {

    let progressToggle = root.querySelector(".footer__progress-toggle");

    let toggleProgressBar = function() {
        if(progressToggle.getAttribute("aria-checked") == "false") {
            progressToggle.setAttribute("aria-checked", "true");
            progressToggle.classList.add("footer__progress-toggle--on");
            progressBar.root.classList.remove("progress-bar--shelved");
        } else {
            progressToggle.setAttribute("aria-checked", "false");
            progressToggle.classList.remove("footer__progress-toggle--on");
            progressBar.root.classList.add("progress-bar--shelved");
        }
    };

    progressToggle.addEventListener("click", toggleProgressBar);

    return {
        root
    }
};