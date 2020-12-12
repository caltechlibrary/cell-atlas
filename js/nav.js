// Get current section and highlight it on nav bar
let currentSection = document.title.split(" ")[0];
let [chapter, section] = currentSection.split(".");
let navSection;
if(section) {
    navSection = document.getElementById(`nav${chapter}${section}`);
} else {
    navSection = document.getElementById(`nav${chapter}`);
}
navSection.classList.add(`nav-menu-ch${chapter}-on`);
navSection.style["font-style"] = "italic";
navSection.style.color = "rgb(118 119 123)";

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
    if(window.navOpened){
        navMenu.style.height = "0%";
        navMenu.style.padding = "0em 0em 0em 0.75em";
        setTimeout(function(){
            navMenu.style.opacity = "0";
            el.disabled = false;
        }, 300);
        window.navOpened = false;
        window.sessionStorage.setItem("navOpened", false);
    } else {
        navMenu.style.padding = ".75em 0em 0.75em 0.75em";
        navMenu.style.height = "100%";
        navMenu.style.opacity = "1";
        window.navOpened = true;
        window.sessionStorage.setItem("navOpened", true);
        el.disabled = false;
        let pageContainer = document.querySelector(".book-page-content");
        pageContainer.addEventListener("click", autoShelfNav);
        
    }
}

function autoShelfNav(event) {
    let navMenu = document.getElementById("navMenu");
    if(event.target != navMenu && !navMenu.contains(event.target)){
        let navToggleButton = document.getElementById("openNavButton");
        let pageContainer = document.querySelector(".book-page-content");
        navToggleButton.click();
        pageContainer.removeEventListener("click", autoShelfNav);
    }
}