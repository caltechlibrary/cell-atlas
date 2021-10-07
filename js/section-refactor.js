(function() {
    let mediaViewerEls = document.querySelectorAll(".media-viewer");
    let compSliderEls = document.querySelectorAll(".comp-slider");
    let sectionTextEl = document.querySelector(".section-text");
    let mobileControlsEl = document.querySelector(".mobile-controls");
    let mainNonTextContainer = document.querySelector(".main-non-text-container");
    let sectionController, sectionText, mobileControls, mediaViewers = [], compSliders = [];
    
    let SectionController = function() {

        let shelveText = function() {
            mainNonTextContainer.classList.add("main-non-text-container--expanded");
            shelveTextWidget();
        };

        let unshelveText = function() {
            mainNonTextContainer.classList.remove("main-non-text-container--expanded");
            unShelveTextWidget();
        }

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
                // Event listener to remove main container visibility and bring out unshelve button once main container has transitioned off screen
                sectionText.root.addEventListener("transitionend", onMainContainerTransitionHide, { once: true });
                // Event listener to add unshelve button to tab order once it has transitioned on screen
                sectionText.unshelveBtn.addEventListener("transitionend", onUnshelveBtnTransitionShow, { once: true });
                // Shelve main container to start events
                sectionText.root.classList.add("section-text-shelved");
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
                // Event listener to remove unshelve button visibility and bring out main container once unshelve button has transitioned off screen
                sectionText.unshelveBtn.addEventListener("transitionend", onUnshelveBtnTransitionHide, { once: true });
                // Event listener to add main container elements to tab index once it has transitioned on screen
                sectionText.root.addEventListener("transitionend", onMainContainerTransitionShow, { once: true });
                // Shelve unshelve button to start events
                sectionText.unshelveBtn.classList.add("section-text__unshelve-btn--shelved");
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
            let textContent = document.querySelector(".section-text");
            let mainMediaViewer = mediaViewers.find(function(mediaViewer) { return mediaViewer.root.classList.contains("media-viewer--main-section") });
            if(tabBtn.value == "text") {
                textContent.classList.remove("section-text--hidden");
                mainNonTextContainer.classList.add("main-non-text-container--hidden-mobile");
            } else {
                textContent.classList.add("section-text--hidden");
                mainNonTextContainer.classList.remove("main-non-text-container--hidden-mobile");
                if(tabBtn.value == "vid" || tabBtn.value == "img") {
                    mainMediaViewer.displayMediaType(tabBtn.value);
                } else if(tabBtn.value == "sum") {
                    SummaryMenu.resizeMenuContainer();
                }
            }
        };

        return {
            shelveText,
            unshelveText,
            handleMobileControlClick
        };

    };

    sectionController = SectionController();
    for(let mediaViewerEl of mediaViewerEls) mediaViewers.push(MediaViewer(mediaViewerEl));
    for(let compSliderEl of compSliderEls) compSliders.push(CompSlider(compSliderEl));
    sectionText = SectionText(sectionTextEl);
    mobileControls = MobileControls(mobileControlsEl);

    sectionText.shelveBtn.addEventListener("click", sectionController.shelveText);
    sectionText.unshelveBtn.addEventListener("click", sectionController.unshelveText);
    mobileControls.root.addEventListener("click", sectionController.handleMobileControlClick);

    // Need to find a better way to do this
    if(video && window.innerWidth > 900) video.addEventListener("play", SectionController.shelveText, { once: true });
})();