// Function that takes id of a modal component and displays it and 
// sets up modal-related event listeners. Requires a modalOverlay element
// to exist on the page
function openModal(modalId) {
    let modal = document.getElementById(modalId);
    let modalOverlay = document.getElementById("modalOverlay");
    let lastFocused = document.activeElement;

    modalOverlay.style.display = "block";
    modal.style.display = "flex";
    modal.setAttribute("tabindex", 0);
    modal.focus();

    document.addEventListener("focusin", restrictFocus);
    document.addEventListener("keydown", closeModalKey);
    modalOverlay.addEventListener("mousedown", closeModalClick);

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
        console.log("closeModalClick fired from event");
        console.log(event);
        if(event.target == modalOverlay || event.target.classList[0] == "modal-exit-button-mobile"){
            console.log("modalOverlay was clicked. Calling hideModal()");
            hideModal();
        }
    }

    function hideModal() {
        let modalVideo = modal.querySelector("video");
        if(modalVideo && !modalVideo.paused) modalVideo.pause();
        document.removeEventListener("focusin", restrictFocus);
        document.removeEventListener("keydown", closeModalKey);
        modalOverlay.removeEventListener("click", closeModalClick);
        console.log("Making modalOverlay display = none");
        modalOverlay.style.display = "none";
        modal.style.display = "none";
        lastFocused.focus();
    }
}