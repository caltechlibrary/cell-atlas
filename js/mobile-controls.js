if(window.innerWidth < 800) {
    window.addEventListener("orientationchange", fixDropdownHeight);
    // Video is decalred in section.js and represents the main section video
    if(video) {
        video.removeEventListener("play", shelfOnFirstPlay);
    }
    // All current videos need to be played in fullscreen
    let pageVideos = document.querySelectorAll("video");
    for(let pageVideo of pageVideos) {
        if(pageVideo.requestFullscreen) {
            pageVideo.addEventListener("play", () => {
                pageVideo.requestFullscreen();
            });
        }
    }
    // Add event listener to pause videos when full screen exits
    let currVideoPlaying;
    if(video && video.requestFullscreen) {
        document.addEventListener('fullscreenchange', (event) => {
            if (document.fullscreenElement) {
                if(document.fullscreenElement.tagName == "VIDEO") {
                    currVideoPlaying = document.fullscreenElement;
                }
            } else {
                if(currVideoPlaying) { 
                    currVideoPlaying.pause();
                }
            }
        });
    }

    // Force "Introduction" title to be smaller font since it is so long
    let chTitle = document.querySelector(".book-chapter-title h1");
    if(chTitle) {
        if(chTitle.innerText == "Introduction") {
            chTitle.style["font-size"] = "54px";
        }
    }
}

// Page controls are always fixed on chapter pages
if(document.querySelector(".book-chapter-content")) {
    let pageControls = document.querySelector(".page-controls-mobile");
    pageControls.style.position = "fixed";
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