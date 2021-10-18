let CompSlider = function(root) {
    
    let beforeImg = root.querySelector(".comp-slider__before-img");
    let beforeSrc = beforeImg.getAttribute("data-src");
    let afterImg = root.querySelector(".comp-slider__after-img");
    let afterImgPreload = document.createElement("img");
    let afterSrc = afterImg.getAttribute("data-src");
    let slider = root.querySelector(".comp-slider__slider");
    let sliderInput = root.querySelector(".comp-slider__input");
    let failMsgContainer = root.querySelector(".comp-slider__fail-msg-container");
    let offline = root.getAttribute("data-offline");

    let init = function() {
        if(offline) {
            // Source images locally if offline
            beforeImg.setAttribute("src", `img/stillimages/${beforeSrc}`);
            afterImg.style["background-image"] = `url(img/stillimages/${afterSrc})`;
        } else {
            // Source images through host if online
            beforeImg.setAttribute("src", `https://www.cellstructureatlas.org/img/stillimages/${beforeSrc}`);
            afterImgPreload.setAttribute("src", `https://www.cellstructureatlas.org/img/stillimages/${afterSrc}`);
        }
        if(root.classList.contains("comp-slider--main-section")) updateBeforeImgMaxHeight();
    };

    let onAfterImagePreloadSuccess = function() {
        afterImgPreload.remove();
        afterImg.style["background-image"] = `url(${afterImgPreload.src})`;
    };

    let displayFailedMsg = function(event) {
        beforeImg.classList.add("comp-slider__before-img--hidden");
        afterImg.classList.add("comp-slider__after-img--hidden");
        slider.classList.add("comp-slider__slider--hidden");
        if(root.classList.contains("comp-slider--main-section")) root.classList.add("comp-slider--main-section-failed");
        failMsgContainer.classList.remove("comp-slider__fail-msg-container--hidden");
    };

    let updateBeforeImgMaxHeight = function() {
        let sectionContainer = document.querySelector(".book-page-nonheader-container");
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
        afterImg.style.width = `${percentage}%`;
    };

    let endImgSliding = function(event) {
        window.removeEventListener("mousemove", onSlide);
        window.removeEventListener("touchmove", onSlide);
        window.removeEventListener("mouseup", endImgSliding);
        window.removeEventListener("touchend", endImgSliding);
    };

    beforeImg.addEventListener("error", displayFailedMsg);
    afterImgPreload.addEventListener("error", displayFailedMsg);
    afterImgPreload.addEventListener("load", onAfterImagePreloadSuccess);
    init();
    if(root.classList.contains("comp-slider--main-section")) window.addEventListener("resize", updateBeforeImgMaxHeight);
    slider.addEventListener("mousedown", initImgSliding);
    slider.addEventListener("touchstart", initImgSliding);
    sliderInput.addEventListener("input", onSliderManualInput);

}