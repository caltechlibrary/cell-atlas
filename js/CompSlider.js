let CompSlider = function(root) {
    
    let beforeImg = root.querySelector(".comp-slider__before-img");
    let afterImgContainer = root.querySelector(".comp-slider__after-img-container");
    let afterImg = root.querySelector(".comp-slider__after-img");
    let slider = root.querySelector(".comp-slider__slider");
    let sliderInput = root.querySelector(".comp-slider__input");
    let failMsgContainer = root.querySelector(".comp-slider__fail-msg-container");

    let init = function() {
        if(root.classList.contains("comp-slider--main-section") && window.innerWidth >= 900) updateBeforeImgMaxHeight();
    };

    let displayFailedMsg = function(event) {
        beforeImg.classList.add("comp-slider__before-img--hidden");
        afterImgContainer.classList.add("comp-slider__after-img-container--hidden");
        slider.classList.add("comp-slider__slider--hidden");
        if(root.classList.contains("comp-slider--main-section")) root.classList.add("comp-slider--main-section-failed");
        failMsgContainer.classList.remove("comp-slider__fail-msg-container--hidden");
    };

    let updateBeforeImgMaxHeight = function() {
        let sectionContainer = document.querySelector(".page__content-container");
        let parentMediaContainer = root.parentElement;
        let parentMediaViewer = parentMediaContainer.parentElement;
        let mediaViewerTabContainer = parentMediaViewer.querySelector(".media-viewer__tab-container");
        let mediaViewerMaxHeightPercent = parseFloat(window.getComputedStyle(parentMediaViewer)["max-height"]) / 100;
        let totalBorderHeight = parseFloat(window.getComputedStyle(parentMediaContainer)["borderTopWidth"]) + parseFloat(window.getComputedStyle(parentMediaContainer)["borderBottomWidth"]);
        let maxHeight = (sectionContainer.offsetHeight * mediaViewerMaxHeightPercent) - (mediaViewerTabContainer.offsetHeight + totalBorderHeight);
        beforeImg.style["max-height"] = `${maxHeight}px`;
    };

    let initImgSliding = function(event) {
        event.preventDefault();
        window.addEventListener("mousemove", onSlide);
        window.addEventListener("touchmove", onSlide);
        window.addEventListener("mouseup", endImgSliding);
        window.addEventListener("touchend", endImgSliding);
    };

    let onSliderManualInput = function(event) {
        setCompImgPercentage(sliderInput.value);
    };

    let onSlide = function(event) {
        let boundingRect = root.getBoundingClientRect();
        let pageX = ("pageX" in event) ? event.pageX : event.changedTouches[0].pageX;
        let compSliderPosX, compSliderPercentageX;
        if(pageX < boundingRect.left) {
            compSliderPosX = 0;
        } else if(pageX > boundingRect.right) {
            compSliderPosX = root.offsetWidth;
        } else {
            compSliderPosX = pageX - boundingRect.left;
        }
        compSliderPercentageX = (compSliderPosX / root.offsetWidth) * 100;
        sliderInput.value = compSliderPercentageX;
        setCompImgPercentage(compSliderPercentageX);
    };

    let setCompImgPercentage = function(percentage) {
        slider.style.left = `${percentage}%`;
        afterImgContainer.style.width = `${percentage}%`;
    };

    let endImgSliding = function(event) {
        window.removeEventListener("mousemove", onSlide);
        window.removeEventListener("touchmove", onSlide);
        window.removeEventListener("mouseup", endImgSliding);
        window.removeEventListener("touchend", endImgSliding);
    };

    let toggleFullscreenStyles = function() {
        if(root.classList.contains("comp-slider--fullscreen")) {
            root.classList.remove("comp-slider--fullscreen");
            beforeImg.classList.remove("comp-slider__before-img--fullscreen");
        } else {
            root.classList.add("comp-slider--fullscreen");
            beforeImg.classList.add("comp-slider__before-img--fullscreen");
        }
    };

    let hide = function() {
        root.classList.add("comp-slider--hidden");
    };

    let show = function() {
        root.classList.remove("comp-slider--hidden");
    };

    beforeImg.addEventListener("error", displayFailedMsg);
    afterImg.addEventListener("error", displayFailedMsg);
    init();
    if(root.classList.contains("comp-slider--main-section") && window.innerWidth >= 900) window.addEventListener("resize", updateBeforeImgMaxHeight);
    slider.addEventListener("mousedown", initImgSliding);
    slider.addEventListener("touchstart", initImgSliding);
    sliderInput.addEventListener("input", onSliderManualInput);

    return {
        root,
        toggleFullscreenStyles,
        hide,
        show
    }

}