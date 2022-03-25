let ProgressBar = function(root) {

    let currPosLabel = root.querySelector(".progress-bar__current-position-label");
    let currPosPopUp = root.querySelector(".progress-bar__current-position-popup");
    let hidePopUpTimeout;

    let init = function() {
        let popUpHalfLength = currPosPopUp.getBoundingClientRect().width / 2;
        let currPosLabelDimensions = currPosLabel.getBoundingClientRect();
        if(currPosLabelDimensions.left - popUpHalfLength <= 0) {
            currPosPopUp.classList.add("progress-bar__current-position-popup--left-aligned");
        } else if(currPosLabelDimensions.right + popUpHalfLength >= window.innerWidth) {
            currPosPopUp.classList.add("progress-bar__current-position-popup--right-aligned");
        } else {
            currPosPopUp.classList.add("progress-bar__current-position-popup--centered");
        }
    };

    let showPopUp = function() {
        window.clearTimeout(hidePopUpTimeout);
        currPosPopUp.classList.remove("progress-bar__current-position-popup--hidden");
        window.addEventListener("keydown", forceClosePopUp);
    };

    let forceClosePopUp = function(event) {
        if(event.code == "Escape") hidePopUp();
    };

    let initHidePopUp = function() {
        hidePopUpTimeout = setTimeout(hidePopUp, 500);
    };

    let hidePopUp = function() {
        window.removeEventListener("keydown", forceClosePopUp);
        currPosPopUp.classList.add("progress-bar__current-position-popup--hidden");
    };

    currPosLabel.addEventListener("mouseenter", showPopUp);
    currPosLabel.addEventListener("mouseleave", initHidePopUp);
    currPosLabel.addEventListener("focusin", showPopUp);
    currPosLabel.addEventListener("focusout", hidePopUp);

    init();

    return {
        root
    };
};