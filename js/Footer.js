let Footer = function(root) {

    let progressToggle = root.querySelector(".footer__progress-toggle");

    let toggleProgressBar = function() {
        if(progressToggle.getAttribute("aria-checked") == "false") {
            progressToggle.setAttribute("aria-checked", "true");
            progressToggle.classList.add("footer__progress-toggle--on");
        } else {
            progressToggle.setAttribute("aria-checked", "false");
            progressToggle.classList.remove("footer__progress-toggle--on");
        }
    };

    progressToggle.addEventListener("click", toggleProgressBar);

    return {
        root
    }
};