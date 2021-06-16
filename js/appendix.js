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

let treeViewer = document.querySelector(".tree-viewer");
if(treeViewer) {
    let calcGridPos = function(pageX, pageY) {
        let centerX = (viewerContainer.getBoundingClientRect().right - viewerContainer.getBoundingClientRect().x) / 2;
        let centerY = (viewerContainer.getBoundingClientRect().bottom - viewerContainer.getBoundingClientRect().y) / 2;
        let posX = (pageX - viewerContainer.getBoundingClientRect().x) - centerX;
        let posY = (pageY - viewerContainer.getBoundingClientRect().y) - centerY;
        return { posX, posY };
    }

    let panTree = function(cordX, cordY) {
        currTranslateX-= cordX;
        currTranslateY-= cordY;
        treeSvg.style.transform = `matrix(${currScale}, 0, 0, ${currScale}, ${currTranslateX}, ${currTranslateY})`;
    }

    let zoomTree = function(cordX, cordY, zoomFactor) {
        let dx = (cordX - currTranslateX) * (zoomFactor - 1);
        let dy = (cordY - currTranslateY) * (zoomFactor - 1);
        currTranslateX-= dx;
        currTranslateY-= dy;
        currScale*= zoomFactor;
        treeSvg.style.transform = `matrix(${currScale}, 0, 0, ${currScale}, ${currTranslateX}, ${currTranslateY})`;
    }

    let handleWheel = function(event) {
        event.preventDefault();
        let gridPos = calcGridPos(event.pageX, event.pageY);
        if(event.deltaY >= 0) {
            zoomTree(gridPos.posX, gridPos.posY, 1/zoomWeight);
        } else {
            zoomTree(gridPos.posX, gridPos.posY, zoomWeight);
        }
    }

    let handleMouseDown = function(event) {
        event.preventDefault();

        let panViewer = function(event) {
            event.preventDefault();
            let newGridPos = calcGridPos(event.pageX, event.pageY);
            panTree(gridPos.posX - newGridPos.posX, gridPos.posY -newGridPos.posY);
            gridPos.posX = newGridPos.posX;
            gridPos.posY = newGridPos.posY;
        }

        let untrackMouseMove = function() {
            viewerContainer.classList.remove("tree-viewer__viewer-container--panning");
            treeViewer.removeEventListener("mousemove", panViewer);
        }

        let gridPos = calcGridPos(event.pageX, event.pageY);
        viewerContainer.classList.add("tree-viewer__viewer-container--panning");
        treeViewer.addEventListener("mousemove", panViewer);
        treeViewer.addEventListener("mouseup", untrackMouseMove, { once: true });
        treeViewer.addEventListener("mouseleave", untrackMouseMove, { once: true });
    }

    let initTouchPan = function(event) {
        let panViewer = function(event) {
            event.preventDefault();
            if(event.touches.length == 1) {
                let newGridPos = calcGridPos(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                panTree(gridPos.posX - newGridPos.posX, gridPos.posY -newGridPos.posY);
                gridPos.posX = newGridPos.posX;
                gridPos.posY = newGridPos.posY;
            } else {
                untrackTouch();
                treeViewer.removeEventListener("touchend", untrackTouch);
            }
        }

        let untrackTouch = function() {
            treeViewer.removeEventListener("touchmove", panViewer);
        }

        let gridPos = calcGridPos(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        treeViewer.addEventListener("touchmove", panViewer);
        treeViewer.addEventListener("touchend", untrackTouch, { once: true });
    }

    let initTouchZoom = function(event) {
        let touchZoom = function(event) {
            event.preventDefault();
            if(event.touches.length == 2) {
                gridPos1 = calcGridPos(event.touches[0].clientX, event.touches[0].clientY);
                gridPos2 = calcGridPos(event.touches[1].clientX, event.touches[1].clientY);
                let newDist = Math.hypot(gridPos1.posX - gridPos2.posX, gridPos1.posY - gridPos2.posY);
                let deltaDist = dist - newDist;
                let midPoint = { 
                    posX: (gridPos1.posX + gridPos2.posX) / 2,
                    posY: (gridPos1.posY + gridPos2.posY) / 2
                };

                if(deltaDist >= 0) {
                    zoomTree(midPoint.posX, midPoint.posY, 1/zoomWeight);
                } else {
                    zoomTree(midPoint.posX, midPoint.posY, zoomWeight);
                }

                dist-= deltaDist;
            } else {
                untrackTouchZoom();
                treeViewer.removeEventListener("touchend", untrackTouchZoom);
            }
        }

        let untrackTouchZoom = function(event) {
            treeViewer.removeEventListener("touchmove", touchZoom);
        }

        let gridPos1 = calcGridPos(event.touches[0].clientX, event.touches[0].clientY);
        let gridPos2 = calcGridPos(event.touches[1].clientX, event.touches[1].clientY);
        let dist = Math.hypot(gridPos1.posX - gridPos2.posX, gridPos1.posY - gridPos2.posY);
        treeViewer.addEventListener("touchmove", touchZoom);
        treeViewer.addEventListener("touchend", untrackTouchZoom, { once: true });
    }

    let handleTouch = function(event) {
        if(enlargeBtn.contains(event.target) || minBtn.contains(event.target) || zoomControls.contains(event.target)) {
            return;
        }
        event.preventDefault();
        if(event.touches.length == 1) {
            initTouchPan(event);
        } else if(event.touches.length == 2) {
            initTouchZoom(event);
        }
    }

    let posEnlargedTree = function() {
        let header = document.querySelector("header");
        let footer = document.querySelector("footer");
        let distHeaderFooter = footer.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
        let posTop = (header.offsetHeight + (distHeaderFooter / 2));
        let availHeight = distHeaderFooter - 50;
        let availWidth = window.innerWidth - 100;
        let desiredWidth = availHeight * aspectRatio;
        if(desiredWidth < availWidth) {
            viewerContainer.style.width = `${desiredWidth}px`;
        } else {
            viewerContainer.style.width = `${availWidth}px`;
        }
        viewerContainer.style.top = `${posTop}px`;
    }

    let resizePolyFullscreenViewer = function() {
        viewerContainer.style.height = `${window.innerHeight}px`;
    }

    let enlargeTree = function() {
        enlargeBtn.classList.remove("tree-viewer__btn--visible"); 
        minBtn.classList.add("tree-viewer__btn--visible"); 
        if(window.innerWidth > 900) {
            viewerContainer.classList.add("tree-viewer__viewer-container--enlarged");
            posEnlargedTree();
            window.addEventListener("resize", posEnlargedTree);
        } else {
            if(viewerContainer.requestFullscreen) {
                viewerContainer.requestFullscreen();
            } else {
                fsContainer.classList.add("tree-viewer__fullscreen-container--fs-polyfill");
                viewerContainer.classList.add("tree-viewer__viewer-container--fs-polyfill");
                window.addEventListener("resize", resizePolyFullscreenViewer);
            }
        }
    }

    let minimizeTree = function() {
        enlargeBtn.classList.add("tree-viewer__btn--visible"); 
        minBtn.classList.remove("tree-viewer__btn--visible"); 
        if(window.innerWidth > 900) {
            viewerContainer.classList.remove("tree-viewer__viewer-container--enlarged");
            viewerContainer.style.width = "initial";
            viewerContainer.style.top = "initial";
            window.removeEventListener("resize", posEnlargedTree);
        } else {
            if(viewerContainer.requestFullscreen) {
                document.exitFullscreen();
            } else {
                fsContainer.classList.remove("tree-viewer__fullscreen-container--fs-polyfill");
                viewerContainer.classList.remove("tree-viewer__viewer-container--fs-polyfill");
                window.removeEventListener("resize", resizePolyFullscreenViewer);
                viewerContainer.style.height = "initial";
            }
        }
    }

    let fsContainer = treeViewer.querySelector(".tree-viewer__fullscreen-container");
    let viewerContainer = treeViewer.querySelector(".tree-viewer__viewer-container");
    let treeSvg = treeViewer.querySelector(".tree-viewer__tree-svg");
    let zoomControls = treeViewer.querySelector(".tree-viewer__zoom-controls");
    let zoomInBtn = treeViewer.querySelector(".tree-viewer__zoom-in-btn");
    let zoomOutBtn = treeViewer.querySelector(".tree-viewer__zoom-out-btn");
    let enlargeBtn = treeViewer.querySelector(".tree-viewer__enlarge-btn");
    let minBtn = treeViewer.querySelector(".tree-viewer__min-btn");
    let aspectRatio = (viewerContainer.offsetWidth / viewerContainer.offsetHeight);
    let zoomWeight = 1.05;
    let currScale = 1;
    let currTranslateX = 0;
    let currTranslateY = 0;

    treeViewer.addEventListener("wheel", handleWheel);
    treeViewer.addEventListener("mousedown", handleMouseDown);
    treeViewer.addEventListener("touchstart", handleTouch);
    zoomInBtn.addEventListener("click", () => zoomTree(0, 0, zoomWeight));
    zoomOutBtn.addEventListener("click", () => zoomTree(0, 0, 1/zoomWeight));
    enlargeBtn.addEventListener("click", enlargeTree);
    minBtn.addEventListener("click", minimizeTree);
}