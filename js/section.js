// Script still a WIP. Script was written to just to get the job done for the static site prototype. 
// Will be improving this script where needed as time goes on.

// Check url to see if modal anchor is included. If so, trigger button press
let path = window.location.href;
let split = path.split("#");
if(split.length > 1) {
    let anchor = split[1];
    let buttons = document.getElementsByTagName("button");
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
    let subsectionModal = document.getElementById(modalId);
    let modalOverlay = document.getElementById("modalOverlay");
    let lastFocused = document.activeElement;

    modalOverlay.style.display = "block";
    subsectionModal.style.display = "flex";
    subsectionModal.setAttribute("tabindex", 0);
    subsectionModal.focus();

    document.addEventListener("focusin", restrictFocus);
    document.addEventListener("keydown", closeModalKey);
    modalOverlay.addEventListener("click", closeModalClick);

    function restrictFocus(event) {
        if(!subsectionModal.contains(event.target)) {
            event.stopPropagation();
            subsectionModal.focus();
        }
    }
    
    function closeModalKey(event) {
        if(event.key === 27 || event.key === "Escape"){
            hideModal();
        } 
    }
    
    function closeModalClick(event) {
        if(event.target == modalOverlay){
            hideModal();
        }
    }

    function hideModal() {
        document.removeEventListener("focusin", restrictFocus);
        document.removeEventListener("keydown", closeModalKey);
        modalOverlay.removeEventListener("click", closeModalClick);
        modalOverlay.style.display = "none";
        subsectionModal.style.display = "none";
        lastFocused.focus();
    }
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
    textSection.style.transform = "translate(100%, 0px)";

    // Bring non text section center screen and enlarge
    nonTextSection.style.right = "0";
    nonTextSection.style.width = "80%";

    // Bring unshelf button on screen once text is transitioned off screen
    setTimeout(function(){
        unshelfButton.style.top = window.getComputedStyle(textSection).marginTop;
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
    nonTextSection.style.left = "0";
    nonTextSection.style.right = "62%";
    nonTextSection.style.width = "62%";

    // Bring unshelf button on screen once text is transitioned off screen
    setTimeout(function(){
        textSection.style.transform = "translate(0px, 0px)";
        let textSectionChildren = textSection.getElementsByTagName("*");
        for(child of textSectionChildren) {
            if(child.tabIndex == -99) child.setAttribute("tabindex", "0");
        }
    }, 1000);
}