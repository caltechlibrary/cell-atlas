// Function that takes id of a modal component and displays it and 
// sets up modal-related event listeners. Requires a modalOverlay element
// to exist on the page
function openModal(modalId) {
    let modal = document.getElementById(modalId);
    let modalOverlay = document.getElementById("modalOverlay");
    let lastFocused = document.activeElement;
    let modalText = modal.querySelector(".subsection-modal-text");
    let qualityChangerDesktop = modal.querySelector(".video-quality-player-control");
    let fullBackground = modal.querySelector(".book-section-comparison-slider-fullscreen-container");

    modalOverlay.style.display = "block";
    modal.style.display = "flex";
    modal.setAttribute("tabindex", 0);
    modal.focus();
    if(modalText) modalText.setAttribute("tabindex", "0");

    if(window.innerWidth > 900) {
        window.addEventListener("resize", computeMaxWidth);
        computeMaxWidth();
    }

    document.addEventListener("focusin", restrictFocus);
    document.addEventListener("keydown", closeModalKey);
    modalOverlay.addEventListener("mousedown", closeModalClick);
    if(modalText) addTypeFocusToggle(modalText);

    function restrictFocus(event) {
        if(!modal.contains(event.target)) {
            event.stopPropagation();
            modal.focus();
        }
    }
    
    function closeModalKey(event) {
        if(event.key === 27 || event.key === "Escape"){
            hideModal();
        } 
    }
    
    function closeModalClick(event) {
        if(event.target == modalOverlay || event.target.classList[0] == "modal-exit-button-mobile"){
            hideModal();
        }
    }

    function hideModal() {
        let modalVideo = modal.querySelector("video");
        if(modalVideo && !modalVideo.paused) modalVideo.pause();
        document.removeEventListener("focusin", restrictFocus);
        document.removeEventListener("keydown", closeModalKey);
        window.removeEventListener("resize", computeMaxWidth);
        modalOverlay.removeEventListener("click", closeModalClick);
        modalOverlay.style.display = "none";
        modal.style.display = "none";
        if(qualityChangerDesktop && qualityChangerDesktop.getAttribute("data-state") == "expanded") {
            let changerContainer = qualityChangerDesktop.querySelector(".video-quality-changer");
            qualityChangerDesktop.setAttribute("data-state", "collapsed");
            changerContainer.style.height = 0;
            changerContainer.style.padding = 0;
        }
        if(modalText) modalText.setAttribute("tabindex", "-1");
        if(fullBackground && window.innerWidth > 900 && fullBackground.getAttribute("data-state") != "failed") {
            let minimizeButton = fullBackground.querySelector(".book-section-comparison-exit-fullscreen-desktop");
            minimizeButton.click();
        }
        lastFocused.focus();
    }

    function computeMaxWidth() {
        if(window.innerWidth > 900) {
            if(window.innerHeight < 900) {
                let maxHeight = modalOverlay.offsetHeight * 0.97
                let fixedMaxWidth = (maxHeight * 1.28) - (maxHeight * 0.1);
                let currentMaxWidth = window.innerWidth * 0.52;
                modal.style["max-width"] = (fixedMaxWidth < currentMaxWidth) ? `${fixedMaxWidth}px` : "52%";
            } else {
                modal.style["max-width"] = "52%";
            }
        }
    }
}