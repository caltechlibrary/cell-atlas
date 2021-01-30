if(window.innerWidth < 900) {
    initializeMobileView();
}

window.addEventListener("resize", function() {
    if(window.innerWidth >= 900) {
        terminateMobileView();
    } else {
        initializeMobileView();
    }
});

function initializeMobileView() {
    window.currVideoPlaying = undefined;
    // Video is decalred in section.js and represents the main section video
    if(video) {
        video.removeEventListener("play", shelfOnFirstPlay);
        // Add event listener to pause videos when full screen exits
        document.addEventListener('fullscreenchange', pauseOnMinimize);
    }

    // All current videos need to be played in fullscreen
    let pageVideos = document.querySelectorAll("video");
    for(let pageVideo of pageVideos) {
        pageVideo.addEventListener("play", requestFullscreen);
    }

    // Force "Introduction" title to be smaller font since it is so long
    let chTitle = document.querySelector(".book-chapter-title h1");
    if(chTitle && chTitle.innerText == "Introduction") {
        chTitle.style["font-size"] = "54px";
    }

    // Page controls are always fixed on chapter pages
    if(document.querySelector(".book-chapter-content")) {
        let pageControls = document.querySelector(".page-controls-mobile");
        pageControls.style.position = "fixed";
    }

    // Fix height of appendix dropdown lists when the screen is rotated
    if(document.querySelector(".book-appendix-dropdown-list")) {
        window.addEventListener("orientationchange", fixDropdownHeight);
    }
}

function requestFullscreen(event) {
    if(event.target.requestFullscreen) {
        event.target.requestFullscreen();
    }
}

function pauseOnMinimize(event) {
    if (document.fullscreenElement && document.fullscreenElement.tagName == "VIDEO") {
        currVideoPlaying = document.fullscreenElement;
    } else if (currVideoPlaying){
        currVideoPlaying.pause();
    }
}

function toggleView(el) {
    // Check current state of screen
    let mobileView = window.sessionStorage.getItem("mobileView");
    // If new state requested, switch states
    if(el.value != mobileView || !mobileView) {
        let currSelected = document.querySelector(".page-controls-selected");
        currSelected.classList.remove("page-controls-selected");
        el.classList.add("page-controls-selected");
        let textContent = document.querySelector("#textContent");
        let nonTextContent = document.querySelector("#nonTextContent");
        let pageControls = document.querySelector(".page-controls-mobile");
        if(el.value == "text") {
            textContent.style.display = "flex";
            nonTextContent.style.display = "none";
            // Remove any inline styles from forcing fixed page controls on for videos
            pageControls.removeAttribute("style");
        } else if(el.value == "video") {
            textContent.style.display = "none";
            nonTextContent.style.display = "block";
            closeModalMobile();
            // Video portions of section pages will always have fixed page controls
            pageControls.style.position = "fixed";
        }
    }
}

function closeModalMobile(el) {
    let modalOverlay = document.getElementById("modalOverlay");
    modalOverlay.click();
}

function fixDropdownHeight(event) {
    let openLists = document.querySelectorAll(".book-appendix-li-dropdown[showing='true']");
    for(let list of openLists) {
        list.style.height = "0";
    } 
    // Recalculate height for open lists once screen is resized
    window.addEventListener("resize", function(){
        for(let list of openLists) {
            setTimeout(function(){
                list.style.height = list.scrollHeight + "px";
            }, 500);
        } 
    }, { once: true });
}