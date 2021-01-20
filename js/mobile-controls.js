function addPageContentPadding() {
    let topPadding = document.querySelector("header").offsetHeight;
    let bottomPadding = document.querySelector(".nav-controls-mobile").offsetHeight;
    let contentContainer = document.querySelector(".book-page-content");
    contentContainer.style["padding-top"] = `${topPadding}px`;
    contentContainer.style["padding-bottom"] = `${bottomPadding}px`;
}

function removePageContentPadding() {
    let contentContainer = document.querySelector(".book-page-content");
    contentContainer.style["padding-top"] = "initial";
    contentContainer.style["padding-bottom"] = "initial";
}

function toggleView(el) {
    // Check current state of screen
    let mobileView = window.sessionStorage.getItem("mobileView");
    // If new state requested, switch states
    if(el.value != mobileView || !mobileView) {
        let videoContainer = document.getElementById("nonTextContent");
        let textContainer = document.getElementById("textContent");
        if(el.value == "text") {
            videoContainer.style.display = "none";
            textContainer.style.display = "flex";
            addPageContentPadding();
        } else if(el.value == "video") {
            videoContainer.style.display = "flex";
            textContainer.style.display = "none";
            removePageContentPadding();
        }
    }
}