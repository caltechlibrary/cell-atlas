let sectionTextMaterial = document.querySelector(".section-text__content");
if(sectionTextMaterial) addTypeFocusToggle(sectionTextMaterial);

let narrationPlayerElements = document.querySelectorAll(".narration-player");
for(let narrationPlayerElement of narrationPlayerElements) addTypeFocusToggle(narrationPlayerElement);

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