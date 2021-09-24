(function() {
    let mediaViewerEls = document.querySelectorAll(".media-viewer");
    let compSliderEls = document.querySelectorAll(".comp-slider");
    let SectionController = {

        shelveText: function() {
            let nonTextSection = document.getElementById("nonTextContent");
            nonTextSection.style.right = "0";
            nonTextSection.style.width = "100%";
            SectionText.shelveText();
        },

        unshelveText: function() {
            let nonTextSection = document.getElementById("nonTextContent");
            nonTextSection.style.right = "62%";
            nonTextSection.style.width = "62%";
            SectionText.unshelveText();
        }

    };

    SectionText.settings.shelveBtn.addEventListener("click", SectionController.shelveText);
    SectionText.settings.unshelveBtn.addEventListener("click", SectionController.unshelveText);
    for(let mediaViewerEl of mediaViewerEls) MediaViewer(mediaViewerEl);
    for(let compSliderEl of compSliderEls) CompSlider(compSliderEl);
    if(video && window.innerWidth > 900) video.addEventListener("play", SectionController.shelveText, { once: true });
})();