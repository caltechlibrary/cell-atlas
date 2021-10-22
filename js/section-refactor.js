(function() {
    let mediaViewerEls = document.querySelectorAll(".media-viewer");
    let sectionTextEl = document.querySelector(".section-text");
    let mobileControlsEl = document.querySelector(".mobile-controls");
    let mainNonTextContainer = document.querySelector(".main-non-text-container");
    let sectionController, sectionText, mobileControls, mainMediaViewer, mainVideoPlayer,
        mediaViewers = [], videoPlayers = [];
    
    let SectionController = function() {

        let handleMainMediaViewerFsBtnClick = function() {
            if(window.innerWidth < 900) {
                if(!mainMediaViewer.root.classList.contains("media-viewer--fullscreen")) {
                    // Need to use "main-non-text-container--fullscreen-polyfill-badfix" because of poorly constructed HTML
                    // Will delete when HTML is structured well
                    mainNonTextContainer.classList.add("main-non-text-container--fullscreen-polyfill-badfix");
                } else {
                    // Need to use "main-non-text-container--fullscreen-polyfill-badfix" because of poorly constructed HTML
                    // Will delete when HTML is structured well
                    mainNonTextContainer.classList.remove("main-non-text-container--fullscreen-polyfill-badfix");
                }
                mainMediaViewer.toggleFullscreen();
            } else {
                if(!mainNonTextContainer.classList.contains("main-non-text-container--expanded")) {
                    shelveText();
                } else {
                    unshelveText();
                }
            }
        };

        let handleSubMediaViewerFsBtnClick = function(event) {
            let subMediaViewer = mediaViewers.find(function(mediaViewer) { return mediaViewer.fullscreenBtn == event.currentTarget });
            if(window.innerWidth < 900) {
                subMediaViewer.toggleFullscreen();
            } else {
                subMediaViewer.toggleFixedEnlarged();
            }
        };

        let onMainVideoPlayerFirstPlay = function() {
            if(
                window.getComputedStyle(sectionText.shelveBtn).display != "none" && 
                !sectionText.mainContainer.classList.contains("section-text__main-container--hidden")
            ) {
                shelveText();
            }
        };

        let handleVideoPlayerQualityInput = function(event) {
            let quality = event.target.value;
            for(let videoPlayer of videoPlayers) {
                videoPlayer.changeQuality(quality);
            }
            window.sessionStorage.setItem("vidQuality", quality);
        };

        let shelveText = function() {
            expandMainNonTextContainer();
            shelveTextWidget();
        };

        let unshelveText = function() {
            minimizeMainNonTextContainer();
            unShelveTextWidget();
        };

        let expandMainNonTextContainer = function() {
            mainNonTextContainer.classList.add("main-non-text-container--expanded");
            if(mainMediaViewer) mainMediaViewer.setFullscreenBtnState("expanded");
        };

        let resizeMainPlayerScrubCanvas = function() {
            if(!mainVideoPlayer.root.classList.contains("video-player--hidden")) mainVideoPlayer.resizeScrubCanvas();
        };

        let minimizeMainNonTextContainer = function() {
            if(mainMediaViewer) mainMediaViewer.setFullscreenBtnState("minimized");
            mainNonTextContainer.classList.remove("main-non-text-container--expanded");
        };

        let shelveTextWidget = function() {
            sectionText.setMainTabIndex(-1);

            // Add classess to determine visual order that transitions happen
            sectionText.root.classList.remove("section-text--transition-delay");
            sectionText.root.classList.add("section-text--transition-instant");
            sectionText.mainContainer.classList.remove("section-text__main-container-transition-instant");
            sectionText.mainContainer.classList.add("section-text__unshelve-btn--transition-delay");
            sectionText.unshelveBtn.classList.remove("section-text__unshelve-btn--transition-instant");
            sectionText.unshelveBtn.classList.add("section-text__unshelve-btn--transition-delay");

            sectionText.root.classList.add("section-text--shelved");
            sectionText.mainContainer.classList.add("section-text__main-container--hidden");
            sectionText.unshelveBtn.classList.remove("section-text__unshelve-btn--hidden");
            sectionText.unshelveBtn.setAttribute("tabindex", 0);
        };

        let unShelveTextWidget = function() {
            sectionText.unshelveBtn.setAttribute("tabindex", -1);

            // Add classess to determine visual order that transitions happen
            sectionText.root.classList.remove("section-text--transition-instant");
            sectionText.root.classList.add("section-text--transition-delay");
            sectionText.mainContainer.classList.remove("section-text__main-container-transition-instant");
            sectionText.mainContainer.classList.add("section-text__unshelve-btn--transition-delay");
            sectionText.unshelveBtn.classList.remove("section-text__unshelve-btn--transition-delay");
            sectionText.unshelveBtn.classList.add("section-text__unshelve-btn--transition-instant");
            
            sectionText.unshelveBtn.classList.add("section-text__unshelve-btn--hidden");
            sectionText.mainContainer.classList.remove("section-text__main-container--hidden");
            sectionText.root.classList.remove("section-text--shelved");
            sectionText.setMainTabIndex(0);
        };

        let handleMobileControlClick = function(event) {
            let tabBtn = event.target.closest(".mobile-controls__btn");
            if(!tabBtn || !mobileControls.root.contains(tabBtn)) return;
            if(tabBtn.value == "text") {
                sectionTextEl.classList.remove("section-text--hidden");
                mainNonTextContainer.classList.add("main-non-text-container--hidden-mobile");
                mobileControls.root.classList.add("mobile-controls--section-text");
            } else {
                sectionTextEl.classList.add("section-text--hidden");
                mainNonTextContainer.classList.remove("main-non-text-container--hidden-mobile");
                mobileControls.root.classList.remove("mobile-controls--section-text");
                if(tabBtn.value == "vid" || tabBtn.value == "img") {
                    mainMediaViewer.displayMediaType(tabBtn.value);
                } else if(tabBtn.value == "sum") {
                    SummaryMenu.resizeMenuContainer();
                }
            }
        };

        return {
            handleMainMediaViewerFsBtnClick,
            onMainVideoPlayerFirstPlay,
            resizeMainPlayerScrubCanvas,
            handleVideoPlayerQualityInput,
            shelveText,
            unshelveText,
            handleSubMediaViewerFsBtnClick,
            handleMobileControlClick
        };

    };

    sectionController = SectionController();

    for(let mediaViewerEl of mediaViewerEls) {
        let videoPlayerEl = mediaViewerEl.querySelector(".video-player");
        let compSliderEl = mediaViewerEl.querySelector(".comp-slider");
        let videoPlayer = (videoPlayerEl) ? VideoPlayer(videoPlayerEl) : undefined;
        let compSlider = (compSliderEl) ? CompSlider(compSliderEl) : undefined;
        let mediaViewer;
        if(videoPlayer) {
            videoPlayers.push(videoPlayer);
            for(let qualityOptionInput of videoPlayer.qualityOptionInputs) qualityOptionInput.addEventListener("input", sectionController.handleVideoPlayerQualityInput);
            if(videoPlayer.root.classList.contains("video-player--main-section")) {
                videoPlayer.video.addEventListener("play", sectionController.onMainVideoPlayerFirstPlay, { once: true });
                if(window.createImageBitmap) mainNonTextContainer.addEventListener("transitionend", sectionController.resizeMainPlayerScrubCanvas);
                mainVideoPlayer = videoPlayer;
            }
        }
        mediaViewer = MediaViewer(mediaViewerEl, videoPlayer, compSlider);
        if(mediaViewer.root.classList.contains("media-viewer--main-section")) {
            mediaViewer.fullscreenBtn.addEventListener("click", sectionController.handleMainMediaViewerFsBtnClick);
            mainMediaViewer = mediaViewer;
        } else {
            mediaViewer.fullscreenBtn.addEventListener("click", sectionController.handleSubMediaViewerFsBtnClick);
        }
        mediaViewers.push(mediaViewer);
    }

    sectionText = SectionText(sectionTextEl);
    sectionText.shelveBtn.addEventListener("click", sectionController.shelveText);
    sectionText.unshelveBtn.addEventListener("click", sectionController.unshelveText);

    mobileControls = MobileControls(mobileControlsEl);
    mobileControls.root.addEventListener("click", sectionController.handleMobileControlClick);
})();