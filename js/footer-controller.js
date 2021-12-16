(function() {
    let progressBarEl = document.querySelector(".progress-bar");
    let footerEl = document.querySelector(".footer");
    let progressBar, footer;

    if(progressBarEl) progressBar = ProgressBar(progressBarEl);

    footer = Footer(footerEl, progressBar);
})();