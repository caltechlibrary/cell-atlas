(function() {
    let mediaViewerEls = document.querySelectorAll(".media-viewer");
    let compSliderEls = document.querySelectorAll(".comp-slider");
    let sectionTextEl = document.querySelector(".section-text");
    let mobileControlsEl = document.querySelector(".mobile-controls");
    let sectionText, mobileControls, mediaViewers = [], compSliders = [];
    let SectionController = {

        shelveText: function() {
            let nonTextSection = document.getElementById("nonTextContent");
            nonTextSection.style.right = "0";
            nonTextSection.style.width = "100%";
            sectionText.shelveText();
        },

        unshelveText: function() {
            let nonTextSection = document.getElementById("nonTextContent");
            nonTextSection.style.right = "62%";
            nonTextSection.style.width = "62%";
            sectionText.unshelveText();
        },

        handleMobileControlTabClick: function(event) {
            let tabBtn = event.currentTarget;
            let nonTextSection = document.getElementById("nonTextContent");
            let textContent = document.querySelector(".section-text");
            let mainMediaViewer = mediaViewers.find(function(mediaViewer) { return mediaViewer.root.classList.contains("media-viewer--main-section") });
            if(tabBtn.value == "text") {
                textContent.classList.remove("section-text--hidden");
                nonTextSection.classList.add("book-section-non-text-content--hidden-mobile");
            } else {
                textContent.classList.add("section-text--hidden");
                nonTextSection.classList.remove("book-section-non-text-content--hidden-mobile");
                if(tabBtn.value == "vid" || tabBtn.value == "img") {
                    mainMediaViewer.displayMediaType(tabBtn.value);
                } else if(tabBtn.value == "sum") {
                    SummaryMenu.resizeMenuContainer();
                }
            }
        }

    };

    for(let mediaViewerEl of mediaViewerEls) mediaViewers.push(MediaViewer(mediaViewerEl));
    for(let compSliderEl of compSliderEls) compSliders.push(CompSlider(compSliderEl));
    sectionText = SectionText(sectionTextEl);
    mobileControls = MobileControls(mobileControlsEl);

    sectionText.shelveBtn.addEventListener("click", SectionController.shelveText);
    sectionText.unshelveBtn.addEventListener("click", SectionController.unshelveText);
    for(let tabBtn of mobileControls.tabBtns) tabBtn.addEventListener("click", SectionController.handleMobileControlTabClick);

    // Need to find a better way to do this
    if(video && window.innerWidth > 900) video.addEventListener("play", SectionController.shelveText, { once: true });
})();