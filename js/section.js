let sectionTextMaterial = document.querySelector(".section-text__content");
if(sectionTextMaterial) addTypeFocusToggle(sectionTextMaterial);

let comparisonVideoButtons = document.querySelectorAll(".book-section-comparison-button-container button");
for(let comparisonVideoButton of comparisonVideoButtons) {
    addTypeFocusToggle(comparisonVideoButton);
}

document.addEventListener("keydown", function(event) {
    let focusedElement = document.activeElement;

    if(event.key === "ArrowLeft" || event.key === "ArrowRight") {
        if(focusedElement.tagName == "INPUT") return;
        let direction = (event.key === "ArrowLeft") ? "prev" : "next" ;
        let link = document.querySelector(`a[data-nav='${direction}']`);
        if(link) link.click();
    } else if(event.key == "ArrowUp" || event.key == "ArrowDown") {
        if(focusedElement.tagName == "INPUT") return;
        let textMaterial = document.querySelector(".section-text__content");
        let modalOverlay = document.getElementById("modalOverlay");
        if(modalOverlay && modalOverlay.style.display == "block") {
            let modalContainers = document.getElementsByClassName("subsection-modal-container");
            for(let modalContainer of modalContainers) {
                if(modalContainer.style.display == "flex") {
                    let modalMaterial = modalContainer.querySelector(".subsection-modal-text");
                    modalMaterial.focus();
                }
            }
        } else if(textMaterial && textMaterial.getAttribute("tabindex") == "0") {
            textMaterial.focus();
        }
    } else if(event.key == " ") {
        if(focusedElement.tagName == "BUTTON" || focusedElement.type == "checkbox" || focusedElement.type == "search") return;
        let modalOverlay = document.getElementById("modalOverlay");
        let nonTextContent = document.querySelector(".main-non-text-container");
        let videoPlayer;
        if(modalOverlay && modalOverlay.style.display == "block") {
            let modalContainers = document.getElementsByClassName("subsection-modal-container");
            for(let modalContainer of modalContainers) {
                if(modalContainer.style.display == "flex") {
                    let modalText = modalContainer.querySelector(".subsection-modal-text");
                    if(modalText.contains(focusedElement)) return;
                    videoPlayer = modalContainer.querySelector(".book-section-video-player");
                }
            }
        } else if(nonTextContent) {
            let textMaterial = document.querySelector(".section-text__content");
            if(textMaterial.contains(focusedElement)) return;
            videoPlayer = nonTextContent.querySelector(".book-section-video-player");
        }
        if(videoPlayer) {
            let playerId = videoPlayer.getAttribute("data-player");
            let selectedTab = document.querySelector(`.book-section-comparison-button-container button[data-player='${playerId}'][data-state='selected']`);
            let videoTab = document.querySelector(`.book-section-comparison-button-container button[data-player='${playerId}'][value='video']`);
            if(!videoTab || (selectedTab && selectedTab.value == "video")) {
                let playPauseButton = document.getElementById(`${playerId}-playPauseButton`);
                playPauseButton.click();
            }
        }
    }
});

// Check url to see if modal anchor is included. If so, trigger button press
let secUrl = window.location.href;
let secSplit = secUrl.split("#");
if(secSplit.length > 1) {
    let buttons = [];
    let anchor = secSplit[1];
    let learnMore = document.querySelector(".learn-more");
    if(learnMore) buttons = learnMore.getElementsByTagName("button");
    for(let button of buttons){
        if (button.value == anchor) {
            button.click();
        }
    }
}

let progressBar = document.getElementById("customBookProgress");
if(progressBar) {
    let progressPopUp = document.getElementById("progressPopUp");
    let progressMarker = document.getElementById("progressBarMarker");
    let posElementsContainer = document.getElementById("posElementsContainer");
    let progressSwitchInput = document.querySelector(".progress-switch-input");
    let progressSwitchSlider = document.querySelector(".progress-switch-slider");
    let footer = document.querySelector("footer");
    let hideProgTimeout;

    if (typeof(Storage) !== "undefined") {
        let progressOn = window.sessionStorage.getItem("progressOn");
        if(!progressOn || progressOn == "true") {
            progressSwitchInput.checked = true;
            progressBar.classList.add("showing");
            progressBar.classList.add("unshelfed");
        } else {
            progressSwitchInput.checked = false;
        }
        progressSwitchSlider.classList.add("is-showing");
        if(document.getElementsByTagName("body")[0].classList.contains("preload")) {
            window.addEventListener("load", () => {
                progressSwitchInput.removeAttribute("disabled");
            });
        } else {
            progressSwitchInput.removeAttribute("disabled");
        }
    }

    posElementsContainer.addEventListener("mouseenter", function() {
        let halfLength = progressPopUp.scrollWidth / 2;
        if(hideProgTimeout) window.clearTimeout(hideProgTimeout);
        progressPopUp.classList.remove("progress-popup-hidden");
        if(progressMarker.getBoundingClientRect().left - halfLength <= 0) {
            progressPopUp.style.transform = `initial`;
            progressPopUp.style.right = "initial";
            progressPopUp.style.left = `0.25em`;
        } else if(progressMarker.getBoundingClientRect().right + halfLength >= window.innerWidth) {
            progressPopUp.style.transform = `initial`;
            progressPopUp.style.left = `initial`;
            progressPopUp.style.right = `0.25em`;
        } else {
            progressPopUp.style.transform = `translate(-50%, 0)`;
            progressPopUp.style.right = `initial`;
            progressPopUp.style.left = `${progressMarker.getAttribute("data-percent")}%`;
        }
    });
    posElementsContainer.addEventListener("mouseleave", function() {
        hideProgTimeout = setTimeout(function() {
            progressPopUp.setAttribute("style", "");
            progressPopUp.classList.add("progress-popup-hidden");
        }, 500);
    });

    progressSwitchInput.addEventListener("change", function(event) {
        if(progressSwitchInput.checked) {
            window.sessionStorage.setItem("progressOn", true);
            progressBar.classList.add("showing");
            progressBar.classList.add("unshelfed");
        } else {
            window.sessionStorage.setItem("progressOn", false);
            progressBar.classList.remove("unshelfed");
            progressBar.addEventListener("transitionend", function() {
                if(progressBar.getBoundingClientRect().top > footer.getBoundingClientRect().top) progressBar.classList.remove("showing");
            }, { once: true });
        }
    });
    progressSwitchSlider.addEventListener("click", function() {
        progressSwitchSlider.classList.add("mouse-focus");
    });

    progressSwitchInput.addEventListener("keydown", function() {
        progressSwitchSlider.classList.remove("mouse-focus");
    });
}

let sectionImgs = document.getElementsByClassName("content-img");
for(let sectionImg of sectionImgs) {
    let parentModal = sectionImg.parentElement;
    let fsContainer = sectionImg.querySelector(".content-img__fullscreen-container");
    let imgContainer = sectionImg.querySelector(".content-img__img-container");
    let img = sectionImg.querySelector(".content-img__img");
    let enlargeBtn = sectionImg.querySelector(".content-img__enlarge-btn");
    let minBtn = sectionImg.querySelector(".content-img__minimize-btn");
    let openBottom = imgContainer.classList.contains("content-img__img-container--open-bottom");
    let aspectRatio;
    let onImgLoad = function() {
        aspectRatio = img.width / img.height;
        enlargeBtn.disabled = false;
        minBtn.disabled = false;
    }
    if(img.complete) {
        onImgLoad();
    } else {
        img.addEventListener("load", onImgLoad);
    }

    enlargeBtn.addEventListener("click", function() {
        enlargeBtn.classList.add("content-img__btn--hidden");
        minBtn.classList.remove("content-img__btn--hidden");
        imgContainer.classList.add("content-img__img-container--enlarged");
        if(openBottom) imgContainer.classList.remove("content-img__img-container--open-bottom");
        if(window.innerWidth >= 900) {
            positionEnlargedImg();
            window.addEventListener("resize", positionEnlargedImg);
        } else {
            if(fsContainer.requestFullscreen) {
                fsContainer.requestFullscreen();
            } else {
                fsContainer.classList.add("content-img__fullscreen-container--fs-polyfill");
                imgContainer.classList.add("content-img__img-container--fs-polyfill");
            }
        }
    });
    minBtn.addEventListener("click", function() {
        minBtn.classList.add("content-img__btn--hidden");
        enlargeBtn.classList.remove("content-img__btn--hidden");
        imgContainer.classList.remove("content-img__img-container--enlarged");
        if(openBottom) imgContainer.classList.add("content-img__img-container--open-bottom");
        if(window.innerWidth >= 900) {
            imgContainer.style.width = "initial";
            imgContainer.style.top = "initial";
            imgContainer.style.height = "initial";
            window.removeEventListener("resize", positionEnlargedImg);
        } else {
            if(fsContainer.requestFullscreen) {
                document.exitFullscreen()
            } else {
                fsContainer.classList.remove("content-img__fullscreen-container--fs-polyfill");
                imgContainer.classList.remove("content-img__img-container--fs-polyfill");
            }
        }
    });

    let positionEnlargedImg = function() {
        let header = document.querySelector("header");
        let footer = document.querySelector("footer");
        let posTop = header.offsetHeight + ((footer.getBoundingClientRect().top - header.getBoundingClientRect().bottom) / 2);
        let availHeight = (footer.getBoundingClientRect().top - header.getBoundingClientRect().bottom) - 50;
        let availWidth = window.innerWidth - 100;
        let imageWidth = availHeight * aspectRatio;
        if(imageWidth < availWidth) {
            imgContainer.style.width = `${imageWidth}px`;
        } else {
            imgContainer.style.width = `${availWidth}px`;
        }
        imgContainer.style.top = `${posTop}px`;
    }
}

function showModal(el) {
    let modalId = el.getAttribute("value");
    // openModal is defined in modal.js
    openModal(modalId);

    // Fix modal canvas size. Would use custom events, but IE does not support the recommended methods.
    let modal = document.getElementById(modalId);
    let videoPlayer = modal.querySelector(".book-section-video-player");
    if(!videoPlayer) return;
    let videoEl = videoPlayer.querySelector("video");
    let playerId = videoEl.getAttribute("id");
    let videoPaintCanvas = videoPlayer.querySelector(`#${playerId}-videoPaintCanvas`);
    let videoScrubCanvas = videoPlayer.querySelector(`#${playerId}-videoScrubCanvas`);

    videoPaintCanvas.setAttribute("width", `${videoEl.offsetHeight * (16/9)}px`);
    videoPaintCanvas.setAttribute("height", `${videoEl.offsetHeight}px`);
    videoScrubCanvas.setAttribute("width", `${videoEl.offsetHeight * (16/9)}px`);
    videoScrubCanvas.setAttribute("height", `${videoEl.offsetHeight}px`);

    setTimeout(function() {
        videoPaintCanvas.setAttribute("width", `${videoEl.offsetHeight * (16/9)}px`);
        videoPaintCanvas.setAttribute("height", `${videoEl.offsetHeight}px`);
        videoScrubCanvas.setAttribute("width", `${videoEl.offsetHeight * (16/9)}px`);
        videoScrubCanvas.setAttribute("height", `${videoEl.offsetHeight}px`);
    }, 500)
    
}

function toggleImageSlider(el) {
    let selectedValue = el.getAttribute("value");
    let videoPlayerId = el.getAttribute("data-player");
    let videoQualitySwitcherMobile = document.querySelector(`.video-quality-changer-mobile[data-player='${videoPlayerId}']`);
    let videoContainer = document.querySelector(`.book-section-video-player[data-player='${videoPlayerId}']`);
    let videoElement = videoContainer.querySelector("video");
    let comparissonFullBackground = document.querySelector(`#fullBackground-${videoPlayerId}`);
    let currSelectedButton = el.parentElement.querySelector("button[data-state='selected']");

    if(!videoElement.paused) videoElement.pause();

    if(selectedValue == "image") {
        comparissonFullBackground.style.display = "block";
        videoContainer.style.display = "none";
        if(window.innerWidth <= 900 && videoQualitySwitcherMobile) videoQualitySwitcherMobile.style.display = "none";
    } else {
        comparissonFullBackground.style.display = "none";
        videoContainer.style.display = "flex";
        if(window.innerWidth <= 900 && videoQualitySwitcherMobile) videoQualitySwitcherMobile.style.display = "flex";
    }
    currSelectedButton.setAttribute("data-state", "");
    el.setAttribute("data-state", "selected");
}