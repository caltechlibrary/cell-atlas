window.addEventListener("orientationchange", fixPadding);

function addPageContentPadding() {
    let topPadding = document.querySelector("header").offsetHeight;
    let bottomPadding = document.querySelector(".page-controls-mobile").offsetHeight;
    let contentContainer = document.querySelector(".book-page-content");
    contentContainer.style["padding-top"] = `${topPadding}px`;
    // Add bottom padding only on portrait
    if(window.innerHeight > window.innerWidth) {
        contentContainer.style["padding-bottom"] = `${bottomPadding}px`;
    } else {
        contentContainer.style["padding-bottom"] = "0";
    }
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
        let bookPageContainer = document.getElementsByClassName("book-page-container")[0];
        if(el.value == "text") {
            videoContainer.style.display = "none";
            textContainer.style.display = "flex";
            bookPageContainer.style.height = "initial";
            if(window.innerHeight < window.innerWidth) {
                let pageControls = document.querySelector(".page-controls-mobile");
                let contentContainer = document.querySelector(".book-page-content");
                pageControls.style.position = "relative";
                contentContainer.style["padding-bottom"] = "0";
            }
            addPageContentPadding();
        } else if(el.value == "video") {
            videoContainer.style.display = "flex";
            textContainer.style.display = "none";
            bookPageContainer.style.height = "100%";
            if(window.innerHeight < window.innerWidth) {
                let pageControls = document.querySelector(".page-controls-mobile");
                pageControls.style.position = "fixed";
            }
            removePageContentPadding();
        }
    }
}

// Recalculate text padding/components on orientation changes
function fixPadding(event) {
    let header = document.querySelector("header");
    let contentContainer = document.querySelector(".book-page-content");
    let textContainer = document.getElementById("textContent");
    let bottomPadding = document.querySelector(".page-controls-mobile").offsetHeight;
    let pageControls = document.querySelector(".page-controls-mobile");

    // Reduce header size and remove bottom padding for landscape
    if(window.innerHeight > window.innerWidth) {
        if(textContainer.style.display == "flex") {
            header.style.height = "56px";
            pageControls.style.position = "relative";
            contentContainer.style["padding-top"] = "56px";
            contentContainer.style["padding-bottom"] = "0";
        }
    } else {
        if(textContainer.style.display == "flex") {
            pageControls.style.position = "fixed";
            contentContainer.style["padding-bottom"] = `${bottomPadding}px`;
        }
    }
}