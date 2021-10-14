let MediaViewer = function(root) {
    
    let tabContainer = root.querySelector(".media-viewer__tab-container");
    let mediaContainer = root.querySelector(".media-viewer__media-container");
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
            if(compSlider) compSlider.classList.add("comp-slider--hidden");
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
            setFullscreenBtnState("expanded");
        } else {
            setFullscreenBtnState("minimized");
        }
    };

    let setFullscreenBtnState = function(state) {
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

    let toggleFullscreen = function() {
        if(!root.classList.contains("media-viewer--fullscreen")) {
            displayFullscreen();
        } else {
            exitFullscreen();
        }
    };

    let displayFullscreen = function() {
        root.classList.add("media-viewer--fullscreen");
        tabContainer.classList.add("media-viewer__tab-container--fullscreen");
        mediaContainer.classList.add("media-viewer__media-container--fullscreen");
        if(!compSlider.classList.contains("comp-slider--hidden")) {
            let compSliderBeforeImg = compSlider.querySelector(".comp-slider__before-img");
            compSlider.classList.add("comp-slider--fullscreen");
            compSliderBeforeImg.classList.add("comp-slider__before-img--fullscreen");
        }
        if(root.requestFullscreen) {
            root.requestFullscreen();
        } else {
            root.classList.add("media-viewer--fullscreen-polyfill");
        }
    };

    let exitFullscreen = function() {
        root.classList.remove("media-viewer--fullscreen");
        tabContainer.classList.remove("media-viewer__tab-container--fullscreen");
        mediaContainer.classList.remove("media-viewer__media-container--fullscreen");
        if(!compSlider.classList.contains("comp-slider--hidden")) {
            let compSliderBeforeImg = compSlider.querySelector(".comp-slider__before-img");
            compSlider.classList.remove("comp-slider--fullscreen");
            compSliderBeforeImg.classList.remove("comp-slider__before-img--fullscreen");
        }
        if(root.requestFullscreen) {
            document.exitFullscreen();
        } else {
            root.classList.remove("media-viewer--fullscreen-polyfill");
        }
    };

    let toggleFixedEnlarged = function() {
        if(!mediaContainer.classList.contains("media-viewer__media-container--fixed-enlarged")) {
            displayFixedEnlarged();
        } else {
            minimizeFixedEnlarged();
        }
    };

    let displayFixedEnlarged = function() {
        mediaContainer.classList.add("media-viewer__media-container--fixed-enlarged");
        positionFixedEnlargedSlider();
        window.addEventListener("resize", positionFixedEnlargedSlider);
    };

    let positionFixedEnlargedSlider = function() {
        let headerEl = document.querySelector("header");
        let footerEl = document.querySelector("footer");
        let headerFooterDistance = footerEl.getBoundingClientRect().top - headerEl.getBoundingClientRect().bottom;
        let posTop = headerEl.offsetHeight + (headerFooterDistance / 2);
        let availHeight = headerFooterDistance - 50;
        let availWidth = window.innerWidth - 100;
        let aspectRatio = 16 / 9;
        let desiredWidth = availHeight * aspectRatio;
        if(desiredWidth < availWidth) {
            mediaContainer.style.width = `${desiredWidth}px`;
        } else {
            mediaContainer.style.width = `${availWidth}px`;
        }
        mediaContainer.style.top = `${posTop}px`;
    };

    let minimizeFixedEnlarged = function() {
        mediaContainer.classList.remove("media-viewer__media-container--fixed-enlarged");
        mediaContainer.removeAttribute("style");
        window.removeEventListener("resize", positionFixedEnlargedSlider);
    };

    if(tabContainer) tabContainer.addEventListener("click", handleTabContainerClick);
    fullscreenBtn.addEventListener("click", handleFullscreenBtnClick);

    return {
        root,
        mediaContainer,
        fullscreenBtn,
        displayMediaType,
        setFullscreenBtnState,
        toggleFullscreen,
        toggleFixedEnlarged
    }
};