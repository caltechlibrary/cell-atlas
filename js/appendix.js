// Add event listener for about us page to open feedback form
let feedbackLinks = document.getElementsByClassName("feedbackLink");
for(link of feedbackLinks) {
    link.addEventListener("click", () => {
        // openModal is defined in modal.js
        openModal("feedbackModal");
    });    
}

// Account for scrollbar width in right nav margins
let navRight = document.querySelector(".book-page-nav.book-appendix-nav.book-appendix-nav-right");
if(navRight) {
    addNavRightMargin();
}

function addNavRightMargin() {
    let appendixContainer = document.querySelector(".book-appendix-page");
    let scrollbarWidth = appendixContainer.offsetWidth - appendixContainer.clientWidth;
    let marginRight = parseInt(window.getComputedStyle(navRight).getPropertyValue("margin-right").slice(0, -2));
    navRight.style["margin-right"] = `${marginRight + scrollbarWidth}px`;
}

for(profileBio of document.getElementsByClassName("profile-bio")) {
    let profileImg = profileBio.querySelector(".profile-bio__profile-img");
    let profileDescription = profileBio.querySelector(".profile-bio__description");
    
    let checkForScrollBar = function() {
        if(profileDescription.scrollHeight > parseInt(window.getComputedStyle(profileBio)["max-height"])) {
            profileDescription.style["padding-right"] = `${profileDescription.offsetWidth - profileDescription.clientWidth}px`;
        }
    };

    if(!profileImg || (profileImg && profileImg.complete)) {
        checkForScrollBar();
    } else {
        profileImg.addEventListener("load", checkForScrollBar);
    }
}

if(document.querySelector(".fs-tree-confirm")) {
    let handleCancel = function() {
        fsTreeConfirm.classList.add("fs-tree-confirm--hidden");
    }

    let fsTreeConfirm = document.querySelector(".fs-tree-confirm");
    let cancelBtn = fsTreeConfirm.querySelector(".fs-tree-confirm__cancel-btn");
    cancelBtn.addEventListener("click", handleCancel);
}