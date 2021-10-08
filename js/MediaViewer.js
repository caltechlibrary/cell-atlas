let MediaViewer = function(root) {
    
    let tabContainer = root.querySelector(".media-viewer__tab-container");
    let videoPlayer = root.querySelector(".book-section-video-player");
    let compSlider = root.querySelector(".comp-slider");
    let fullscreenBtn = root.querySelector(".media-viewer__fullscreen-btn");

    let handleTabContainerClick = function(event) {
        let tabBtn = event.target.closest(".media-viewer__tab-btn");
        if(!tabBtn || !tabContainer.contains(tabBtn) || tabBtn.classList.contains("media-viewer__tab-btn-vid--selected")) return;
        let currSelectedBtn = tabContainer.querySelector(".media-viewer__tab-btn-vid--selected");
        let mediaType = tabBtn.getAttribute("value");

        currSelectedBtn.classList.remove("media-viewer__tab-btn-vid--selected");
        tabBtn.classList.add("media-viewer__tab-btn-vid--selected");
        displayMediaType(mediaType);
    };

    let displayMediaType = function(mediaType) {
        if(mediaType == "vid") {
            compSlider.classList.add("comp-slider--hidden");
            videoPlayer.classList.remove("book-section-video-player--hidden");
            fullscreenBtn.classList.add("media-viewer__fullscreen-btn--hidden");
        } else if(mediaType == "img") {
            videoPlayer.classList.add("book-section-video-player--hidden");
            compSlider.classList.remove("comp-slider--hidden");
            fullscreenBtn.classList.remove("media-viewer__fullscreen-btn--hidden");
        }
    };

    let handleFullscreenBtnClick = function(event) {
        let ariaLabel = fullscreenBtn.getAttribute("aria-label");
        if(ariaLabel == "Enter full screen") {
            setFullscreenState("expanded");
        } else {
            setFullscreenState("minimized");
        }
    };

    let setFullscreenState = function(state) {
        let enterFsIcon = fullscreenBtn.querySelector(".media-viewer__enter-fs-icon");
        let exitFsIcon = fullscreenBtn.querySelector(".media-viewer__exit-fs-icon");
        let labelString;
        if(state == "expanded") {
            labelString = "Exit full screen";
            enterFsIcon.classList.add("media-viewer__fullscreen-btn-icon--hidden");
            exitFsIcon.classList.remove("media-viewer__fullscreen-btn-icon--hidden");
        } else if(state == "minimized") {
            exitFsIcon.classList.add("media-viewer__fullscreen-btn-icon--hidden");
            enterFsIcon.classList.remove("media-viewer__fullscreen-btn-icon--hidden");
            labelString = "Enter full screen";
        }
        fullscreenBtn.setAttribute("aria-label", labelString);
        fullscreenBtn.setAttribute("title", labelString);
    };

    if(tabContainer) tabContainer.addEventListener("click", handleTabContainerClick);
    fullscreenBtn.addEventListener("click", handleFullscreenBtnClick);

    return {
        root,
        fullscreenBtn,
        displayMediaType,
        setFullscreenState
    }
};