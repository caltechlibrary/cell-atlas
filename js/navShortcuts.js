(function() {

    let maxSwipeTime = 200;
    let minSwipeDist = 150;
    let vertSwipeThreshold = 100;
    let blacklistedSwipeEls = [".protein-viewer", ".tree-viewer", ".summary-menu", ".comp-slider__slider", ".media-viewer--fullscreen-polyfill"];
    let blacklistedKeyNavEls = [".tree-viewer"];
    let touchStartTime, touchStartX, touchStartY;

    let onDocumentKeydown = function(event) {
        for(let blacklistedKeyNavEl of blacklistedKeyNavEls) if(event.target.closest(blacklistedKeyNavEl)) return;
        if((event.key != "ArrowLeft" && event.key != "ArrowRight") || event.target.tagName == "INPUT") return;
        redirectPage((event.key == "ArrowLeft") ? "prev" : "next");
    };

    let redirectPage = function(page) {
        let link = document.querySelector(`.nav-arrow[data-page='${page}']`);
        if(link) window.location.assign(link.getAttribute("href"));
    };

    let onTouchstart = function(event) {
        touchStartTime = Date.now();
        touchStartX = event.changedTouches[0].clientX;
        touchStartY = event.changedTouches[0].clientY;
    };

    let onTouchend = function(event) {
        let elapsedTime = Date.now() - touchStartTime;
        let distX = touchStartX - event.changedTouches[0].clientX;
        let distY = touchStartY - event.changedTouches[0].clientY;
        if(validateSwipe(event.changedTouches[0], distX, distY, elapsedTime)) redirectPage((distX < 0) ? "prev" : "next");
    };

    let validateSwipe = function(touchObj, distX, distY, elapsedTime) {
        if(document.fullscreenElement) return false;
        if(touchObj.target.tagName == "INPUT") return false;
        for(let blacklistedSwipeEl of blacklistedSwipeEls) {
            if(touchObj.target.closest(blacklistedSwipeEl)) return false;
        }
        if(elapsedTime > maxSwipeTime) return false;
        if(Math.abs(distX) < minSwipeDist) return false;
        if(Math.abs(distY) > vertSwipeThreshold) return false;
        return true;
    };

    document.addEventListener("keydown", onDocumentKeydown);
    document.addEventListener("touchstart", onTouchstart);
    document.addEventListener("touchend", onTouchend);

})();