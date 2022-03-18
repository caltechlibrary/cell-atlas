(function() {
    let mediaViewerEls = document.querySelectorAll(".media-viewer");
    let videoPlayerEls = document.querySelectorAll(".video-player");
    let compSliderEls = document.querySelectorAll(".comp-slider");
    let proteinViewerEls = document.querySelectorAll(".protein-viewer");
    let summaryMenuEl = document.querySelector(".summary-menu");
    let sectionTextEl = document.querySelector(".section-text");
    let modalEls = document.querySelectorAll(".modal");
    let subsectionEls = document.querySelectorAll(".subsection");
    let openProteinViewerBtnEls = document.querySelectorAll(".vid-metadata__viewer-btn");
    let narrationPlayerEls = document.querySelectorAll(".narration-player");
    let mobileControlsEl = document.querySelector(".mobile-controls");
    let mainNonTextContainer = document.querySelector(".main-non-text-container");
    let mainStopNarrationButtonMobile = document.querySelector(".main-non-text-container__stop-narration-btn");
    let learnMoreBtnContainer = document.querySelector(".learn-more__btn-container");
    let hash = window.location.hash.substring(1);
    let sectionController, summaryMenu, sectionText, mobileControls, mainMediaViewer, mainNarrationPlayer,
        mediaViewers = {}, videoPlayers = {}, compSliders = {}, proteinViewers = {},  modals = {}, subsections = {}, narrationPlayers = {};
    
    let SectionController = function() {

        let onMediaViewerResizeCallback = function(mediaViewerEl) {
            let file = mediaViewerEl.getAttribute("data-file");
            let proteinViewer = proteinViewers[`proteinViewer-${file}`];
            if(proteinViewer) proteinViewer.resizeViewer();
        };

        let onMediaViewerMediaSwitchCallback = function(mediaViewerEl, mediaType) {
            let file = mediaViewerEl.getAttribute("data-file");
            let videoPlayer = videoPlayers[`videoPlayer-${file}`];
            if(mediaType != "vid" && !videoPlayer.paused()) videoPlayer.pause();
        };

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

        let handleVideoPlayerQualityChange = function(event) {
            let videoPlayer = videoPlayers[event.target.id];
            window.sessionStorage.setItem("vidQuality", videoPlayer.quality_);
            for(let id in videoPlayers) {
                videoPlayers[id].quality_ = videoPlayer.quality_;
                if(id != event.target.id) videoPlayers[id].src(videoPlayers[id].qualities_[videoPlayer.quality_]);
            }
        };

        let handleSubMediaViewerFsBtnClick = function(event) {
            let mediaViewerEl = event.target.closest(".media-viewer");
            let mediaViewer = mediaViewers[mediaViewerEl.id];
            if(window.innerWidth < 900) {
                mediaViewer.toggleFullscreen();
            } else {
                mediaViewer.toggleFixedEnlarged();
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
            if(summaryMenu) {
                let resizeInterval = setInterval(summaryMenu.resizeMenuContainer, 1000/60);
                mainNonTextContainer.addEventListener("transitionend", () => clearInterval(resizeInterval));
            }
        };

        let minimizeMainNonTextContainer = function() {
            if(mainMediaViewer) mainMediaViewer.setFullscreenBtnState("minimized");
            mainNonTextContainer.classList.remove("main-non-text-container--expanded");
            if(summaryMenu) {
                let resizeInterval = setInterval(summaryMenu.resizeMenuContainer, 1000/60);
                mainNonTextContainer.addEventListener("transitionend", () => clearInterval(resizeInterval));
            }
        };

        let onNarrationOpen = function(narrationPlayerEl) {
            let narrationPlayer = narrationPlayers[narrationPlayerEl.id];
            if(!narrationPlayer.initialized) narrationPlayer.init();
        };

        let onNarrationClose = function(narrationPlayerEl) {
            let narrationPlayer = narrationPlayers[narrationPlayerEl.id];
            if(!narrationPlayer.audio.paused) narrationPlayer.togglePlayback();
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
                if(videoPlayers[id].getAttribute("data-main") && !videoPlayers[id].paused()) videoPlayers[id].pause();
            }
            if(!mainNarrationPlayer.audio.paused) mainNarrationPlayer.togglePlayback();
            modal.show();
        };

        let onModalOpenCallback = function() {
            let modalEl = document.querySelector(".modal:not(.modal--hidden)");
            let proteinViewer = proteinViewers[`proteinViewer-${modalEl.id}`];
            if(proteinViewer && !proteinViewer.initialized) proteinViewer.init();
        };

        let onModalCloseCallback = function() {
            let modalEl = document.querySelector(".modal:not(.modal--hidden)");
            let mediaViewer = mediaViewers[`mediaViewer-${modalEl.id}`];
            let proteinViewer = mediaViewers[`mediaViewer-pv-${modalEl.id}`];
            let videoPlayer = videoPlayers[`videoPlayer-${modalEl.id}`];
            let narrationPlayer = narrationPlayers[`narrationPlayer-${modalEl.id}`];
            if(mediaViewer && mediaViewer.mediaContainer.classList.contains("media-viewer__media-container--fixed-enlarged")) {
                mediaViewer.toggleFixedEnlarged();
                mediaViewer.setFullscreenBtnState("minimized");
            }
            if(proteinViewer && proteinViewer.mediaContainer.classList.contains("media-viewer__media-container--fixed-enlarged")) {
                proteinViewer.root.classList.add("subsection__protein-media-viewer--hidden");
                proteinViewer.toggleFixedEnlarged();
                proteinViewer.setFullscreenBtnState("minimized");
            }
            if(videoPlayer && !videoPlayer.paused()) videoPlayer.pause();
            if(narrationPlayer && !narrationPlayer.audio.paused) narrationPlayer.togglePlayback();
        };

        let openProteinViewer = function(event) {
            let id = event.target.value;
            let proteinMediaViewer = mediaViewers[`mediaViewer-pv-${id}`];
            proteinMediaViewer.root.classList.remove("subsection__protein-media-viewer--hidden");
            proteinMediaViewer.setFullscreenBtnState("expanded");
            if(window.innerWidth < 900) {
                proteinMediaViewer.toggleFullscreen();
            } else {
                proteinMediaViewer.toggleFixedEnlarged();
            }
        };

        let closeProteinViewer = function(event) {
            let mediaViewerEl = event.target.closest(".media-viewer");
            let proteinMediaViewer = mediaViewers[mediaViewerEl.id];
            proteinMediaViewer.root.classList.add("subsection__protein-media-viewer--hidden");
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
                    summaryMenu.resizeMenuContainer();
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
            let textContent = (modalEl) ? modalEl.querySelector(".subsection__content-container") : sectionText.root.querySelector(".section-text__content");
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
                    if(videoPlayers[id].getAttribute("data-main")) videoPlayer = videoPlayers[id];
                }
            }
            if(!videoPlayer.hasClass("video-player--hidden")) {
                videoPlayer.paused() ? videoPlayer.play() : videoPlayer.pause();
            }
        };

        return {
            onMediaViewerResizeCallback,
            onMediaViewerMediaSwitchCallback,
            handleMainMediaViewerFsBtnClick,
            handleSubMediaViewerFsBtnClick,
            onMainVideoPlayerFirstPlay,
            handleVideoPlayerQualityChange,
            onNarrationOpen,
            onNarrationClose,
            stopMainNarration,
            showStopNarrationBtn,
            hideStopNarrationBtn,
            shelveText,
            unshelveText,
            handleLearnMoreBtnContainerClick,
            onModalOpenCallback,
            onModalCloseCallback,
            openProteinViewer,
            closeProteinViewer,
            handleMobileControlClick,
            onDocumentKeydown
        };

    };

    sectionController = SectionController();

    for(let videoPlayerEl of videoPlayerEls) {
        let videoPlayer = VideoPlayer(videoPlayerEl);
        videoPlayers[videoPlayer.id()] = videoPlayer;
        if(videoPlayer.getAttribute("data-main")) videoPlayer.one("play", sectionController.onMainVideoPlayerFirstPlay);
        videoPlayer.on("qualitychange", sectionController.handleVideoPlayerQualityChange);
    }

    for(let compSliderEl of compSliderEls) {
        compSliders[compSliderEl.id] = CompSlider(compSliderEl);
    }

    for(let proteinViewerEl of proteinViewerEls) {
        proteinViewers[proteinViewerEl.id] = ProteinViewer(proteinViewerEl);
    }

    if(summaryMenuEl) summaryMenu = SummaryMenu(summaryMenuEl);

    for(let mediaViewerEl of mediaViewerEls) {
        let mediaViewer = MediaViewer(mediaViewerEl, sectionController.onMediaViewerMediaSwitchCallback, sectionController.onMediaViewerResizeCallback);
        mediaViewers[mediaViewerEl.id] = mediaViewer;
        if(mediaViewerEl.getAttribute("data-main")) {
            mainMediaViewer = mediaViewer;
            mediaViewer.fullscreenBtn.addEventListener("click", sectionController.handleMainMediaViewerFsBtnClick);
        } else {
            mediaViewer.fullscreenBtn.addEventListener("click", sectionController.handleSubMediaViewerFsBtnClick);
            if(mediaViewer.root.querySelector(".protein-viewer")) mediaViewer.fullscreenBtn.addEventListener("click", sectionController.closeProteinViewer);
        }
    }
        
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
        let modal = Modal(modalEl, sectionController.onModalOpenCallback, sectionController.onModalCloseCallback);
        modals[modal.root.id] = modal;
        if(modalEl.id == hash) modal.show();
    }

    for(let subsectionEl of subsectionEls) {
        subsections[subsectionEl.id] = Subsection(subsectionEl, sectionController.onNarrationOpen, sectionController.onNarrationClose);
    }

    for(let openProteinViewerBtnEl of openProteinViewerBtnEls) openProteinViewerBtnEl.addEventListener("click", sectionController.openProteinViewer);

    mobileControls = MobileControls(mobileControlsEl);
    mobileControls.root.addEventListener("click", sectionController.handleMobileControlClick);

    document.addEventListener("keydown", sectionController.onDocumentKeydown);

})();