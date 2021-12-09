let sectionTextMaterial = document.querySelector(".section-text__content");
if(sectionTextMaterial) addTypeFocusToggle(sectionTextMaterial);

let narrationPlayerElements = document.querySelectorAll(".narration-player");
for(let narrationPlayerElement of narrationPlayerElements) addTypeFocusToggle(narrationPlayerElement);

let comparisonVideoButtons = document.querySelectorAll(".book-section-comparison-button-container button");
for(let comparisonVideoButton of comparisonVideoButtons) {
    addTypeFocusToggle(comparisonVideoButton);
}

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