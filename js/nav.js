// Get current section and highlight it on nav bar
let currentSection = document.title.split(" ")[0];
let [chapter, section] = currentSection.split(".");
let navSection;
if(section) {
    navSection = document.getElementById(`nav${chapter}${section}`);
} else if(chapter == "Keep" || chapter == "Outlook") {
    if(chapter == "Keep") {
        navSection = document.getElementById(`navKeep Looking`);
    } else {
        navSection = document.getElementById(`navOutlook`);
    }
    let sectionLists = document.getElementsByClassName("nav-menu-sections");
    currSectionList = sectionLists[sectionLists.length - 1];
    currSectionList.classList.remove("sr-only");
} else {
    navSection = document.getElementById(`nav${chapter}`);
}
if(navSection){
    navSection.classList.add(`nav-menu-ch${chapter}-on`);
    navSection.style["font-style"] = "italic";
}

// Unhide the section list for the chapter that we are currently in
if(!isNaN(parseInt(chapter))) {
    let sectionLists = document.getElementsByClassName("nav-menu-sections");
    currSectionList = sectionLists[parseInt(chapter) - 1];
    currSectionList.classList.remove("sr-only");
}

// Check if nav bar should be opened
if (typeof(Storage) !== "undefined") {
    let wasOpened = window.sessionStorage.getItem("navOpened");
    if(wasOpened == "true") {
        let openNavButton = document.getElementById("openNavButton");
        openNavButton.click();
    }
}

function toggleNav(el) {
    el.disabled = true;
    let navMenu = document.getElementById("navMenu");
    let pageContainer = document.querySelector(".book-page-content");
    if(window.navOpened){
        pageContainer.removeEventListener("click", autoShelfNav);
        navMenu.style.height = "0%";
        navMenu.style.padding = "0em 0em 0em 0.75em";
        setTimeout(function(){
            navMenu.style.opacity = "0";
            el.disabled = false;
        }, 300);
        window.navOpened = false;
        window.sessionStorage.setItem("navOpened", false);
        toggleTab(-1);
    } else {
        navMenu.style.padding = ".75em 0em 0.75em 0.75em";
        navMenu.style.height = "100%";
        navMenu.style.opacity = "1";
        window.navOpened = true;
        window.sessionStorage.setItem("navOpened", true);
        pageContainer.addEventListener("click", autoShelfNav);
        el.disabled = false;
        // Make links tabable
        toggleTab(0);
    }
}

function autoShelfNav(event) {
    let navMenu = document.getElementById("navMenu");
    if(event.target != navMenu && !navMenu.contains(event.target)){
        let navToggleButton = document.getElementById("openNavButton");
        navToggleButton.click();
        let pageContainer = document.querySelector(".book-page-content");
        pageContainer.removeEventListener("click", autoShelfNav);
    }
}

function toggleTab(tabValue) {
    let chapterSections = document.getElementsByClassName("nav-menu-chapter");
    for(let chapterSection of chapterSections) {
        let link = chapterSection.querySelector("a");
        link.setAttribute("tabindex", tabValue);
    }
    let currSection = document.querySelector(".nav-menu-sections:not(.sr-only)");
    if(currSection) {
        let links = currSection.querySelectorAll("a");
        for(let link of links){
            link.setAttribute("tabindex", tabValue);
        }
    }
}