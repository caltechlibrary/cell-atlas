window.addEventListener("orientationchange", fixPadding);

function toggleView(el) {
    // Check current state of screen
    let mobileView = window.sessionStorage.getItem("mobileView");
    // If new state requested, switch states
    if(el.value != mobileView || !mobileView) {
        if(el.value == "text") {
            renderText();
        } else if(el.value == "video") {
            renderVideo();
        }
    }
}

function renderText() {
    let videoContainer = document.getElementById("nonTextContent");
    let textContainer = document.getElementById("textContent");
    let bookPageContainer = document.querySelector(".book-page-container");
    let contentContainer = document.querySelector(".book-page-content");
    let topPadding = document.querySelector("header").offsetHeight;

    videoContainer.style.display = "none";
    textContainer.style.display = "flex";
    bookPageContainer.style.height = "initial";
    contentContainer.style["padding-top"] = `${topPadding}px`;
    if(window.innerHeight < window.innerWidth) {
        let pageControls = document.querySelector(".page-controls-mobile");
        let contentContainer = document.querySelector(".book-page-content");
        pageControls.style.position = "relative";
        contentContainer.style["padding-bottom"] = "0";
    } else {
        let bottomPadding = document.querySelector(".page-controls-mobile").offsetHeight;
        contentContainer.style["padding-bottom"] = `${bottomPadding}px`;
    }
}

function renderVideo() {
    let videoContainer = document.getElementById("nonTextContent");
    let textContainer = document.getElementById("textContent");
    let bookPageContainer = document.querySelector(".book-page-container");
    let contentContainer = document.querySelector(".book-page-content");

    videoContainer.style.display = "flex";
    textContainer.style.display = "none";
    bookPageContainer.style.height = "100%";
    contentContainer.style["padding-top"] = "initial";
    contentContainer.style["padding-bottom"] = "initial";
    if(window.innerHeight < window.innerWidth) {
        let pageControls = document.querySelector(".page-controls-mobile");
        pageControls.style.position = "fixed";
    }
}

// Recalculate text padding/components on orientation changes
function fixPadding(event) {
    let textContainer = document.getElementById("textContent");
    if(textContainer.style.display == "flex") {
        let pageControls = document.querySelector(".page-controls-mobile");
        let contentContainer = document.querySelector(".book-page-content");
        if(window.innerHeight > window.innerWidth) {
            pageControls.style.position = "relative";
            contentContainer.style["padding-bottom"] = "0";
        } else {
            let bottomPadding = document.querySelector(".page-controls-mobile").offsetHeight;
            pageControls.style.position = "fixed";
            contentContainer.style["padding-bottom"] = `${bottomPadding}px`;
        }
    }
}