let pageName = window.location.pathname.split("/").pop().split(".")[0];
let navEntry = document.getElementById(`nav${pageName}`);

// Check if nav bar should be opened
if (typeof(Storage) !== "undefined") {
    let wasOpened = window.sessionStorage.getItem("navOpened");
    if(wasOpened == "true" && navEntry && navEntry.getAttribute("data-chapter") == "true") {
        let openNavButton = document.getElementById("openNavButton");
        openNavButton.click();
    } else {
        window.sessionStorage.setItem("navOpened", false);
    }
}

// Get current section and highlight it on nav bar
if(navEntry) {
    let navMenu = document.querySelector("#navMenu");
    // Get chapter of page
    let chapter = pageName.split("-")[0];
    if(!isNaN(parseInt(chapter))) {
        navEntry.classList.add(`nav-menu-ch${chapter}-on`);
    }
    navEntry.style["font-style"] = "italic";

    let toggleSectionListButton = navEntry.parentElement.parentElement.querySelector("button");
    if(toggleSectionListButton) {
        toggleSectionListButton.click();
        if(window.innerWidth < 900 && navMenu.offsetHeight == 0) {
            let sectionList = navEntry.parentElement;
            let openNavBtn = document.querySelector(".header-nav-button-mobile");
            sectionList.style.height = "auto";
            openNavBtn.addEventListener("click", function() {
                sectionList.style.height = `${sectionList.scrollHeight}px`;
            }, { once: true });
        }
    }
}

let openSectionButtons = document.querySelectorAll(".nav-menu button");
for(let openSectionButton of openSectionButtons) {
    addTypeFocusToggle(openSectionButton);
}

function toggleNav(el) {
    el.disabled = true;
    let navMenu = document.getElementById("navMenu");
    let pageContainer = document.querySelector(".book-page-content");
    if(window.navOpened){
        pageContainer.removeEventListener("click", autoShelfNav);
        navMenu.style["max-height"] = "0%";
        navMenu.classList.remove("nav-menu-opened");
        setTimeout(function(){
            navMenu.style.opacity = "0";
            el.disabled = false;
        }, 300);
        window.navOpened = false;
        window.sessionStorage.setItem("navOpened", false);

        // Make all links and buttons untabable
        toggleNavTabable(-1);
    } else {
        navMenu.classList.add("nav-menu-opened");
        navMenu.style["max-height"] = "100%";
        navMenu.style.opacity = "1";
        window.navOpened = true;
        window.sessionStorage.setItem("navOpened", true);
        pageContainer.addEventListener("click", autoShelfNav);
        el.disabled = false;

        // Make all buttons and chapter links, and open section lists tabable
        toggleNavTabable(0);
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

function toggleNavTabable(tabIndex) {
    let navMenu = document.getElementById("navMenu");
    let chapterHeaders = navMenu.querySelectorAll(".nav-menu-chapter-container a");
    let navButtons = navMenu.querySelectorAll("button");
    let expandedSectionLinks = navMenu.querySelectorAll(".nav-menu-sections[expanded='true'] a");
    let offlineLink = navMenu.querySelector(".nav-menu-footer a");
    setTabIndex(chapterHeaders, tabIndex);
    setTabIndex(navButtons, tabIndex);
    setTabIndex(expandedSectionLinks, tabIndex);
    if(offlineLink) setTabIndex([offlineLink], tabIndex);
}

function setTabIndex(elements, tabIndex) {
    for(let element of elements) {
        element.setAttribute("tabindex", tabIndex);
    }
}

function toggleSectionList(el) {
    let sectionList = el.parentElement.parentElement.querySelector("ol");
    let sectionListLinks = sectionList.querySelectorAll("a");
    let navMenu = document.getElementById("navMenu");
    if(sectionList.offsetHeight > 0) {
        sectionList.style.height = "0px";
        el.style.transform = "rotate(0deg)";
        sectionList.removeAttribute("expanded");
        setTabIndex(sectionListLinks, -1);
    } else {
        // Close currently opened list
        let openList = document.querySelector(".nav-menu-sections[expanded='true']");
        if (openList) {
            let openListButton = openList.parentElement.querySelector("button");
            openListButton.click();
        }

        el.style.transform = "rotate(180deg)";
        sectionList.style.height = `${sectionList.scrollHeight}px`;
        sectionList.setAttribute("expanded", "true");
        if(navMenu.offsetHeight > 0) setTabIndex(sectionListLinks, 0);
    }
}