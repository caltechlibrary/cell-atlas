let ProgressBar = function(root) {

    let labelContainer = root.querySelector(".progress-bar__label-container");
    let progressPopUp = root.querySelector(".progress-bar__progress-pop-up");
    let positionIndicator = root.querySelector(".progress-bar__current-position-indicator");
    let hidePopUpTimeout;

    let init = function() {
        let popUpHalfLength = progressPopUp.getBoundingClientRect().width / 2;
        let positionIndicatorDimensions = positionIndicator.getBoundingClientRect();
        if(positionIndicatorDimensions.left - popUpHalfLength <= 0) {
            progressPopUp.classList.add("progress-bar__progress-pop-up--left-aligned");
        } else if(positionIndicatorDimensions.right + popUpHalfLength >= window.innerWidth) {
            progressPopUp.classList.add("progress-bar__progress-pop-up--right-aligned");
        } else {
            progressPopUp.style.left = `${root.getAttribute("data-percent")}%`;
            progressPopUp.classList.add("progress-bar__progress-pop-up--centered");
        }
    };

    let showPopUp = function() {
        window.clearTimeout(hidePopUpTimeout);
        progressPopUp.classList.remove("progress-bar__progress-pop-up--hidden");
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
        progressPopUp.classList.add("progress-bar__progress-pop-up--hidden");
    };

    labelContainer.addEventListener("mouseenter", showPopUp);
    labelContainer.addEventListener("mouseleave", initHidePopUp);
    labelContainer.addEventListener("focusin", showPopUp);
    labelContainer.addEventListener("focusout", hidePopUp);

    init();

    return {
        root
    };
};