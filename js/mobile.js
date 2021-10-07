// Global variable to keep track of window width and prevent event listeners that depend
// on window width to fire prematurely
let currWindowWidth = window.innerWidth;
let maxSwipeTime = 200;
let minSwipeDist = 150;
let maxVertSwipe = 100;
let validSwipe = false;

if(window.innerWidth < 900) {
    initializeMobileView();
}

window.addEventListener("resize", function() {
    if(currWindowWidth < 900 && window.innerWidth >= 900) {
        console.log("Terminating mobile view");
        terminateMobileView();
    } else if(currWindowWidth >= 900 && window.innerWidth < 900) {
        console.log("Initializing mobile view");
        initializeMobileView();
    }
    currWindowWidth = window.innerWidth;
});

window.addEventListener("touchstart", detectSwipe);

function initializeMobileView() {
    let textContent = document.querySelector(".section-text");
    let nonTextContent = document.querySelector(".main-non-text-container");
    if(textContent) textContent.removeAttribute("style");
    if(nonTextContent) nonTextContent.removeAttribute("style");
    window.currVideoPlaying = undefined;
    // Video is decalred in section.js and represents the main section video
    if(video) {
        document.addEventListener("fullscreenchange", pauseOnMinimize);
    }

    // All current videos need to be played in fullscreen and use native controls
    let pageVideos = document.querySelectorAll("video");
    for(let pageVideo of pageVideos) {
        pageVideo.addEventListener("play", requestFullscreen);
        pageVideo.setAttribute("preload", "metadata");
        pageVideo.setAttribute("controls", "");
    }

    // Fix height of appendix dropdown lists when the screen is rotated
    window.addEventListener("orientationchange", fixDropdownHeight);
}

function terminateMobileView() {
    window.currVideoPlaying = undefined;
    let textContent = document.querySelector(".section-text");
    let nonTextContent = document.querySelector(".main-non-text-container");
    if(textContent) textContent.removeAttribute("style");
    if(nonTextContent) nonTextContent.removeAttribute("style");
    if(video) {
        document.removeEventListener("fullscreenchange", pauseOnMinimize);
    }

    let pageVideos = document.querySelectorAll("video");
    for(let pageVideo of pageVideos) {
        pageVideo.removeEventListener("play", requestFullscreen);
        pageVideo.removeAttribute("preload");
        pageVideo.removeAttribute("controls");
    }

    window.removeEventListener("orientationchange", fixDropdownHeight);
}

function requestFullscreen(event) {
    if(event.target.requestFullscreen) {
        window.removeEventListener("touchstart", detectSwipe);
        event.target.requestFullscreen();
    }
}

function pauseOnMinimize(event) {
    if (document.fullscreenElement && document.fullscreenElement.tagName == "VIDEO") {
        window.currVideoPlaying = document.fullscreenElement;
    } else if (currVideoPlaying){
        window.currVideoPlaying.pause();
        window.addEventListener("touchstart", detectSwipe);
    }
}

function closeModalMobile(el) {
    let modalOverlay = document.getElementById("modalOverlay");
    modalOverlay.click();
}

function fixDropdownHeight(event) {
    let openLists = document.querySelectorAll(".book-appendix-li-dropdown[showing='true']");
    let openSectionList = document.querySelector(".nav-menu-sections[expanded='true']");
    if(openLists) {
        for(let list of openLists) {
            resizeDropdown(list);
        }
    }
    if(openSectionList) resizeDropdown(openSectionList);
}

function resizeDropdown(element) {
    element.style.height = "auto";
    // Recalculate height for open lists once screen is resized
    window.addEventListener("resize", function(){
        element.style.height = `${element.scrollHeight}px`;
    }, { once: true });
}

function detectSwipe(event) {
    validSwipe = true;
    if(event.touches.length > 1) {
        validSwipe = false;
        return;
    }
    if(
        document.fullscreenElement || 
        document.querySelector(".protein-viewer__fullscreen-container--fs-polyfill") ||
        (document.querySelector(".tree-viewer") && document.querySelector(".tree-viewer").contains(event.target)) ||
        (document.querySelector(".summary-menu") && document.querySelector(".summary-menu").contains(event.target))
    ) {
        validSwipe = false;
        return;
    }
    let imageSliders = document.querySelectorAll(".book-section-comparison-button");
    for(let imageSlider of imageSliders) {
        if(imageSlider.contains(event.target)) {
            return;
        }
    }
    let touchobj = event.changedTouches[0];
    let startX = touchobj.pageX;
    let startY = touchobj.pageY;
    let startTime = new Date().getTime();

    window.addEventListener("touchend", function(event) {
        touchobj = event.changedTouches[0];
        let distX = touchobj.pageX - startX;
        let distY = touchobj.pageY - startY;
        let elaspedTime = new Date().getTime() - startTime;
        if(elaspedTime <= maxSwipeTime) {
            if(validSwipe && Math.abs(distX) >= minSwipeDist && Math.abs(distY) <= maxVertSwipe) {
                let navLink = (distX < 0) ? "next" : "prev";
                let navButton = document.querySelector(`.book-page-nav[data-nav='${navLink}']`);
                if(navButton) navButton.click();
            }
        }

    }, { once: true });
}