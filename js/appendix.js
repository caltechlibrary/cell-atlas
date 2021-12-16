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

function addNavRightMargin() {
    let appendixContainer = document.querySelector(".book-appendix-page");
    let scrollbarWidth = appendixContainer.offsetWidth - appendixContainer.clientWidth;
    let marginRight = parseInt(window.getComputedStyle(navRight).getPropertyValue("margin-right").slice(0, -2));
    navRight.style["margin-right"] = `${marginRight + scrollbarWidth}px`;
}

for(profileBio of document.getElementsByClassName("profile-bio")) {
    let profileImg = profileBio.querySelector(".profile-bio__profile-img");
    let profileDescription = profileBio.querySelector(".profile-bio__description");
    
    let checkForScrollBar = function() {
        if(profileDescription.scrollHeight > parseInt(window.getComputedStyle(profileBio)["max-height"])) {
            profileDescription.style["padding-right"] = `${profileDescription.offsetWidth - profileDescription.clientWidth}px`;
        }
    };

    if(!profileImg || (profileImg && profileImg.complete)) {
        checkForScrollBar();
    } else {
        profileImg.addEventListener("load", checkForScrollBar);
    }
}

for(let appendixAccordionGroup of document.querySelectorAll(".appendix-accordion-group")) {
    let AppendixAccordionGroup = function(appendixAccordionGroup) {

        let hideCollapsedAccordion = function(event) {
            let accordionPanel = event.currentTarget;
            accordionPanel.removeEventListener("transitionend", hideCollapsedAccordion);
            if(accordionPanel.offsetHeight == 0) {
                accordionPanel.classList.add("appendix-accordion-group__panel--hidden");
            }
        };

        let toggleAccordionDropDown = function(event) {
            let accordionButton = event.currentTarget;
            let expandIcon = accordionButton.querySelector(".appendix-accordion-group__expand-icon");
            let accordionPanel = document.getElementById(accordionButton.getAttribute("aria-controls"));
            let panelImg = accordionPanel.querySelector("img");
            if(accordionButton.getAttribute("aria-expanded") == "false") {
                accordionButton.setAttribute("aria-expanded", "true");
                expandIcon.classList.add("appendix-accordion-group__expand-icon--active");
                accordionPanel.classList.remove("appendix-accordion-group__panel--hidden");
                if(panelImg && !panelImg.complete) {
                    accordionPanel.style.height = "auto";
                    panelImg.addEventListener("load", () => {
                        if(accordionButton.getAttribute("aria-expanded") == "true") accordionPanel.style.height = `${accordionPanel.scrollHeight}px`;
                    });
                } else {
                    accordionPanel.style.height = `${accordionPanel.scrollHeight}px`;
                }
            } else {
                accordionButton.setAttribute("aria-expanded", "false");
                expandIcon.classList.remove("appendix-accordion-group__expand-icon--active");
                if(document.querySelector("body").classList.contains("preload")) {
                    accordionPanel.style.height = 0;
                    accordionPanel.classList.add("appendix-accordion-group__panel--hidden");
                } else {
                    accordionPanel.addEventListener("transitionend", hideCollapsedAccordion);
                    accordionPanel.style.height = 0;
                }
            }
        };

        let simulateAccordionOpen = function(desiredAnchor) {
            let accordionButton = document.getElementById(`${desiredAnchor}-button`) 
            if(accordionButton && accordionButton.getAttribute("aria-expanded") == "false") {
                let fakeEvent = { currentTarget: accordionButton };
                setTimeout(() => toggleAccordionDropDown(fakeEvent), 100);
            }
        };

        let onOrientationChange = function() {
            let expandedPanelBtns = document.querySelectorAll(".appendix-accordion-group__button[aria-expanded='true']");
            expandedPanelBtns.forEach((expandedPanelBtn) => {
                let expandedPanel = document.getElementById(expandedPanelBtn.getAttribute("aria-controls"));
                expandedPanel.style.height = "auto";
                window.addEventListener("resize", () => expandedPanel.style.height = `${expandedPanel.scrollHeight}px`, { once: true });
            });
        };

        let desiredAnchor = window.location.hash.substring(1);
        let accordionButtons = appendixAccordionGroup.getElementsByClassName("appendix-accordion-group__button");
        for(let accordionButton of accordionButtons) accordionButton.addEventListener("click", toggleAccordionDropDown);
        window.addEventListener("hashchange", () => simulateAccordionOpen(window.location.hash.substring(1)));
        window.addEventListener("orientationchange", onOrientationChange);
        if(desiredAnchor) simulateAccordionOpen(desiredAnchor);
    }

    AppendixAccordionGroup(appendixAccordionGroup);
}

if(document.querySelector(".fs-tree-confirm")) {
    let handleCancel = function() {
        fsTreeConfirm.classList.add("fs-tree-confirm--hidden");
    }

    let fsTreeConfirm = document.querySelector(".fs-tree-confirm");
    let cancelBtn = fsTreeConfirm.querySelector(".fs-tree-confirm__cancel-btn");
    cancelBtn.addEventListener("click", handleCancel);
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
                svgContainer.removeEventListener("touchend", untrackTouch);
            }
        }

        let untrackTouch = function() {
            svgContainer.removeEventListener("touchmove", panViewer);
        }

        let gridPos = calcGridPos(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        svgContainer.addEventListener("touchmove", panViewer);
        svgContainer.addEventListener("touchend", untrackTouch, { once: true });
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
                svgContainer.removeEventListener("touchend", untrackTouchZoom);
            }
        }

        let untrackTouchZoom = function(event) {
            svgContainer.removeEventListener("touchmove", touchZoom);
        }

        let gridPos1 = calcGridPos(event.touches[0].clientX, event.touches[0].clientY);
        let gridPos2 = calcGridPos(event.touches[1].clientX, event.touches[1].clientY);
        let dist = Math.hypot(gridPos1.posX - gridPos2.posX, gridPos1.posY - gridPos2.posY);
        svgContainer.addEventListener("touchmove", touchZoom);
        svgContainer.addEventListener("touchend", untrackTouchZoom, { once: true });
    }

    let handleTouchMove = function(event) {
        event.preventDefault();
        if(event.touches.length == 1) {
            initTouchPan(event);
        } else if(event.touches.length == 2) {
            initTouchZoom(event);
        }
    }

    let handleTouch = function(event) {
        svgContainer.addEventListener("touchmove", handleTouchMove, { once: true });
    }

    let posEnlargedTree = function() {
        let header = document.querySelector("header");
        let footer = document.querySelector("footer");
        let distHeaderFooter = footer.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
        let availHeight = distHeaderFooter - 50;
        let availWidth = window.innerWidth - 100;
        let desiredWidth = availHeight * aspectRatio;
        if(desiredWidth < availWidth) {
            viewerContainer.style.width = `${desiredWidth}px`;
        } else {
            viewerContainer.style.width = `${availWidth}px`;
        }
        let posTop = (header.offsetHeight + (distHeaderFooter / 2)) - (viewerContainer.offsetHeight / 2);
        viewerContainer.style.top = `${posTop}px`;
    }

    let enlargeTree = function() {
        enlargeBtn.classList.remove("tree-viewer__btn--visible"); 
        minBtn.classList.add("tree-viewer__btn--visible"); 
        if(window.innerWidth > 900) {
            viewerContainer.classList.add("tree-viewer__viewer-container--enlarged");
            posEnlargedTree();
            window.addEventListener("resize", posEnlargedTree);
            window.addEventListener("click", autoCloseOnOutsideClick);
        } else {
            if(viewerContainer.requestFullscreen) {
                viewerContainer.requestFullscreen();
            } else {
                fsContainer.classList.add("tree-viewer__fullscreen-container--fs-polyfill");
                viewerContainer.classList.add("tree-viewer__viewer-container--fs-polyfill");
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
            window.removeEventListener("click", autoCloseOnOutsideClick);
        } else {
            if(viewerContainer.requestFullscreen) {
                document.exitFullscreen();
            } else {
                fsContainer.classList.remove("tree-viewer__fullscreen-container--fs-polyfill");
                viewerContainer.classList.remove("tree-viewer__viewer-container--fs-polyfill");
            }
        }
    }

    let autoCloseOnOutsideClick = function(event) {
        if(!treeViewer.contains(event.target)) minimizeTree();
    }

    let speciesLinks = treeViewer.querySelectorAll(".tree-viewer__tree-svg-link");
    let fsContainer = treeViewer.querySelector(".tree-viewer__fullscreen-container");
    let viewerContainer = treeViewer.querySelector(".tree-viewer__viewer-container");
    let svgContainer = treeViewer.querySelector(".tree-viewer__svg-container");
    let treeSvg = treeViewer.querySelector(".tree-viewer__tree-svg");
    let zoomInBtn = treeViewer.querySelector(".tree-viewer__zoom-in-btn");
    let zoomOutBtn = treeViewer.querySelector(".tree-viewer__zoom-out-btn");
    let enlargeBtn = treeViewer.querySelector(".tree-viewer__enlarge-btn");
    let minBtn = treeViewer.querySelector(".tree-viewer__min-btn");
    let aspectRatio = (viewerContainer.offsetWidth / viewerContainer.offsetHeight);
    let zoomWeight = 1.05;
    let currScale = 1;
    let currTranslateX = 0;
    let currTranslateY = 0;
    let urlAnchor = new URL(window.location.href).hash.substring(1); 

    svgContainer.addEventListener("wheel", handleWheel);
    // Not sure why, but adding the below event listener prevents pinch zoom on iOS.
    // The touchmove event in initTouchZoom already preventsDefault, but adding it here
    // is what actually prevents the pinch zoom 
    svgContainer.addEventListener("touchmove", (event) => event.preventDefault());
    svgContainer.addEventListener("mousedown", handleMouseDown);
    svgContainer.addEventListener("touchstart", handleTouch);
    zoomInBtn.addEventListener("click", () => zoomTree(0, 0, zoomWeight*1.25));
    zoomOutBtn.addEventListener("click", () => zoomTree(0, 0, 1/(zoomWeight*1.25)));
    enlargeBtn.addEventListener("click", enlargeTree);
    minBtn.addEventListener("click", minimizeTree);

    let openedPopUp;
    let highlightedLink;
    let hidePopUpTimeout;
    for(let speciesLink of speciesLinks) {
        let speciesId = speciesLink.getAttribute("data-species");
        let speciesExampleList = document.getElementById(`${speciesId}-exampleList`);
        if(!speciesExampleList) continue;

        let hidePopUp = function() {
            speciesExampleList.classList.add("species-example-list--hidden");
            speciesLink.classList.remove("tree-viewer__tree-svg-link--highlighted");
            window.removeEventListener("resize", hidePopUp);
            viewerContainer.removeEventListener("touchstart", detectTouchLeave);
        }

        let initHidePopUp = function() {
            hidePopUpTimeout = setTimeout(hidePopUp, 1000);
        }

        let detectTouchLeave = function(event) {
            if(!speciesLink.contains(event.target) && !speciesExampleList.contains(event.target)) {
                hidePopUp();
                viewerContainer.removeEventListener("touchstart", detectTouchLeave);
            }
        }

        let openPopUp = function(posX, posY) {
            speciesExampleList.classList.remove("species-example-list--hidden");
            openedPopUp = speciesExampleList;
            speciesExampleList.style.left = `${posX}px`;
            speciesExampleList.style.top = `${posY}px`;
            if(window.innerWidth < 900) {
                let gridPos = calcGridPos(posX, posY);
                let translateX = 0;
                let translateY = 0;
                let maxWidth;
                let maxHeight;
                if(gridPos.posX > 0) {
                    translateX = -100;
                    maxWidth = posX - 16;
                } else {
                    maxWidth = window.innerWidth - posX - 16;
                }
                if(gridPos.posY > 0) {
                    translateY = -100;
                    maxHeight = posY - 16;
                } else {
                    maxHeight = window.innerHeight - posY - 16;
                }
                speciesExampleList.style.transform = `translate(${translateX}%, ${translateY}%)`;
                speciesExampleList.style.maxWidth = `${maxWidth}px`;
                speciesExampleList.style.maxHeight = `${maxHeight}px`;
            }
            window.addEventListener("resize", hidePopUp, { once: true });
        }

        let focusLink = function() {
            if(openedPopUp) openedPopUp.classList.add("species-example-list--hidden");
            if(highlightedLink) highlightedLink.classList.remove("tree-viewer__tree-svg-link--highlighted");
            speciesLink.classList.add("tree-viewer__tree-svg-link--highlighted");
            highlightedLink = speciesLink;
        }

        let handleLinkMouseOver = function(event) {
            clearTimeout(hidePopUpTimeout);
            focusLink();
            openPopUp(event.clientX, event.clientY);
        }

        let handleLinkTouch = function(event) {
            event.preventDefault();

            let flagTouchmove = function () {
                validTap = false;
                hidePopUp();
                window.removeEventListener("touchmove", flagTouchmove);
            }

            let handleTouchend = function(event) {
                if(validTap) {
                    focusLink();
                    openPopUp(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                    viewerContainer.addEventListener("touchstart", detectTouchLeave);
                }
                window.removeEventListener("touchmove", flagTouchmove);
            }

            let validTap = true;
            window.addEventListener("touchmove", flagTouchmove);
            window.addEventListener("touchend", handleTouchend, { once: true });
        }

        let simulateOpenPopUp = function() {
            let initialLinkPos = { posX: speciesLink.getBoundingClientRect().x, posY: speciesLink.getBoundingClientRect().y };
            let gridPos = calcGridPos(initialLinkPos.posX, initialLinkPos.posY);
            let zoomAmount = (window.innerWidth >= 900) ? 2.5 : 4.5;
            panTree(gridPos.posX, gridPos.posY);
            zoomTree(0, 0, zoomWeight*zoomAmount);
            let newLinkPosX = speciesLink.getBoundingClientRect().x + (speciesLink.getBoundingClientRect().width / 2);
            let newLinkPosY = speciesLink.getBoundingClientRect().y + (speciesLink.getBoundingClientRect().height / 2) - 16;
            focusLink();
            openPopUp(newLinkPosX, newLinkPosY);
            viewerContainer.addEventListener("touchstart", detectTouchLeave);
        }

        let simulateOpenPopUpAndroid = function() {
            let initialLinkPos = { posX: speciesLink.getBoundingClientRect().x, posY: speciesLink.getBoundingClientRect().y };
            let gridPos = calcGridPos(initialLinkPos.posX, initialLinkPos.posY);
            let zoomAmount = (window.innerWidth >= 900) ? 2.5 : 4.5;
            panTree(gridPos.posX, gridPos.posY);
            zoomTree(0, 0, zoomWeight*zoomAmount);
            let newLinkPosX = speciesLink.getBoundingClientRect().x + (speciesLink.getBoundingClientRect().width / 2);
            let newLinkPosY = speciesLink.getBoundingClientRect().y + (speciesLink.getBoundingClientRect().height / 2) - 16;
            focusLink();
            setTimeout(() => {
                openPopUp(newLinkPosX, newLinkPosY);
                viewerContainer.addEventListener("touchstart", detectTouchLeave);
            }, 1000);
        };

        let handlePopUpHover = function() {
            clearTimeout(hidePopUpTimeout);
        }

        speciesLink.addEventListener("mouseenter", handleLinkMouseOver);
        speciesLink.addEventListener("touchstart", handleLinkTouch);
        speciesLink.addEventListener("mouseleave", initHidePopUp);
        speciesExampleList.addEventListener("mouseenter", handlePopUpHover);
        speciesExampleList.addEventListener("mouseleave", initHidePopUp);

        if(speciesId == urlAnchor) {
            if(window.innerWidth >= 900) {
                enlargeTree();
                simulateOpenPopUp();
            } else {
                let handleConfirm = function() {
                    if(viewerContainer.requestFullscreen) {
                        document.addEventListener("fullscreenchange", simulateOpenPopUpAndroid, { once: true });
                        enlargeTree();
                    } else {
                        enlargeTree();
                        simulateOpenPopUp();
                    }
                    fsTreeConfirm.classList.add("fs-tree-confirm--hidden");
                }

                let fsTreeConfirm = document.querySelector(".fs-tree-confirm");
                let confirmBtn = fsTreeConfirm.querySelector(".fs-tree-confirm__confirm-btn");
                confirmBtn.addEventListener("click", handleConfirm);
                fsTreeConfirm.classList.remove("fs-tree-confirm--hidden");
            }
        }
    }
}