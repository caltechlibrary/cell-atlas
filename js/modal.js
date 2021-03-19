// Function that takes id of a modal component and displays it and 
// sets up modal-related event listeners. Requires a modalOverlay element
// to exist on the page
function openModal(modalId) {
    let modal = document.getElementById(modalId);
    let modalOverlay = document.getElementById("modalOverlay");
    let lastFocused = document.activeElement;
    let modalText = modal.querySelector(".subsection-modal-text");

    modalOverlay.style.display = "block";
    modal.style.display = "flex";
    modal.setAttribute("tabindex", 0);
    modal.focus();
    modalText.setAttribute("tabindex", "0");

    document.addEventListener("focusin", restrictFocus);
    document.addEventListener("keydown", closeModalKey);
    modalOverlay.addEventListener("click", closeModalClick);
    modalText.addEventListener("mousedown", function() {
        modalText.classList.add("book-section-video-player-controls-mouse-focus");
    });
    modalText.addEventListener("keydown", function() {
        modalText.classList.remove("book-section-video-player-controls-mouse-focus"); 
    });

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
        if(event.target == modalOverlay){
            hideModal();
        }
    }

    function hideModal() {
        let modalVideo = modal.querySelector("video");
        if(modalVideo && !modalVideo.paused) modalVideo.pause();
        document.removeEventListener("focusin", restrictFocus);
        document.removeEventListener("keydown", closeModalKey);
        modalOverlay.removeEventListener("click", closeModalClick);
        modalOverlay.style.display = "none";
        modal.style.display = "none";
        modalText.setAttribute("tabindex", "-1");
        lastFocused.focus();
    }
}