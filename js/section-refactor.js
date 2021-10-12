(function() {
    let mainMediaViewerEl = document.querySelector(".media-viewer.media-viewer--main-section");
    let subMediaViewerEls = document.querySelectorAll(".media-viewer:not(.media-viewer--main-section)");
    let compSliderEls = document.querySelectorAll(".comp-slider");
    let sectionTextEl = document.querySelector(".section-text");
    let mobileControlsEl = document.querySelector(".mobile-controls");
    let mainNonTextContainer = document.querySelector(".main-non-text-container");
    let sectionController, sectionText, mobileControls, mainMediaViewer, subMediaViewers = [], compSliders = [];
    
    let SectionController = function() {

        let handleMainMediaViewerFsBtnClick = function() {
            if(window.innerWidth < 900) {
                if(!mainMediaViewer.root.classList.contains("media-viewer--fullscreen")) {
                    // Need to use "main-non-text-container--fullscreen-polyfill-badfix" because of poorly constructed HTML
                    // Will delete when HTML is structured well
                    mainNonTextContainer.classList.add("main-non-text-container--fullscreen-polyfill-badfix");
                    mainMediaViewer.displayFullscreen();
                } else {
                    // Need to use "main-non-text-container--fullscreen-polyfill-badfix" because of poorly constructed HTML
                    // Will delete when HTML is structured well
                    mainNonTextContainer.classList.remove("main-non-text-container--fullscreen-polyfill-badfix");
                    mainMediaViewer.exitFullscreen();
                }
            } else {
                if(!mainNonTextContainer.classList.contains("main-non-text-container--expanded")) {
                    shelveText();
                } else {
                    unshelveText();
                }
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

        let handleSubMediaViewerFsBtnClick = function(event) {
            let mediaViewerEl = event.currentTarget.closest(".media-viewer");
            if(!mediaViewerEl || !mediaViewerEl.contains(event.currentTarget)) return;
            let subMediaViewer = subMediaViewers.find(function(mediaViewer) { return mediaViewer.root == mediaViewerEl });
            if(window.innerWidth < 900) {
                if(!subMediaViewer.root.classList.contains("media-viewer--fullscreen")) {
                    subMediaViewer.displayFullscreen();
                } else {
                    subMediaViewer.exitFullscreen();
                }
            } else {
                if(!subMediaViewer.mediaContainer.classList.contains("media-viewer__media-container--fixed-enlarged")) {
                    subMediaViewer.displayFixedEnlarged();
                } else {
                    subMediaViewer.minimizeFixedEnlarged();
                }
            }
        };

        let expandMainNonTextContainer = function() {
            mainMediaViewer.setFullscreenState("expanded");
            mainNonTextContainer.classList.add("main-non-text-container--expanded");
        };

        let minimizeMainNonTextContainer = function() {
            mainMediaViewer.setFullscreenState("minimized");
            mainNonTextContainer.classList.remove("main-non-text-container--expanded");
        };

        let shelveTextWidget = function() {
            sectionText.setMainTabIndex(-1);
            if(document.querySelector("body").classList.contains("preload")) {
                // No transitions, add all necessary classes and toggle tabindex at once
                sectionText.root.classList.add("section-text-shelved");
                sectionText.mainContainer.classList.add("section-text__main-container--hidden");
                sectionText.unshelveBtn.classList.remove("section-text__unshelve-btn--hidden");
                sectionText.unshelveBtn.classList.remove("section-text__unshelve-btn--shelved");
                sectionText.unshelveBtn.setAttribute("tabindex", 0);
            } else {
                // Remove any unshelving event listeners
                sectionText.root.removeEventListener("transitionend", onMainContainerTransitionShow);
                sectionText.unshelveBtn.removeEventListener("transitionend", onUnshelveBtnTransitionHide);

                // Event listener to add unshelve button to tab order once it has transitioned on screen
                sectionText.unshelveBtn.addEventListener("transitionend", onUnshelveBtnTransitionShow, { once: true });
                if(sectionText.root.classList.contains("section-text-shelved")) {
                    // Call main container transition end event directly since it is already shelved
                    onMainContainerTransitionHide();
                } else {
                    // Event listener to remove main container visibility and bring out unshelve button once main container has transitioned off screen
                    sectionText.root.addEventListener("transitionend", onMainContainerTransitionHide, { once: true });
                    // Shelve main container to start events
                    sectionText.root.classList.add("section-text-shelved");
                }
            };
        };

        let unShelveTextWidget = function() {
            sectionText.unshelveBtn.setAttribute("tabindex", -1);
            // Check if transitions are enabled
            if(document.querySelector("body").classList.contains("preload")) {
                // No transitions, add all necessary classes and toggle tabindex at once
                sectionText.unshelveBtn.classList.add("section-text__unshelve-btn--shelved");
                sectionText.unshelveBtn.classList.add("section-text__unshelve-btn--hidden");
                sectionText.mainContainer.classList.remove("section-text__main-container--hidden");
                sectionText.root.classList.remove("section-text-shelved");
                sectionText.setMainTabIndex(0);
            } else {
                // Remove any shelving event listeners
                sectionText.root.removeEventListener("transitionend", onMainContainerTransitionHide);
                sectionText.unshelveBtn.removeEventListener("transitionend", onUnshelveBtnTransitionShow);

                // Event listener to add main container elements to tab index once it has transitioned on screen
                sectionText.root.addEventListener("transitionend", onMainContainerTransitionShow, { once: true });
                // If unshelve button is already shelved, skip that css transition step
                if(sectionText.unshelveBtn.classList.contains("section-text__unshelve-btn--shelved")) {
                    // Call unshelve button transition end event directly since it is already shelved
                    onUnshelveBtnTransitionHide();
                } else {
                    // Event listener to remove unshelve button visibility and bring out main container once unshelve button has transitioned off screen
                    sectionText.unshelveBtn.addEventListener("transitionend", onUnshelveBtnTransitionHide, { once: true });
                    // Shelve unshelve button to start events
                    sectionText.unshelveBtn.classList.add("section-text__unshelve-btn--shelved");
                }
            }
        };

        let onMainContainerTransitionHide = function() {
            if(sectionText.root.classList.contains("section-text-shelved")) {
                sectionText.mainContainer.classList.add("section-text__main-container--hidden");
                sectionText.unshelveBtn.classList.remove("section-text__unshelve-btn--hidden");
                sectionText.unshelveBtn.classList.remove("section-text__unshelve-btn--shelved");
            }
        };

        let onUnshelveBtnTransitionShow = function() {
            if(!sectionText.unshelveBtn.classList.contains("section-text__unshelve-btn--shelved")) sectionText.unshelveBtn.setAttribute("tabindex", 0);
        };

        let onUnshelveBtnTransitionHide = function() {
            if(sectionText.unshelveBtn.classList.contains("section-text__unshelve-btn--shelved")) {
                sectionText.unshelveBtn.classList.add("section-text__unshelve-btn--hidden");
                sectionText.mainContainer.classList.remove("section-text__main-container--hidden");
                sectionText.root.classList.remove("section-text-shelved");
            }
        };
    
        let onMainContainerTransitionShow = function() {
            if(!sectionText.root.classList.contains("section-text-shelved")) sectionText.setMainTabIndex(0);
        }

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
            shelveText,
            unshelveText,
            handleSubMediaViewerFsBtnClick,
            handleMobileControlClick
        };

    };

    sectionController = SectionController();
    mainMediaViewer = MediaViewer(mainMediaViewerEl);
    for(let subMediaViewerEl of subMediaViewerEls) subMediaViewers.push(MediaViewer(subMediaViewerEl));
    for(let compSliderEl of compSliderEls) compSliders.push(CompSlider(compSliderEl));
    sectionText = SectionText(sectionTextEl);
    mobileControls = MobileControls(mobileControlsEl);

    mainMediaViewer.fullscreenBtn.addEventListener("click", sectionController.handleMainMediaViewerFsBtnClick);
    for(let subMediaViewer of subMediaViewers) subMediaViewer.fullscreenBtn.addEventListener("click", sectionController.handleSubMediaViewerFsBtnClick);
    sectionText.shelveBtn.addEventListener("click", sectionController.shelveText);
    sectionText.unshelveBtn.addEventListener("click", sectionController.unshelveText);
    mobileControls.root.addEventListener("click", sectionController.handleMobileControlClick);

    // Need to find a better way to do this
    if(video && window.innerWidth > 900) video.addEventListener("play", SectionController.shelveText, { once: true });
})();