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
    addNavRightMargin();
}

// Account for scroll bar width in profile bios
let profileContainers = document.querySelectorAll(".profile-container");
for(profileContainer of profileContainers) {
    let profileImg = profileContainer.querySelector("img");
    let profileBlurb = profileContainer.querySelector(".book-profile-blurb");
    let checkForScrollBar = function() {
        // Check if blurb is taller than pictures (267px)
        if(profileBlurb.scrollHeight > 267) {
            let scrollBarWidth = profileBlurb.offsetWidth - profileBlurb.clientWidth;
            profileBlurb.style["padding-right"] = `${scrollBarWidth}px`;
        }
    }
    if(!profileImg || (profileImg && profileImg.complete)) {
        checkForScrollBar();
    } else {
        profileImg.addEventListener("load", checkForScrollBar);
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

function addNavRightMargin() {
    let appendixContainer = document.querySelector(".book-appendix-page");
    let scrollbarWidth = appendixContainer.offsetWidth - appendixContainer.clientWidth;
    let marginRight = parseInt(window.getComputedStyle(navRight).getPropertyValue("margin-right").slice(0, -2));
    navRight.style["margin-right"] = `${marginRight + scrollbarWidth}px`;
}

function toggleListDropdown(el) {
    let list = document.querySelector(`.profile-container[data-profile='${el.value}']`).querySelector(".book-appendix-li-dropdown");
    let listImg = list.querySelector("img");
    if(list.offsetHeight == 0) {
        el.style.transform = "rotate(180deg)";
        if(!listImg || (listImg && listImg.complete)) {
            list.style.height = list.scrollHeight + "px";
        } else {
            list.style.height = "auto";
            listImg.addEventListener("load", function() {
                if(list.offsetHeight > 0) list.style.height = list.scrollHeight + "px";
            });
        }
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
let fullscreenBackground;
let fullscreenButtonMobile;
let minimizeButtonMobile;
let touchX;
let touchY;
let touchDist;
if(treeViewer) {
    treeGraphic = treeViewer.querySelector("svg[data-id='treeSvg']");
    zoomInButton = treeViewer.querySelector("#treeZoomIn");
    zoomOutButton = treeViewer.querySelector("#treeZoomOut");
    fullscreenBackground = treeViewer.parentElement;
    fullscreenButtonMobile = treeViewer.querySelector("#treeFullScreen");
    minimizeButtonMobile = treeViewer.querySelector("#treeMinimize");
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
        event.preventDefault();
        treeViewer.style.cursor = "grabbing";
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
            treeViewer.style.cursor = "grab";
            treeViewer.removeEventListener("mousemove", trackMouse);
        }
    });

    treeViewer.addEventListener("touchmove", function(event) {
        event.preventDefault();
        if(event.touches.length == 1) {
            let centerX = (treeViewer.getBoundingClientRect().right - treeViewer.getBoundingClientRect().x) / 2;
            let centerY = (treeViewer.getBoundingClientRect().bottom - treeViewer.getBoundingClientRect().y) / 2;
            let currX = (event.changedTouches[0].clientX - treeViewer.getBoundingClientRect().x) - centerX;
            let currY = (event.changedTouches[0].clientY - treeViewer.getBoundingClientRect().y) - centerY;
            if(!touchX || !touchY) {
                touchX = (event.changedTouches[0].clientX - treeViewer.getBoundingClientRect().x) - centerX;
                touchY = (event.changedTouches[0].clientY - treeViewer.getBoundingClientRect().y) - centerY;
            }
            let dx = touchX - currX;
            let dy = touchY - currY;
            let newTx = tx - dx;
            let newTy = ty - dy;

            treeGraphic.style.transform = `matrix(${currScale}, 0, 0, ${currScale}, ${newTx}, ${newTy})`;
            tx = newTx;
            ty = newTy; 
            touchX = currX;
            touchY = currY;
        } else if(event.touches.length == 2) {
            let currDist = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY);
            if(!touchDist) {
                touchDist = currDist;
                return;
            }
            let deltaDist = touchDist - currDist;

            let currZoomFactor = zoomFactor;
            if(deltaDist >= 0) currZoomFactor = 1/zoomFactor;  
            currScale *= currZoomFactor;

            // Calculate displacement of zooming position
            let centerX = (treeViewer.getBoundingClientRect().right - treeViewer.getBoundingClientRect().x) / 2;
            let centerY = (treeViewer.getBoundingClientRect().bottom - treeViewer.getBoundingClientRect().y) / 2;
            let posX = (((event.touches[0].clientX - treeViewer.getBoundingClientRect().x) - centerX) + ((event.touches[1].clientX - treeViewer.getBoundingClientRect().x) - centerX)) / 2;
            let posY = (((event.touches[0].clientY - treeViewer.getBoundingClientRect().y) - centerY) + ((event.touches[1].clientY - treeViewer.getBoundingClientRect().y) - centerY)) / 2;
            calcTransform(posX, posY, currZoomFactor);
            touchDist = currDist;
        }
    });

    treeViewer.addEventListener("touchend", function(event) {
        if(event.touches.length == 0) {
            touchX = undefined;
            touchY = undefined;
        }
    });

    zoomInButton.addEventListener("click", function(event) {
        currScale *= (zoomFactor * 1.25);
        calcTransform(0, 0, zoomFactor);
    });

    zoomOutButton.addEventListener("click", function(event) {
        currScale *= 1/(zoomFactor * 1.25);
        calcTransform(0, 0, 1/zoomFactor);
    });

    fullscreenButtonMobile.addEventListener("click", function(event) {
        fullscreenButtonMobile.style.display = "none"; 
        minimizeButtonMobile.style.display = "flex";
        fullscreenBackground.setAttribute("data-state", "fullscreen");
        if(window.innerWidth > 900) {
            enlargeTreeViewer();
        } else {
            if(fullscreenBackground.requestFullscreen) {
                fullscreenBackground.requestFullscreen();
            } else {
                resizePolyFullscreen();
                window.addEventListener("resize", resizePolyFullscreen);
                fullscreenBackground.classList.add("book-appendix-tree-viewer-fullbackground-polyfill");
                let appendixPageEl = document.querySelector(".book-appendix-page");
                appendixPageEl.classList.add("book-appendix-page-fullscreen-polyfill");
            }
        }
    });

    minimizeButtonMobile.addEventListener("click", function(event) {
        minimizeButtonMobile.style.display = "none"; 
        fullscreenButtonMobile.style.display = "flex";
        fullscreenBackground.setAttribute("data-state", "initial");
        if(window.innerWidth > 900) {
            minimizeTreeViewer();
        } else {
            if(fullscreenBackground.requestFullscreen) {
                document.exitFullscreen();
            } else {
                window.removeEventListener("resize", resizePolyFullscreen);
                treeViewer.style.removeProperty("height");
                fullscreenBackground.classList.remove("book-appendix-tree-viewer-fullbackground-polyfill");
                let appendixPageEl = document.querySelector(".book-appendix-page");
                appendixPageEl.classList.remove("book-appendix-page-fullscreen-polyfill");
            }
        }
    });

    function resizePolyFullscreen(event) {        
        setTimeout(function() {
            if(window.innerWidth > window.innerHeight) {
                treeViewer.style.height = `${window.innerHeight}px`;
            } else {
                treeViewer.style.removeProperty("height");
            }
        }, 200);
    }

    function enlargeTreeViewer() {
        let header = document.querySelector("header");
        let footer = document.querySelector("footer");
        let aspectRatio = (treeViewer.offsetWidth / treeViewer.offsetHeight);
        let availHeight = (footer.getBoundingClientRect().top - header.getBoundingClientRect().bottom) - 50;
        let availWidth = window.innerWidth - 100;
        let imageWidth = availHeight * aspectRatio;
        if(imageWidth < availWidth) {
            fullscreenBackground.style.width = `${imageWidth}px`;
        } else {
            fullscreenBackground.style.width = `${availWidth}px`;
        }
        let posTop = (header.offsetHeight + ((footer.getBoundingClientRect().top - header.getBoundingClientRect().bottom) / 2)) - (fullscreenBackground.offsetHeight / 2);
        let posLeft = (window.innerWidth / 2) - (fullscreenBackground.offsetWidth / 2);
        fullscreenBackground.classList.add("book-appendix-tree-viewer-enlarged");
        fullscreenBackground.style.top = `${posTop}px`;
        fullscreenBackground.style.left = `${posLeft}px`;
        window.addEventListener("resize", resizeEnlargedTree);
        window.addEventListener("click", minimizeTreeClick);
        navRight.style["margin-right"] = "1rem";
    }

    function minimizeTreeViewer() {
        fullscreenBackground.style.width = "initial";
        fullscreenBackground.style.top = "initial";
        fullscreenBackground.style.left = "initial";
        fullscreenBackground.classList.remove("book-appendix-tree-viewer-enlarged");
        window.removeEventListener("resize", resizeEnlargedTree);
        window.removeEventListener("click", minimizeTreeClick);
        addNavRightMargin();
    }

    function resizeEnlargedTree() {
        let header = document.querySelector("header");
        let footer = document.querySelector("footer");
        let aspectRatio = (treeViewer.offsetWidth / treeViewer.offsetHeight);
        let availHeight = (footer.getBoundingClientRect().top - header.getBoundingClientRect().bottom) - 50;
        let availWidth = window.innerWidth - 100;
        let imageWidth = availHeight * aspectRatio;
        if(imageWidth < availWidth) {
            fullscreenBackground.style.width = `${imageWidth}px`;
        } else {
            fullscreenBackground.style.width = `${availWidth}px`;
        }
        let posTop = (header.offsetHeight + ((footer.getBoundingClientRect().top - header.getBoundingClientRect().bottom) / 2)) - (fullscreenBackground.offsetHeight / 2);
        let posLeft = (window.innerWidth / 2) - (fullscreenBackground.offsetWidth / 2);
        fullscreenBackground.classList.add("book-appendix-tree-viewer-enlarged");
        fullscreenBackground.style.top = `${posTop}px`;
        fullscreenBackground.style.left = `${posLeft}px`;
    }

    function minimizeTreeClick(event) {
        if(!fullscreenBackground.contains(event.target)) minimizeButtonMobile.click();
    }

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

            popUp.style.left = `${event.clientX}px`;
            popUp.style.top = `${event.clientY}px`;

            if(window.innerWidth < 900) {
                let centerX = (treeViewer.getBoundingClientRect().right - treeViewer.getBoundingClientRect().x) / 2;
                let centerY = (treeViewer.getBoundingClientRect().bottom - treeViewer.getBoundingClientRect().y) / 2;
                let posX = (event.clientX - treeViewer.getBoundingClientRect().x) - centerX;
                let posY = (event.clientY - treeViewer.getBoundingClientRect().y) - centerY;
                let exampleList = popUp.querySelector(".book-appendix-tree-section-content");
                let translateX = 0;
                let translateY = 0;
                let maxHeight = 0;
                let maxWidth = 0;
                if(posX > 0) {
                    translateX = -100;
                    maxWidth = event.clientX - 16;
                } else {
                    maxWidth = window.innerWidth - event.clientX - 16;
                }
                if (posY > 0) {
                    translateY = -100;
                    maxHeight = event.clientY - (popUp.offsetHeight - exampleList.offsetHeight) - 32;
                } else {
                    maxHeight = window.innerHeight - event.clientY - (popUp.offsetHeight - exampleList.offsetHeight) - 32;
                }
                popUp.style.transform = `translate(${translateX}%, ${translateY}%)`;
                popUp.style["max-width"] = `${maxWidth}px`;
                exampleList.style["max-height"] = `${maxHeight}px`;
            }

            speciesEntry.addEventListener("mouseleave", function(event) {
                hidePopUpCalls.push(hidePopUp(popUp));
            }, {once: true});

            popUp.addEventListener("mouseenter", popUpHandleHover);
            popUp.addEventListener("mouseleave", popUpHandleLeave);
            window.addEventListener("touchstart", touchHandleLeave);

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

        let touchHandleLeave = function(event) {
            if(!popUp.contains(event.target) && !speciesEntry.contains(event.target)) {
                popUp.setAttribute("data-hover", "false");
                popUp.style.display = "none";
                currSpeciesEntry.style["text-decoration"] = "none";
                window.removeEventListener("touchstart", touchHandleLeave);
            }
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

        let url = window.location.href;
        let anchor = url.split("#");
        let urlMenuId = anchor[1];
        if(urlMenuId == speciesId && window.innerWidth >= 900) {
            fullscreenButtonMobile.click();
            currPopUp = popUp;
            currSpeciesEntry = speciesEntry;
            speciesEntry.style["text-decoration"] = "underline";
            popUp.style.display = "block";

            popUp.style.left = `${speciesEntry.getBoundingClientRect().x + (speciesEntry.getBoundingClientRect().width / 2)}px`;
            popUp.style.top = `${speciesEntry.getBoundingClientRect().y + (speciesEntry.getBoundingClientRect().height / 2)}px`;

            popUp.addEventListener("mouseenter", popUpHandleHover);
            popUp.addEventListener("mouseleave", popUpHandleLeave);
            window.addEventListener("touchstart", touchHandleLeave);

        }
    }
}