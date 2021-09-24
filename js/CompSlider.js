let CompSlider = function(root) {
    
    let beforeImg = root.querySelector(".comp-slider__before-img");
    let beforeSrc = beforeImg.getAttribute("data-src");
    let afterImg = root.querySelector(".comp-slider__after-img");
    let afterSrc = afterImg.getAttribute("data-src");
    let offline = root.getAttribute("data-offline");

    let init = function() {
        if(offline) {
            // Source images locally if offline
            beforeImg.setAttribute("src", `img/stillimages/${beforeSrc}`);
            afterImg.style["background-image"] = `url(img/stillimages/${afterSrc})`;
        } else {
            // Source images through host if online
            beforeImg.setAttribute("src", `https://www.cellstructureatlas.org/img/stillimages/${beforeSrc}`);
            afterImg.style["background-image"] = `url(https://www.cellstructureatlas.org/img/stillimages/${afterSrc})`;
        }
        if(root.classList.contains("comp-slider--main-section")) updateBeforeImgMaxHeight();
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
    }

    init();
    if(root.classList.contains("comp-slider--main-section")) window.addEventListener("resize", updateBeforeImgMaxHeight);

}