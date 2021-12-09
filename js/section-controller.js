(function() {
    let mediaViewerEls = document.querySelectorAll(".media-viewer");
    let sectionTextEl = document.querySelector(".section-text");
    let modalEls = document.querySelectorAll(".modal");
    let modalOverlay = document.querySelector(".modal-overlay");
    let narrationPlayerEls = document.querySelectorAll(".narration-player");
    let mobileControlsEl = document.querySelector(".mobile-controls");
    let mainNonTextContainer = document.querySelector(".main-non-text-container");
    let mainStopNarrationButtonMobile = document.querySelector(".main-non-text-container__stop-narration-btn");
    let learnMoreBtnContainer = document.querySelector(".learn-more__btn-container");
    let sectionController, sectionText, mobileControls, mainMediaViewer, mainNarrationPlayer,
        mediaViewers = {}, modals = {}, narrationPlayers = {};
    
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
            for(let mediaViewerId in mediaViewers) {
                if(mediaViewers[mediaViewerId].videoPlayer) mediaViewers[mediaViewerId].videoPlayer.changeQuality(quality);
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
            if(mainMediaViewer.summaryMenu) {
                let resizeInterval = setInterval(mainMediaViewer.summaryMenu.resizeMenuContainer, 1000/60);
                mainNonTextContainer.addEventListener("transitionend", () => clearInterval(resizeInterval));
            }
        };

        let minimizeMainNonTextContainer = function() {
            if(mainMediaViewer) mainMediaViewer.setFullscreenBtnState("minimized");
            mainNonTextContainer.classList.remove("main-non-text-container--expanded");
            if(mainMediaViewer.summaryMenu) {
                let resizeInterval = setInterval(mainMediaViewer.summaryMenu.resizeMenuContainer, 1000/60);
                mainNonTextContainer.addEventListener("transitionend", () => clearInterval(resizeInterval));
            }
        };

        let resizeMainPlayerScrubCanvas = function() {
            if(!mainMediaViewer.videoPlayer.root.classList.contains("video-player--hidden")) mainMediaViewer.videoPlayer.resizeScrubCanvas();
        };

        let stopMainNarration = function() {
            if(!mainNarrationPlayer.audio.paused) mainNarrationPlayer.togglePlayback();
        };

        let showStopNarrationBtn = function() {
            mainStopNarrationButtonMobile.classList.remove("main-non-text-container__stop-narration-btn--hidden");
        };

        let hideStopNarrationBtn = function() {
            mainStopNarrationButtonMobile.classList.add("main-non-text-container__stop-narration-btn--hidden");
        };

        let shelveTextWidget = function() {
            sectionText.root.classList.add("section-text--shelved");
            sectionText.mainContainer.classList.add("section-text__main-container--hidden");
            sectionText.unshelveBtnContainer.classList.remove("section-text__unshelve-btn-container--hidden");
        };

        let unShelveTextWidget = function() {
            sectionText.unshelveBtnContainer.classList.add("section-text__unshelve-btn-container--hidden");
            sectionText.mainContainer.classList.remove("section-text__main-container--hidden");
            sectionText.root.classList.remove("section-text--shelved");
        };

        let handleLearnMoreBtnContainerClick = function(event) {
            if(!event.target.classList.contains("learn-more__btn")) return;
            let learnMoreBtn = event.target;
            if(!mainMediaViewer.videoPlayer.video.paused) mainMediaViewer.videoPlayer.togglePlayBack();
            if(!mainNarrationPlayer.audio.paused) mainNarrationPlayer.togglePlayback();
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
                mobileControls.root.classList.add("mobile-controls--relative-landscape");
            } else {
                sectionTextEl.classList.add("section-text--hidden");
                mainNonTextContainer.classList.remove("main-non-text-container--hidden-mobile");
                mobileControls.root.classList.remove("mobile-controls--relative-landscape");
                if(tabBtn.value == "vid" || tabBtn.value == "img") {
                    mainMediaViewer.displayMediaType(tabBtn.value);
                } else if(tabBtn.value == "sum") {
                    mainMediaViewer.summaryMenu.resizeMenuContainer();
                }
            }
        };

        let onDocumentKeydown = function(event) {
            if(event.key == "ArrowUp" || event.key == "ArrowDown") {
                handleUpDownArrowPress(event);
            } else if (event.key == " ") {
                handleSpacebarPress(event);
            }
        };

        let handleUpDownArrowPress = function(event) {
            if(event.target.tagName == "INPUT") return;
            let modalEl = document.querySelector(".modal:not(.modal--hidden)");
            if(modalEl) {
                modalEl.querySelector(".modal__content-container").focus();
            } else {
                sectionText.root.querySelector(".section-text__content").focus();
            }
        };

        let handleSpacebarPress = function(event) {

        };

        return {
            handleMainMediaViewerFsBtnClick,
            onMainVideoPlayerFirstPlay,
            resizeMainPlayerScrubCanvas,
            stopMainNarration,
            showStopNarrationBtn,
            hideStopNarrationBtn,
            handleVideoPlayerQualityInput,
            shelveText,
            unshelveText,
            handleLearnMoreBtnContainerClick,
            hideModal,
            onModalOverlayClick,
            handleMobileControlClick,
            onDocumentKeydown
        };

    };

    sectionController = SectionController();

    for(let mediaViewerEl of mediaViewerEls) {
        let videoPlayerEl = mediaViewerEl.querySelector(".video-player");
        let compSliderEl = mediaViewerEl.querySelector(".comp-slider");
        let proteinViewerEl = mediaViewerEl.querySelector(".protein-viewer");
        let summaryMenuEl = mediaViewerEl.querySelector(".summary-menu");
        let videoPlayer = (videoPlayerEl) ? VideoPlayer(videoPlayerEl) : undefined;
        let compSlider = (compSliderEl) ? CompSlider(compSliderEl) : undefined;
        let proteinViewer = (proteinViewerEl) ? ProteinViewer(proteinViewerEl) : undefined;
        let summaryMenu = (summaryMenuEl) ? SummaryMenu(summaryMenuEl) : undefined;
        let mediaViewer = MediaViewer(mediaViewerEl, videoPlayer, compSlider, proteinViewer, summaryMenu, undefined);
        mediaViewers[mediaViewer.root.id] = mediaViewer;
    }

    for(let mediaViewerId in mediaViewers) {
        if(!mediaViewers[mediaViewerId].videoPlayer) continue;
        for(let qualityOptionInput of mediaViewers[mediaViewerId].videoPlayer.qualityOptionInputs) {
            qualityOptionInput.addEventListener("input", sectionController.handleVideoPlayerQualityInput);
        }
    }

    mainMediaViewer = mediaViewers["mediaViewer-main"];
    mainMediaViewer.fullscreenBtn.addEventListener("click", sectionController.handleMainMediaViewerFsBtnClick);
    if(mainMediaViewer.videoPlayer) mainMediaViewer.videoPlayer.video.addEventListener("play", sectionController.onMainVideoPlayerFirstPlay, { once: true });
    
    if(window.createImageBitmap && mainMediaViewer.videoPlayer) mainNonTextContainer.addEventListener("transitionend", sectionController.resizeMainPlayerScrubCanvas);
    mainStopNarrationButtonMobile.addEventListener("click", sectionController.stopMainNarration);

    for(let narrationPlayerEl of narrationPlayerEls) {
        let narrationPlayer = NarrationPlayer(narrationPlayerEl);
        narrationPlayers[narrationPlayer.root.id] = narrationPlayer;
    };

    mainNarrationPlayer = narrationPlayers["narrationPlayer-main"];
    mainNarrationPlayer.audio.addEventListener("play", sectionController.showStopNarrationBtn);
    mainNarrationPlayer.audio.addEventListener("pause", sectionController.hideStopNarrationBtn);

    sectionText = SectionText(sectionTextEl, mainNarrationPlayer);
    sectionText.shelveBtn.addEventListener("click", sectionController.shelveText);
    sectionText.unshelveBtn.addEventListener("click", sectionController.unshelveText);

    if(learnMoreBtnContainer) learnMoreBtnContainer.addEventListener("click", sectionController.handleLearnMoreBtnContainerClick);

    modalOverlay.addEventListener("click", sectionController.onModalOverlayClick);

    for(let modalEl of modalEls) {
        let mediaViewer = mediaViewers[`mediaViewer-${modalEl.id}`];
        let proteinMediaViewer = mediaViewers[`mediaViewer-pv-${modalEl.id}`];
        let narrationPlayer = narrationPlayers[`narrationPlayer-${modalEl.id}`];
        let modal = Modal(modalEl, mediaViewer, proteinMediaViewer, narrationPlayer);
        modal.exitBtn.addEventListener("click", sectionController.hideModal);
        modals[modal.root.id] = modal;
    }

    mobileControls = MobileControls(mobileControlsEl);
    mobileControls.root.addEventListener("click", sectionController.handleMobileControlClick);

    document.addEventListener("keydown", sectionController.onDocumentKeydown);

})();