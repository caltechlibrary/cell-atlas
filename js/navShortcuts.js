(function() {

    let maxSwipeTime = 200;
    let minSwipeDist = 150;
    let vertSwipeThreshold = 100;
    let touchStartTime, touchStartX, touchStartY;

    let onDocumentKeydown = function(event) {
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
        if(elapsedTime <= maxSwipeTime && Math.abs(distX) > minSwipeDist && Math.abs(distY) < vertSwipeThreshold) {
            redirectPage((distX < 0) ? "prev" : "next");
        }
    };

    document.addEventListener("keydown", onDocumentKeydown);
    document.addEventListener("touchstart", onTouchstart);
    document.addEventListener("touchend", onTouchend);

})();