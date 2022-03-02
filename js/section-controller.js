(function() {
    let mediaViewerEls = document.querySelectorAll(".media-viewer");
    let videoPlayerEls = document.querySelectorAll(".video-player");
    let sectionTextEl = document.querySelector(".section-text");
    let modalEls = document.querySelectorAll(".modal");
    let narrationPlayerEls = document.querySelectorAll(".narration-player");
    let mobileControlsEl = document.querySelector(".mobile-controls");
    let mainNonTextContainer = document.querySelector(".main-non-text-container");
    let mainStopNarrationButtonMobile = document.querySelector(".main-non-text-container__stop-narration-btn");
    let learnMoreBtnContainer = document.querySelector(".learn-more__btn-container");
    let hash = window.location.hash.substring(1);
    let sectionController, sectionText, mobileControls, mainMediaViewer, mainNarrationPlayer,
        mediaViewers = {}, videoPlayers = {}, modals = {}, narrationPlayers = {};
    
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
            for(let id in videoPlayers) videoPlayers[id].changeQuality(quality);
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
            let modal = modals[learnMoreBtn.value];
            for(let id in videoPlayers) {
                if(videoPlayers[id].root.getAttribute("data-main") && !videoPlayers[id].video.paused) videoPlayers[id].togglePlayBack();
            }
            if(!mainNarrationPlayer.audio.paused) mainNarrationPlayer.togglePlayback();
            modal.show();
        };

        let onModalCloseCallback = function() {
            let modalEl = document.querySelector(".modal:not(.modal--hidden)");
            let videoPlayer = videoPlayers[`videoPlayer-${modalEl.id}`];
            if(videoPlayer && !videoPlayer.video.paused) videoPlayer.togglePlayBack();
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
            let textContent = (modalEl) ? modalEl.querySelector(".modal__content-container") : sectionText.root.querySelector(".section-text__content");
            textContent.focus();
        };

        let handleSpacebarPress = function(event) {
            if(event.target.tagName == "INPUT" || event.target.tagName == "BUTTON") return;
            let modalEl = document.querySelector(".modal:not(.modal--hidden)");
            let videoPlayer;
            if(modalEl) {
                videoPlayer = videoPlayers[`videoPlayer-${modalEl.id}`]
            } else {
                for(let id in videoPlayers) {
                    if(videoPlayers[id].root.getAttribute("data-main")) videoPlayer = videoPlayers[id];
                }
            }
            if(!videoPlayer.root.classList.contains("video-player--hidden")) videoPlayer.togglePlayBack();
        };

        return {
            handleMainMediaViewerFsBtnClick,
            onMainVideoPlayerFirstPlay,
            stopMainNarration,
            showStopNarrationBtn,
            hideStopNarrationBtn,
            handleVideoPlayerQualityInput,
            shelveText,
            unshelveText,
            handleLearnMoreBtnContainerClick,
            onModalCloseCallback,
            handleMobileControlClick,
            onDocumentKeydown
        };

    };

    sectionController = SectionController();

    for(let videoPlayerEl of videoPlayerEls) {
        videoPlayers[videoPlayerEl.id] = VideoPlayer(videoPlayerEl);
        if(videoPlayerEl.getAttribute("data-main")) videoPlayers[videoPlayerEl.id].video.addEventListener("play", sectionController.onMainVideoPlayerFirstPlay, { once: true });
        for(let qualityOptionInput of videoPlayers[videoPlayerEl.id].qualityOptionInputs) qualityOptionInput.addEventListener("input", sectionController.handleVideoPlayerQualityInput);
    }

    for(let mediaViewerEl of mediaViewerEls) {
        let proteinViewerEl = mediaViewerEl.querySelector(".protein-viewer");
        let summaryMenuEl = mediaViewerEl.querySelector(".summary-menu");
        let proteinViewer = (proteinViewerEl) ? ProteinViewer(proteinViewerEl) : undefined;
        let summaryMenu = (summaryMenuEl) ? SummaryMenu(summaryMenuEl) : undefined;
        let resizeCallbacks = (proteinViewer) ? [proteinViewer.resizeViewer] : undefined;
        let mediaViewer = MediaViewer(mediaViewerEl, proteinViewer, summaryMenu, undefined, resizeCallbacks);
        mediaViewers[mediaViewer.root.id] = mediaViewer;
    }

    mainMediaViewer = mediaViewers["mediaViewer-main"];
    mainMediaViewer.fullscreenBtn.addEventListener("click", sectionController.handleMainMediaViewerFsBtnClick);
        
    mainStopNarrationButtonMobile.addEventListener("click", sectionController.stopMainNarration);

    for(let narrationPlayerEl of narrationPlayerEls) {
        let narrationPlayer = NarrationPlayer(narrationPlayerEl);
        narrationPlayers[narrationPlayer.root.id] = narrationPlayer;
    };

    mainNarrationPlayer = narrationPlayers["narrationPlayer-main"];
    if(mainNarrationPlayer) {
        mainNarrationPlayer.audio.addEventListener("play", sectionController.showStopNarrationBtn);
        mainNarrationPlayer.audio.addEventListener("pause", sectionController.hideStopNarrationBtn);
    }

    sectionText = SectionText(sectionTextEl, mainNarrationPlayer);
    sectionText.shelveBtn.addEventListener("click", sectionController.shelveText);
    sectionText.unshelveBtn.addEventListener("click", sectionController.unshelveText);

    if(learnMoreBtnContainer) learnMoreBtnContainer.addEventListener("click", sectionController.handleLearnMoreBtnContainerClick);

    for(let modalEl of modalEls) {
        let mediaViewer = mediaViewers[`mediaViewer-${modalEl.id}`];
        let proteinMediaViewer = mediaViewers[`mediaViewer-pv-${modalEl.id}`];
        let narrationPlayer = narrationPlayers[`narrationPlayer-${modalEl.id}`];
        let modal = Modal(modalEl, mediaViewer, proteinMediaViewer, narrationPlayer, sectionController.onModalCloseCallback);
        modals[modal.root.id] = modal;
        if(modalEl.id == hash) modal.show();
    }

    mobileControls = MobileControls(mobileControlsEl);
    mobileControls.root.addEventListener("click", sectionController.handleMobileControlClick);

    document.addEventListener("keydown", sectionController.onDocumentKeydown);

})();