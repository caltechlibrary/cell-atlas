// Get current section and highlight it on nav bar
let pageName = window.location.pathname.split("/").pop().split(".")[0];
let navEntry = document.getElementById(`nav${pageName}`);
if(navEntry) {
    // Get chapter of page
    let chapter = pageName.split("-")[0];
    if(!isNaN(parseInt(chapter))) {
        navEntry.classList.add(`nav-menu-ch${chapter}-on`);
    }
    navEntry.style["font-style"] = "italic";

    // Ugly selector, but will do for now
    let navSection = navEntry.parentElement.parentElement.querySelector(".nav-menu-sections");
    if(navSection) {
        navSection.classList.remove("sr-only");
    }
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
        if(link) link.setAttribute("tabindex", tabValue);
    }
    let currSection = document.querySelector(".nav-menu-sections:not(.sr-only)");
    if(currSection) {
        let links = currSection.querySelectorAll("a");
        for(let link of links){
            link.setAttribute("tabindex", tabValue);
        }
    }
}