// Global variable to keep track of window width and prevent event listeners that depend
// on window width to fire prematurely
let currWindowWidth = window.innerWidth;

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

function initializeMobileView() {
    let textContent = document.querySelector("#textContent");
    let nonTextContent = document.querySelector("#nonTextContent");
    if(textContent) textContent.removeAttribute("style");
    if(nonTextContent) nonTextContent.removeAttribute("style");
    window.currVideoPlaying = undefined;
    // Video is decalred in section.js and represents the main section video
    if(video) {
        video.removeEventListener("play", shelfOnFirstPlay);
        // Add event listener to pause videos when full screen exits
        document.addEventListener("fullscreenchange", pauseOnMinimize);
    }

    // All current videos need to be played in fullscreen
    let pageVideos = document.querySelectorAll("video");
    for(let pageVideo of pageVideos) {
        pageVideo.addEventListener("play", requestFullscreen);
        pageVideo.setAttribute("preload", "metadata");
    }

    // Force "Introduction" title to be smaller font since it is so long
    let chTitle = document.querySelector(".book-chapter-title h1");
    if(chTitle && chTitle.innerText == "Introduction") {
        chTitle.style["font-size"] = "54px";
    }else if(chTitle && chTitle.innerText == "Outlook") {
        let titleContainer = document.querySelector(".book-chapter-text-section");
        titleContainer.style.right = 0;
    }

    // Page controls are always fixed on chapter pages
    if(document.querySelector(".book-chapter-content")) {
        let pageControls = document.querySelector(".page-controls-mobile");
        pageControls.style.position = "fixed";
    }

    // Fix height of appendix dropdown lists when the screen is rotated
    if(document.querySelector(".nav-menu-sections")) {
        window.addEventListener("orientationchange", fixDropdownHeight);
    }

    // Fix height of nav dropdown lists when the screen is rotated
    if(document.querySelector(".nav-menu-sections")) {
        window.addEventListener("orientationchange", fixDropdownHeight);
    }

    // Add controls to all videos
    let allVideos = document.querySelectorAll("video");
    for(let videoEl of allVideos) {
        videoEl.setAttribute("controls", "");
    }

    // Remove comparisson slider if it is showing
    let comparissonContainers = document.querySelectorAll(".book-section-comparison-slider-container");
    for(let comparissonContainer of comparissonContainers) {
        let playerId = comparissonContainer.getAttribute("data-player");
        let videoPlayer = document.querySelector(`.book-section-video-player[data-player='${playerId}'`);
        videoPlayer.style.display = "block";
        comparissonContainer.style.display = "none";
    }

    let sliderContainer = document.querySelector("#nonTextContent .book-section-comparison-slider-container");
    window.addEventListener("resize", function(){
        sliderContainerImgResize(sliderContainer);
    });
}

function terminateMobileView() {
    window.currVideoPlaying = undefined;
    let textContent = document.querySelector("#textContent");
    let nonTextContent = document.querySelector("#nonTextContent");
    let pageControls = document.querySelector(".page-controls-mobile");
    if(textContent) textContent.removeAttribute("style");
    if(nonTextContent) nonTextContent.removeAttribute("style");
    if(pageControls) pageControls.removeAttribute("style");
    if(video) {
        video.addEventListener("play", shelfOnFirstPlay);
        document.removeEventListener("fullscreenchange", pauseOnMinimize);
    }

    let pageVideos = document.querySelectorAll("video");
    for(let pageVideo of pageVideos) {
        pageVideo.removeEventListener("play", requestFullscreen);
        pageVideo.removeAttribute("preload");
    }

    let chTitle = document.querySelector(".book-chapter-title h1");
    if(chTitle && chTitle.innerText == "Introduction") {
        chTitle.removeAttribute("style");
    }else if(chTitle && chTitle.innerText == "Outlook") {
        let titleContainer = document.querySelector(".book-chapter-text-section");
        titleContainer.removeAttribute("style");
    }

    if(document.querySelector(".book-appendix-dropdown-list")) {
        window.removeEventListener("orientationchange", fixDropdownHeight);
    }

    // Add controls to all videos
    let allVideos = document.querySelectorAll("video");
    for(let videoEl of allVideos) {
        videoEl.removeAttribute("controls");
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
    // If new state requested, switch states
    let currSelected = document.querySelector(".page-controls-selected");
    currSelected.classList.remove("page-controls-selected");
    el.classList.add("page-controls-selected");
    let textContent = document.querySelector("#textContent");
    let nonTextContent = document.querySelector("#nonTextContent");
    let pageControls = document.querySelector(".page-controls-mobile");
    let comparisonSliderContainer = nonTextContent.querySelector(".book-section-comparison-slider-container");
    let videoPlayer = nonTextContent.querySelector(".book-section-video-player");
    let qualityChanger = nonTextContent.querySelector(".video-quality-changer");
    if(el.value == "text") {
        textContent.style.display = "flex";
        nonTextContent.style.display = "none";
        // Remove any inline styles from forcing fixed page controls on for videos
        pageControls.removeAttribute("style");
    } else if(el.value == "video") {
        textContent.style.display = "none";
        nonTextContent.style.display = "flex";
        videoPlayer.style.display = "block";
        comparisonSliderContainer.style.display = "none";
        qualityChanger.style.display = "flex";
        closeModalMobile();
        // Video portions of section pages will always have fixed page controls
        pageControls.style.position = "fixed";
    } else if(el.value == "image") {
        textContent.style.display = "none";
        nonTextContent.style.display = "flex";
        comparisonSliderContainer.style.display = "flex";
        videoPlayer.style.display = "none";
        qualityChanger.style.display = "none";
        closeModalMobile();
        // Video portions of section pages will always have fixed page controls
        pageControls.style.position = "fixed";
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
    element.style.height = "0";
    // Recalculate height for open lists once screen is resized
    window.addEventListener("resize", function(){
        setTimeout(function(){
            element.style.height = element.scrollHeight + "px";
        }, 500); 
    }, { once: true });
}

function imageSliderFullscreen(element) {
    let playerId = element.getAttribute("data-player");
    let nonTextContent = document.querySelector("#nonTextContent");
    let sliderContainer = document.querySelector(`.book-section-comparison-slider-container[data-player='${playerId}']`);
    let sliderContainerImg = sliderContainer.querySelector("img");
    let currentSliderState = element.getAttribute("data-state");
    let videoContainer = document.querySelector(".book-section-video-container");
    if(currentSliderState == "fullscreen") {
        element.setAttribute("data-state", "initial");
        nonTextContent.style["z-index"] = "initial";
        nonTextContent.style.background = "initial";
        nonTextContent.style.padding = "56px 1em";
        videoContainer.style["max-height"] = "90%";
        videoContainer.style.display = "flex";
        sliderContainer.classList.remove("book-section-comparison-slider-container-fullscreen");
        sliderContainerImgResize(sliderContainer);
    } else {
        element.setAttribute("data-state", "fullscreen");
        nonTextContent.style["z-index"] = 100;
        nonTextContent.style.background = "#000";
        nonTextContent.style.padding = 0;
        videoContainer.style["max-height"] = "none";
        videoContainer.style.display = "block";
        sliderContainerImg.style.removeProperty("height");
        sliderContainer.classList.add("book-section-comparison-slider-container-fullscreen");
    }
}

function sliderContainerImgResize(sliderContainer) {
    let sliderContainerBtn = sliderContainer.querySelector("button");
    let containerState = sliderContainerBtn.getAttribute("data-state");
    if(containerState == "fullscreen") return;
    let sliderContainerImg = sliderContainer.querySelector("img");
    if(window.innerWidth < 480) {
        sliderContainerImg.style.removeProperty("height");
    } else {
        sliderContainerImg.style.height = `${sliderContainer.scrollHeight}px`;
        setTimeout(function(){
            sliderContainerImg.style.height = `${sliderContainer.scrollHeight}px`;
        }, 400);
    }
}