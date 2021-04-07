// Add event listener for about us page to open feedback form
let feedbackLinks = document.getElementsByClassName("feedbackLink");
for(link of feedbackLinks) {
    link.addEventListener("click", () => {
        // openModal is defined in modal.js
        openModal("feedbackModal");
    });    
}

// Account for scrollbar width in right nav margins
let navRight = document.querySelector(".book-page-nav.book-appendix-nav.book-appendix-nav-right");
if(navRight) {
    let appendixContainer = document.querySelector(".book-appendix-page");
    let scrollbarWidth = appendixContainer.offsetWidth - appendixContainer.clientWidth;
    let marginRight = parseInt(window.getComputedStyle(navRight).getPropertyValue("margin-right").slice(0, -2));
    navRight.style["margin-right"] = `${marginRight + scrollbarWidth}px`;
}

// Account for scroll bar width in profile bios
let profileBlurbs = document.getElementsByClassName("book-profile-blurb");
for(blurb of profileBlurbs) {
    // Check if blurb is taller than pictures (267px)
    if(blurb.scrollHeight > 267) {
        let scrollBarWidth = blurb.offsetWidth - blurb.clientWidth;
        blurb.style["padding-right"] = `${scrollBarWidth}px`;
    }
}

// Check for anchor in url and open applicable modal window
let apenUrl = window.location.href;
let apenSplit = apenUrl.split("#");
if(apenSplit.length > 1) {
    let buttons = [];
    let anchor = apenSplit[1];
    let appendixInner = document.querySelector(".book-appendix-inner");
    if(appendixInner) buttons = appendixInner.getElementsByTagName("button");
    for(let button of buttons){
        if (button.value == anchor) {
            setTimeout(function(){
                button.click();
            }, 100);
        }
    }
}

// Add event listener to open "what's new" section
let whatsNewLinks = document.querySelectorAll("a[href='#new']");
for(let link of whatsNewLinks){
    let whatsNewButton = document.querySelector(`button[value="WhatsNew"]`);
    let whatsNewSection = document.querySelector("#WhatsNew .book-appendix-li-dropdown");
    link.addEventListener("click", function(){
        if (whatsNewSection.offsetHeight == 0) whatsNewButton.click();
    });
}

function toggleListDropdown(el) {
    let list = document.getElementById(el.value).querySelector(".book-appendix-li-dropdown");
    if(list.offsetHeight == 0) {
        el.style.transform = "rotate(180deg)";
        list.style.height = list.scrollHeight + "px";
        list.setAttribute("showing", true);
    } else {
        el.style.transform = "rotate(0deg)";
        list.style.height = "0";
        list.removeAttribute("showing");
    }
}

let treeViewer = document.querySelector(".book-appendix-tree-viewer");
if(treeViewer) {
    let treeGraphic = treeViewer.querySelector("svg");
    let currScale = 1;
    let zoomFactor = 1.05;
    let tx = 0;
    let ty = 0;
    treeViewer.addEventListener("wheel", function(event) {
        event.preventDefault();

        let currZoomFactor = zoomFactor;
        if(event.deltaY >= 0) currZoomFactor = 1/zoomFactor;  
        currScale *= currZoomFactor;

        // Calculate displacement of zooming position
        let centerX = (treeViewer.getBoundingClientRect().right - treeViewer.getBoundingClientRect().x) / 2;
        let centerY = (treeViewer.getBoundingClientRect().bottom - treeViewer.getBoundingClientRect().y) / 2;
        let posX = (event.pageX - treeViewer.getBoundingClientRect().x) - centerX;
        let posY = (event.pageY - treeViewer.getBoundingClientRect().y) - centerY;
        let dx = (posX - tx) * (currZoomFactor - 1);
        let dy = (posY - ty) * (currZoomFactor - 1);
        let newTx = tx - dx;
        let newTy = ty - dy;

        treeGraphic.style.transform = `matrix(${currScale}, 0, 0, ${currScale}, ${newTx}, ${newTy})`;
        tx = newTx;
        ty = newTy;
    });

    treeViewer.addEventListener("mousedown", function(event) {
        let centerX = (treeViewer.getBoundingClientRect().right - treeViewer.getBoundingClientRect().x) / 2;
        let centerY = (treeViewer.getBoundingClientRect().bottom - treeViewer.getBoundingClientRect().y) / 2;
        let posX = (event.pageX - treeViewer.getBoundingClientRect().x) - centerX;
        let posY = (event.pageY - treeViewer.getBoundingClientRect().y) - centerY;

        treeViewer.addEventListener("mousemove", trackMouse);

        treeViewer.addEventListener("mouseup", removeTracking, { once: true });

        treeViewer.addEventListener("mouseleave", removeTracking, { once: true });

        function trackMouse(event) {
            event.preventDefault();
            let currX = (event.pageX - treeViewer.getBoundingClientRect().x) - centerX;
            let currY = (event.pageY - treeViewer.getBoundingClientRect().y) - centerY;
            let dx = posX - currX;
            let dy = posY - currY;
            let newTx = tx - dx;
            let newTy = ty - dy;

            treeGraphic.style.transform = `matrix(${currScale}, 0, 0, ${currScale}, ${newTx}, ${newTy})`;
            tx = newTx;
            ty = newTy; 
            posX = currX;
            posY = currY;
        }

        function removeTracking() {
            treeViewer.removeEventListener("mousemove", trackMouse);
        }
    });

    let speciesMenus = document.querySelectorAll(".book-appendix-tree-section-list");
    for(let speciesMenu of speciesMenus) {
        let speciesName = speciesMenu.getAttribute("data-species");
        
    }
}