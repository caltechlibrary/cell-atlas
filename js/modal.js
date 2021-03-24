// Function that takes id of a modal component and displays it and 
// sets up modal-related event listeners. Requires a modalOverlay element
// to exist on the page
function openModal(modalId) {
    let modal = document.getElementById(modalId);
    let modalOverlay = document.getElementById("modalOverlay");
    let lastFocused = document.activeElement;
    let beforeImage = modal.querySelector(".book-section-comparison-before");
    let afterImage = modal.querySelector(".book-section-comparison-after");
    let imageInput = modal.querySelector(".book-section-comparison-range");
    let compSliderContainer = modal.querySelector(".book-section-comparison-slider-container");

    modalOverlay.style.display = "block";
    modal.style.display = "flex";
    modal.setAttribute("tabindex", 0);
    modal.focus();

    document.addEventListener("focusin", restrictFocus);
    document.addEventListener("keydown", closeModalKey);
    modalOverlay.addEventListener("mousedown", closeModalClick);

    if(afterImage && 900 >= window.innerWidth) {
        window.addEventListener("resize", resizeSliderMobile);
    }

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
        window.removeEventListener("resize", resizeSliderMobile);
        modalOverlay.removeEventListener("click", closeModalClick);
        modalOverlay.style.display = "none";
        modal.style.display = "none";
        lastFocused.focus();
    }

    function resizeSliderMobile() {
        console.log("In resizeSliderMobile()");
        if(window.innerWidth >= 480) {
            afterImage.style.left = window.getComputedStyle(beforeImage)["margin-left"];
            let marginLeft = window.getComputedStyle(beforeImage)["margin-left"];
            marginLeft = parseFloat(marginLeft.substring(0, marginLeft.length - 2));
            let newPercentage = imageInput.value - ((marginLeft / compSliderContainer.offsetWidth) * 100);
            if(newPercentage < 0) newPercentage = 0;
            afterImage.style.width = `${newPercentage}%`;
        } else {
            afterImage.style.removeProperty("left");
            afterImage.style.width = `${imageInput.value}%`;
        }
    }
}