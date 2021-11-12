(function() {
    let progressBarEl = document.querySelector(".progress-bar");
    let footerEl = document.querySelector(".footer");
    let progressBar, footer;

    progressBar = ProgressBar(progressBarEl);

    footer = Footer(footerEl, progressBar);
})();