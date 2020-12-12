// Add event listener for about us page to open feedback form
let feedbackLinks = document.getElementsByClassName("feedbackLink");
for(link of feedbackLinks) {
    link.addEventListener("click", () => {
        let subsectionModal = document.getElementById("feedbackModal");
        let modalOverlay = document.getElementById("modalOverlay");
        let lastFocused = document.activeElement;
    
        modalOverlay.style.display = "block";
        subsectionModal.style.display = "flex";
        subsectionModal.setAttribute("tabindex", 0);
        subsectionModal.focus();
    
        document.addEventListener("focusin", restrictFocus);
        document.addEventListener("keydown", closeModalKey);
        modalOverlay.addEventListener("click", closeModalClick);
    
        function restrictFocus(event) {
            if(!subsectionModal.contains(event.target)) {
                event.stopPropagation();
                subsectionModal.focus();
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
            document.removeEventListener("focusin", restrictFocus);
            document.removeEventListener("keydown", closeModalKey);
            modalOverlay.removeEventListener("click", closeModalClick);
            modalOverlay.style.display = "none";
            subsectionModal.style.display = "none";
            lastFocused.focus();
        }
    });    
}

// Account for scrollbar width in right nav margins
let navRight = document.querySelector(".book-page-nav.book-appendix-nav.book-appendix-nav-right");
if(navRight) {
    let appendixContainer = document.querySelector(".book-appendix-page");
    let scrollbarWidth = appendixContainer.offsetWidth - appendixContainer.clientWidth;
    let marginRight = parseInt(window.getComputedStyle(navRight).getPropertyValue("margin-right").slice(0, -2));
    navRight.style["margin-right"] = `${marginRight + scrollbarWidth}px`;
}

// Account for scroll bar width in profile bios
let profileBlurbs = document.getElementsByClassName("book-profile-blurb");
for(blurb of profileBlurbs) {
    // Check if blurb is taller than pictures (267px)
    if(blurb.scrollHeight > 267) {
        let scrollBarWidth = blurb.offsetWidth - blurb.clientWidth;
        blurb.style["padding-right"] = `${scrollBarWidth}px`;
    }
}

function toggleListDropdown(el) {
    let bio = document.getElementById(el.value);
    if(bio.offsetHeight == 0) {
        el.style.transform = "rotate(180deg)";
        bio.style.height = bio.scrollHeight + "px";
    } else {
        el.style.transform = "rotate(0deg)";
        bio.style.height = "0";
    }
}