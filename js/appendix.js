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
    let list = document.getElementById(el.value);
    if(list.offsetHeight == 0) {
        el.style.transform = "rotate(180deg)";
        list.style.height = list.scrollHeight + "px";
    } else {
        el.style.transform = "rotate(0deg)";
        list.style.height = "0";
    }
}