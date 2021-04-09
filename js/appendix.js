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
let treeGraphic;
let zoomInButton;
let currScale;
let zoomFactor;
let tx;
let ty;
let hidePopUpCalls;
let currSpeciesEntry;
if(treeViewer) {
    treeGraphic = treeViewer.querySelector("svg[data-id='treeSvg']");
    zoomInButton = treeViewer.querySelector("#treeZoomIn");
    zoomOutButton = treeViewer.querySelector("#treeZoomOut");
    currScale = 1;
    zoomFactor = 1.05;
    tx = 0;
    ty = 0;

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
        calcTransform(posX, posY, currZoomFactor);
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

    zoomInButton.addEventListener("click", function(event) {
        currScale *= zoomFactor;
        calcTransform(0, 0, zoomFactor);
    });

    zoomOutButton.addEventListener("click", function(event) {
        currScale *= 1/zoomFactor;
        calcTransform(0, 0, 1/zoomFactor);
    });

    function calcTransform(posX, posY, zoomF) {
        let dx = (posX - tx) * (zoomF - 1);
        let dy = (posY - ty) * (zoomF - 1);
        let newTx = tx - dx;
        let newTy = ty - dy;

        treeGraphic.style.transform = `matrix(${currScale}, 0, 0, ${currScale}, ${newTx}, ${newTy})`;
        tx = newTx;
        ty = newTy;
    }

    let speciesEntries = document.querySelectorAll(".book-appendix-tree-species-entry");
    let currPopUp = undefined;
    for(let speciesEntry of speciesEntries) {
        let speciesId = speciesEntry.getAttribute("id");
        let popUp = document.querySelector(`.book-appendix-tree-section-list[data-species='${speciesId}']`);
        if(!popUp) continue;
        hidePopUpCalls = [];
        speciesEntry.addEventListener("mouseenter", function(event) {
            if(currPopUp) currPopUp.style.display = "none";
            if(currSpeciesEntry) currSpeciesEntry.style["text-decoration"] = "none";
            currPopUp = popUp;
            currSpeciesEntry = speciesEntry;
            speciesEntry.style["text-decoration"] = "underline";
            clearHideCalls();
            popUp.removeEventListener("mouseenter", popUpHandleHover);
            popUp.removeEventListener("mouseleave", popUpHandleLeave);
            popUp.style.display = "block";
            popUp.style.left = `${event.pageX}px`;
            popUp.style.top = `${event.pageY}px`;

            speciesEntry.addEventListener("mouseleave", function(event) {
                hidePopUpCalls.push(hidePopUp(popUp));
            }, {once: true});

            popUp.addEventListener("mouseenter", popUpHandleHover);
            popUp.addEventListener("mouseleave", popUpHandleLeave);

        });

        function clearHideCalls() {
            for(let hidePopUpCall of hidePopUpCalls) {
                window.clearTimeout(hidePopUpCall);
            }
        }

        let popUpHandleHover = function() {
            clearHideCalls();
            popUp.setAttribute("data-hover", "true");
        }

        let popUpHandleLeave = function() {
            popUp.setAttribute("data-hover", "false");
            hidePopUpCalls.push(hidePopUp(popUp));
        }

        function hidePopUp(popUp) {
            let timeoutNum = setTimeout(function() {
                if(popUp.getAttribute("data-hover") != "true") {
                    popUp.style.display = "none";
                    currSpeciesEntry.style["text-decoration"] = "none";
                }
            }, 1000);
            return timeoutNum;
        }
    }
            
}