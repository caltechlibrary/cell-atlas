let MediaViewer = function(root) {
    let tabContainer = root.querySelector(".media-viewer__tab-container");
    let videoPlayer = root.querySelector(".book-section-video-player");
    let compSlider = root.querySelector(".book-section-comparison-slider-fullscreen-container");

    let handleTabContainerClick = function(event) {
        let tabBtn = event.target.closest(".media-viewer__tab-btn");
        if(!tabBtn || !tabContainer.contains(tabBtn) || tabBtn.classList.contains("media-viewer__tab-btn-vid--selected")) return;
        let currSelectedBtn = tabContainer.querySelector(".media-viewer__tab-btn-vid--selected");
        let mediaType = tabBtn.getAttribute("value");

        currSelectedBtn.classList.remove("media-viewer__tab-btn-vid--selected");
        tabBtn.classList.add("media-viewer__tab-btn-vid--selected");
        if(mediaType == "vid") {
            compSlider.classList.add("book-section-comparison-slider-fullscreen-container--hidden");
            videoPlayer.classList.remove("book-section-video-player--hidden");
        } else if(mediaType == "img") {
            videoPlayer.classList.add("book-section-video-player--hidden");
            compSlider.classList.remove("book-section-comparison-slider-fullscreen-container--hidden");
        }
    };

    tabContainer.addEventListener("click", handleTabContainerClick);
};