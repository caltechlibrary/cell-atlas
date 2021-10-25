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