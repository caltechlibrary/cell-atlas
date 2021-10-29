(function() {
    let mediaViewerEls = document.querySelectorAll(".media-viewer");
    let sectionTextEl = document.querySelector(".section-text");
    let modalEls = document.querySelectorAll(".modal");
    let modalOverlay = document.querySelector(".modal-overlay");
    let mobileControlsEl = document.querySelector(".mobile-controls");
    let mainNonTextContainer = document.querySelector(".main-non-text-container");
    let learnMoreBtnContainer = document.querySelector(".learn-more__btn-container");
    let sectionController, sectionText, mobileControls, mainMediaViewer, mediaViewers = {}, modals = {};
    
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
            for(let mediaViewerId in mediaViewers) mediaViewers[mediaViewerId].videoPlayer.changeQuality(quality);
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
            if(!mainMediaViewer.videoPlayer.root.classList.contains("video-player--hidden")) mainMediaViewer.videoPlayer.resizeScrubCanvas();
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

        let handleLearnMoreBtnContainerClick = function(event) {
            if(!event.target.classList.contains("learn-more__btn")) return;
            let learnMoreBtn = event.target;
            if(!mainMediaViewer.videoPlayer.video.paused) mainMediaViewer.videoPlayer.togglePlayBack();
            openModal(learnMoreBtn.value);
        };

        let openModal = function(modalId) {
            let modal = modals[modalId];
            modal.show();
            modalOverlay.classList.remove("modal-overlay--hidden");
        };

        let hideModal = function() {
            let modalEl = modalOverlay.querySelector(".modal:not(.modal--hidden)");
            let modal = modals[modalEl.id];
            modal.hide();
            modalOverlay.classList.add("modal-overlay--hidden");
        };

        let onModalOverlayClick = function(event) {
            let modalEl = modalOverlay.querySelector(".modal:not(.modal--hidden)");
            if(modalEl) {
                let modal = modals[modalEl.id];
                if(!modal.root.contains(event.target)) hideModal();
            }
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
            handleLearnMoreBtnContainerClick,
            hideModal,
            onModalOverlayClick,
            handleMobileControlClick
        };

    };

    sectionController = SectionController();

    for(let mediaViewerEl of mediaViewerEls) {
        let videoPlayerEl = mediaViewerEl.querySelector(".video-player");
        let compSliderEl = mediaViewerEl.querySelector(".comp-slider");
        let proteinViewerEl = mediaViewerEl.querySelector(".protein-viewer");
        let videoPlayer = (videoPlayerEl) ? VideoPlayer(videoPlayerEl) : undefined;
        let compSlider = (compSliderEl) ? CompSlider(compSliderEl) : undefined;
        let proteinViewer = (proteinViewerEl) ? ProteinViewer(proteinViewerEl) : undefined;
        let mediaViewer = MediaViewer(mediaViewerEl, videoPlayer, compSlider, proteinViewer);
        mediaViewers[mediaViewer.root.id] = mediaViewer;
        if(mediaViewer.videoPlayer) {
            for(let qualityOptionInput of mediaViewer.videoPlayer.qualityOptionInputs) qualityOptionInput.addEventListener("input", sectionController.handleVideoPlayerQualityInput);
        }
    }

    mainMediaViewer = mediaViewers["mediaViewer-main"];
    mainMediaViewer.fullscreenBtn.addEventListener("click", sectionController.handleMainMediaViewerFsBtnClick);
    mainMediaViewer.videoPlayer.video.addEventListener("play", sectionController.onMainVideoPlayerFirstPlay, { once: true });
    if(window.createImageBitmap) mainNonTextContainer.addEventListener("transitionend", sectionController.resizeMainPlayerScrubCanvas);

    sectionText = SectionText(sectionTextEl);
    sectionText.shelveBtn.addEventListener("click", sectionController.shelveText);
    sectionText.unshelveBtn.addEventListener("click", sectionController.unshelveText);

    for(let modalEl of modalEls) {
        let mediaViewer = mediaViewers[`mediaViewer-${modalEl.id}`];
        let proteinMediaViewer = mediaViewers[`mediaViewer-pv-${modalEl.id}`];
        let modal = Modal(modalEl, mediaViewer, proteinMediaViewer);
        modal.exitBtn.addEventListener("click", sectionController.hideModal);
        modals[modal.root.id] = modal;
    }
    modalOverlay.addEventListener("click", sectionController.onModalOverlayClick);

    if(learnMoreBtnContainer) learnMoreBtnContainer.addEventListener("click", sectionController.handleLearnMoreBtnContainerClick);

    mobileControls = MobileControls(mobileControlsEl);
    mobileControls.root.addEventListener("click", sectionController.handleMobileControlClick);
})();