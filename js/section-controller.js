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
    let sectionNonTextContainer = document.querySelector(".section__non-text-container");
    let sectionStopNarrationButtonMobile = document.querySelector(".section__stop-narration-btn");
    let learnMoreBtns = document.querySelectorAll(".learn-more__btn")
    let hash = window.location.hash.substring(1);
    let summaryMenu, mainMediaViewer, mainNarrationPlayer,
        mediaViewers = {}, videoPlayers = {}, proteinViewers = {},  modals = {}, narrationPlayers = {};
    
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

    let onMainMediaViewerRequestFullscreenChangeCallback = function() {
        if(window.innerWidth < 900) {
            sectionNonTextContainer.classList.toggle("section__non-text-container--fullscreen-polyfill-badfix");
            mainMediaViewer.toggleFullscreen();
        } else {
            if(sectionNonTextContainer.classList.contains("section__non-text-container--expanded")) {
                contractAndUnshelveCallback();
            } else {
                expandAndShelveCallback();
            }
        }
    };

    let handleVideoPlayerQualityChange = function(event) {
        let quality = videoPlayers[event.target.id].qualityChanger.quality();
        window.sessionStorage.setItem("vidQuality", quality);
        for(let id in videoPlayers) {
            if(id != event.target.id) videoPlayers[id].qualityChanger.changeQuality(quality);
        }
    };

    let adjustMainCompSliderMaxHeight = function() {
        let sectionEl = document.querySelector(".section");
        let sectionMediaViewer = document.querySelector(".section__media-viewer");
        let sectionTabContainer = document.querySelector(".section__tab-container");
        let sectionMediaContainer = document.querySelector(".section__media-container");
        let sectionCompSider = document.querySelector(".section__comp-slider");
        let sectionMediaViewerMaxHeightPercent = parseFloat(window.getComputedStyle(sectionMediaViewer)["max-height"]) / 100;
        let totalBorderHeight = parseFloat(window.getComputedStyle(sectionMediaContainer)["borderTopWidth"]) + parseFloat(window.getComputedStyle(sectionMediaContainer)["borderBottomWidth"]);
        let maxHeight = (sectionEl.offsetHeight * sectionMediaViewerMaxHeightPercent) - (sectionTabContainer.offsetHeight + totalBorderHeight);
        sectionCompSider.style["max-width"] = `${maxHeight * (16 / 9)}px`;
    };

    let onSubMediaViewerRequestFullscreenChangeCallback = function(id) {
        if(window.innerWidth < 900) {
            mediaViewers[id].toggleFullscreen();
        } else {
            mediaViewers[id].toggleFixedEnlarged();
        }
        if(mediaViewers[id].root.classList.contains("subsection__media-viewer--protein-viewer")) mediaViewers[id].root.classList.add("subsection__media-viewer--hidden");
    };

    let onMainVideoPlayerFirstPlay = function() {
        if(window.innerWidth >= 900 && !sectionTextEl.classList.contains("section-text--shelved")) {
            expandAndShelveCallback();
        }
    };

    let expandAndShelveCallback = function() {
        sectionTextEl.classList.add("section-text--shelved");
        sectionNonTextContainer.classList.add("section__non-text-container--expanded");

        mainMediaViewer.setFullscreenBtnState("expanded");
        if(summaryMenu) {
            let resizeInterval = setInterval(summaryMenu.resizeMenuContainer, 1000/60);
            sectionNonTextContainer.addEventListener("transitionend", () => clearInterval(resizeInterval));
        }

    };

    let contractAndUnshelveCallback = function() {
        sectionTextEl.classList.remove("section-text--shelved");
        sectionNonTextContainer.classList.remove("section__non-text-container--expanded");

        mainMediaViewer.setFullscreenBtnState("minimized");
        if(summaryMenu) {
            let resizeInterval = setInterval(summaryMenu.resizeMenuContainer, 1000/60);
            sectionNonTextContainer.addEventListener("transitionend", () => clearInterval(resizeInterval));
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

    let onMainNarrationPlayCallback = function() {
        sectionStopNarrationButtonMobile.classList.remove("section__stop-narration-btn--hidden");
    };

    let onMainNarrationPauseCallback = function() {
        sectionStopNarrationButtonMobile.classList.add("section__stop-narration-btn--hidden");
    };

    let handleLearnMoreBtnClick = function(event) {
        let learnMoreBtn = event.currentTarget;
        let modal = modals[learnMoreBtn.value];
        modal.show();
    };

    let onModalOpenCallback = function() {
        let modalEl = document.querySelector(".modal:not(.modal--hidden)");
        let proteinViewer = proteinViewers[`proteinViewer-${modalEl.id}`];

        for(let id in videoPlayers) {
            if(videoPlayers[id].getAttribute("data-main") && !videoPlayers[id].paused()) videoPlayers[id].pause();
        }
        if(!mainNarrationPlayer.audio.paused) mainNarrationPlayer.togglePlayback();
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
            proteinViewer.root.classList.add("subsection__media-viewer--hidden");
            proteinViewer.toggleFixedEnlarged();
            proteinViewer.setFullscreenBtnState("minimized");
        }
        if(videoPlayer && !videoPlayer.paused()) videoPlayer.pause();
        if(narrationPlayer && !narrationPlayer.audio.paused) narrationPlayer.togglePlayback();
    };

    let openProteinViewer = function(event) {
        let id = event.target.value;
        let proteinMediaViewer = mediaViewers[`mediaViewer-pv-${id}`];
        proteinMediaViewer.root.classList.remove("subsection__media-viewer--hidden");
        proteinMediaViewer.setFullscreenBtnState("expanded");
        if(window.innerWidth < 900) {
            proteinMediaViewer.toggleFullscreen();
        } else {
            proteinMediaViewer.toggleFixedEnlarged();
        }
    };

    let onMobileControlClickCallback = function(btnValue) {
        if(btnValue == "text") {
            sectionTextEl.classList.remove("section-text--hidden");
            sectionNonTextContainer.classList.add("section__non-text-container--hidden-mobile");
            mobileControlsEl.classList.add("page__mobile-controls--relative-landscape");
        } else {
            sectionTextEl.classList.add("section-text--hidden");
            sectionNonTextContainer.classList.remove("section__non-text-container--hidden-mobile");
            mobileControlsEl.classList.remove("page__mobile-controls--relative-landscape");
            if(btnValue == "vid" || btnValue == "img") {
                mainMediaViewer.displayMediaType(btnValue);
            } else if(btnValue == "sum") {
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
        let textContent = (modalEl) ? modalEl.querySelector(".subsection__content-container") : sectionTextEl.querySelector(".section-text__content");
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

    for(let videoPlayerEl of videoPlayerEls) {
        let videoPlayer = VideoPlayer(videoPlayerEl);
        videoPlayers[videoPlayer.id()] = videoPlayer;
        if(videoPlayer.getAttribute("data-main")) videoPlayer.one("play", onMainVideoPlayerFirstPlay);
        videoPlayer.on("qualitychange", handleVideoPlayerQualityChange);
    }

    for(let compSliderEl of compSliderEls) CompSlider(compSliderEl);
    
    adjustMainCompSliderMaxHeight();
    window.addEventListener("resize", adjustMainCompSliderMaxHeight);

    for(let proteinViewerEl of proteinViewerEls) {
        proteinViewers[proteinViewerEl.id] = ProteinViewer(proteinViewerEl);
    }

    if(summaryMenuEl) summaryMenu = SummaryMenu(summaryMenuEl);

    for(let mediaViewerEl of mediaViewerEls) {
        if(mediaViewerEl.getAttribute("data-main")) {
            mediaViewers[mediaViewerEl.id] = MediaViewer(mediaViewerEl, onMainMediaViewerRequestFullscreenChangeCallback, onMediaViewerResizeCallback, onMediaViewerMediaSwitchCallback);
            mainMediaViewer = mediaViewers[mediaViewerEl.id];
        } else {
            mediaViewers[mediaViewerEl.id] = MediaViewer(mediaViewerEl, onSubMediaViewerRequestFullscreenChangeCallback, onMediaViewerResizeCallback, onMediaViewerMediaSwitchCallback);
        }
    }
        
    sectionStopNarrationButtonMobile.addEventListener("click", stopMainNarration);

    for(let narrationPlayerEl of narrationPlayerEls) {
        if(narrationPlayerEl.getAttribute("data-main")) {
            narrationPlayers[narrationPlayerEl.id] = NarrationPlayer(narrationPlayerEl, onMainNarrationPlayCallback, onMainNarrationPauseCallback);
            mainNarrationPlayer = narrationPlayers[narrationPlayerEl.id];
        } else {
            narrationPlayers[narrationPlayerEl.id] = NarrationPlayer(narrationPlayerEl);
        }
    };

    SectionText(sectionTextEl, expandAndShelveCallback, contractAndUnshelveCallback, mainNarrationPlayer);

    for(let learnMoreBtn of learnMoreBtns) learnMoreBtn.addEventListener("click", handleLearnMoreBtnClick);

    for(let modalEl of modalEls) {
        let modal = Modal(modalEl, onModalOpenCallback, onModalCloseCallback);
        modals[modal.root.id] = modal;
        if(modalEl.id == hash) modal.show();
    }

    for(let subsectionEl of subsectionEls) Subsection(subsectionEl, onNarrationOpen, onNarrationClose);

    for(let openProteinViewerBtnEl of openProteinViewerBtnEls) openProteinViewerBtnEl.addEventListener("click", openProteinViewer);

    MobileControls(mobileControlsEl, onMobileControlClickCallback);

    document.addEventListener("keydown", onDocumentKeydown);

})();