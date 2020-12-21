// Script still a WIP. Script was written to just to get the job done for the static site prototype. 
// Will be improving this script where needed as time goes on.

// Check url to see if modal anchor is included. If so, trigger button press
let secUrl = window.location.href;
let secSplit = secUrl.split("#");
if(secSplit.length > 1) {
    let buttons = [];
    let anchor = secSplit[1];
    let learnMore = document.querySelector(".book-section-learn-more");
    if(learnMore) buttons = learnMore.getElementsByTagName("button");
    for(let button of buttons){
        if (button.value == anchor) {
            button.click();
        }
    }
}

// Check if there is "Learn More" content. If not, add margin on bottom of text seciton
let sectionText = document.querySelector(".book-section-text");
if(sectionText) {
    let learnMore = sectionText.querySelector(".book-section-learn-more");
    if(!learnMore) {
        sectionText.style["padding-bottom"] = "1em";
    }
}

// Add event listener to video player to shelf text on first play
let video = document.querySelector("#nonTextContent video");
if(video) video.addEventListener("play", shelfOnFirstPlay);

function shelfOnFirstPlay(event) {
    shelfText();
    event.target.removeEventListener("play", shelfOnFirstPlay);
}

function showModal(el) {
    let modalId = el.getAttribute("value");
    // openModal is defined in modal.js
    openModal(modalId);
}

function shelfText(el) {
    let nonTextSection = document.getElementById("nonTextContent");
    let textSection = document.getElementById("textContent");
    let unshelfButton = document.getElementById("unshelfButton");

    // Make content of text section untabable
    let textSectionChildren = textSection.getElementsByTagName("*");
    for(child of textSectionChildren) {
        if(child.tabIndex >= 0) child.setAttribute("tabindex", "-99");
    }
    
    // Push text section offscreen
    textSection.style.transform = "translate(100%, -50%)";

    // Bring non text section center screen and enlarge
    nonTextSection.style.right = "0";
    nonTextSection.style.width = "84%";

    // Bring unshelf button on screen once text is transitioned off screen
    setTimeout(function(){
        // Calculate top margin value for unshelf button
        let pageContainer = document.querySelector(".book-page-content");
        let heightFromTop = (pageContainer.offsetHeight - textSection.offsetHeight) / 2;
        unshelfButton.style.top = `${heightFromTop}px`;
        unshelfButton.style.transform =  "translate(-100%, 0px)";
        unshelfButton.setAttribute("tabindex", "0");;
    }, 1000);
}

function openText(el) {
    let nonTextSection = document.getElementById("nonTextContent");
    let textSection = document.getElementById("textContent");
    let unshelfButton = document.getElementById("unshelfButton");

    // Make unshelf button untabable
    unshelfButton.setAttribute("tabindex", "-1");

    // Push open text button offscreen
    unshelfButton.style.transform =  "translate(0px, 0px)";

    // Bring non text section back to the left and make smaller
    nonTextSection.style.right = "62%";
    nonTextSection.style.width = "62%";

    // Bring unshelf button on screen once text is transitioned off screen
    setTimeout(function(){
        textSection.style.transform = "translate(0, -50%)";
        let textSectionChildren = textSection.getElementsByTagName("*");
        for(child of textSectionChildren) {
            if(child.tabIndex == -99) child.setAttribute("tabindex", "0");
        }
    }, 1000);
}