let SummaryMenu = (function() {

    let nonTextSection = document.getElementById("nonTextContent");
    let summaryMenu = document.querySelector(".summary-menu");
    let menuWidget = summaryMenu.querySelector(".summary-menu__widget");
    let menuContainer = summaryMenu.querySelector(".summary-menu__container");
    let menuItems = summaryMenu.querySelectorAll(".summary-menu__li");
    let mobileSummaryBtn = document.querySelector(".mobile-controls__btn[value='sum']");
    let enlargeBtn = summaryMenu.querySelector(".summary-menu__enlarge-btn");
    let minBtn = summaryMenu.querySelector(".summary-menu__min-btn");
    let textContent = document.querySelector(".section-text");
    let textShelveBtn = document.querySelector(".section-text__shelve-btn");
    let textUnshelveBtn = document.querySelector(".section-text__unshelve-btn");
    let focusTranslateRatio = 0.0215;
    let currTranslateX = 0;
    let currTranslateY = 0;
    let currScale = 1;
    let zoomWeight = 1.05;

    let resizeMenuContainer = function(event) {
        let sideLength = Math.min(menuWidget.clientWidth, menuWidget.clientHeight);
        menuContainer.style.width = `${sideLength}px`;
        menuContainer.style.height = `${sideLength}px`;
    };

    let activateMenuPart = function(event) {
        let menuItem = event.target;
        let currentOpened = summaryMenu.querySelector(".summary-menu__li--active");
        let partGraphic = menuItem.querySelector(".summary-menu__item-graphic");
        let partText = menuItem.querySelector(".summary-menu__li-text");
        let menuCenterX = menuContainer.getBoundingClientRect().right - ((menuContainer.getBoundingClientRect().right - menuContainer.getBoundingClientRect().left) / 2);
        let menuCenterY = menuContainer.getBoundingClientRect().bottom - ((menuContainer.getBoundingClientRect().bottom - menuContainer.getBoundingClientRect().top) / 2);
        let itemCordX = menuItem.getBoundingClientRect().right - ((menuItem.getBoundingClientRect().right - menuItem.getBoundingClientRect().left) / 2);
        let itemCordY = menuItem.getBoundingClientRect().bottom - ((menuItem.getBoundingClientRect().bottom - menuItem.getBoundingClientRect().top) / 2);
        let translateDist = focusTranslateRatio * menuContainer.clientWidth;
        let tx = (itemCordX > menuCenterX) ? translateDist : -translateDist;
        let ty = (itemCordY > menuCenterY) ? translateDist : -translateDist;
        if(currentOpened) deactivateMenuPart({ target: currentOpened });
        partGraphic.style.transform = `scale(1.125) translate(${tx}px, ${ty}px)`;
        partText.classList.remove("summary-menu__li-text--hidden");
        partText.classList.remove("summary-menu__li-text--transparent");
        menuItem.classList.add("summary-menu__li--active");
    };

    let hidePartText = function(event) {
        let partText = event.target;
        if(partText.classList.contains("summary-menu__li-text--transparent")) partText.classList.add("summary-menu__li-text--hidden");
    };

    let deactivateMenuPart = function(event) {
        let menuItem = event.target;
        let partGraphic = menuItem.querySelector(".summary-menu__item-graphic");
        let partText = menuItem.querySelector(".summary-menu__li-text");
        partGraphic.style.transform = `translate(0, 0)`;
        partText.addEventListener("transitionend", hidePartText ,{ once: true });
        partText.classList.add("summary-menu__li-text--transparent");
        menuItem.classList.remove("summary-menu__li--active");
    }; 

    let handleItemKeydown = function(event) {
        if(event.keyCode == 13 || event.keyCode == 32) {
            if(event.target.classList.contains("summary-menu__li--active")) {
                deactivateMenuPart(event);
            } else {
                activateMenuPart(event);
            }
        } else if(event.keyCode == 9 && event.target.classList.contains("summary-menu__li--active")){
            deactivateMenuPart(event);
        }
    };

    let enlargeMenu = function() {
        enlargeBtn.classList.add("summary-menu__btn--hidden"); 
        minBtn.classList.remove("summary-menu__btn--hidden");
        if(window.innerWidth > 900) {
            minBtn.disabled = true;
            textUnshelveBtn.addEventListener("transitionend", () => minBtn.disabled = false, { once: true });
            textShelveBtn.click();
        } else {
            if(menuWidget.requestFullscreen) {
                document.addEventListener("fullscreenchange", resizeMenuContainer, { once: true });
                menuWidget.requestFullscreen();
            } else {
                summaryMenu.classList.remove("summary-menu--nontext-section");
                summaryMenu.classList.add("summary-menu--fs-polyfill");
                nonTextSection.classList.add("book-section-non-text-content--fs-polyfill");
                resizeMenuContainer();
            }
        }
    };

    let minimizeMenu = function() {
        enlargeBtn.classList.remove("summary-menu__btn--hidden"); 
        minBtn.classList.add("summary-menu__btn--hidden");
        if(window.innerWidth > 900) {
            enlargeBtn.disabled = true;
            textContent.addEventListener("transitionend", () => enlargeBtn.disabled = false, { once: true });
            textUnshelveBtn.click();
        } else {
            if(menuWidget.requestFullscreen) {
                document.addEventListener("fullscreenchange", resizeMenuContainer, { once: true });
                document.exitFullscreen();
            } else {
                summaryMenu.classList.add("summary-menu--nontext-section");
                summaryMenu.classList.remove("summary-menu--fs-polyfill");
                nonTextSection.classList.remove("book-section-non-text-content--fs-polyfill");
                resizeMenuContainer();
            }
        }
    };

    let respondToTextShelving = function() {
        let resizeInterval = setInterval(resizeMenuContainer, 1000/60);
        textContent.addEventListener("transitionend", () => clearInterval(resizeInterval), { once: true });
        enlargeBtn.classList.add("summary-menu__btn--hidden"); 
        minBtn.classList.remove("summary-menu__btn--hidden");
        minBtn.disabled = true;
        textUnshelveBtn.addEventListener("transitionend", () => minBtn.disabled = false, { once: true });
    };

    let respondToTextUnshelving = function() {
        let resizeInterval = setInterval(resizeMenuContainer, 1000/60);
        textUnshelveBtn.addEventListener("transitionend", () => clearInterval(resizeInterval), { once: true });
        enlargeBtn.classList.remove("summary-menu__btn--hidden"); 
        minBtn.classList.add("summary-menu__btn--hidden");
        enlargeBtn.disabled = true;
        textContent.addEventListener("transitionend", () => enlargeBtn.disabled = false, { once: true });
    };

    let calcGridPos = function(pageX, pageY) {
        let centerX = (menuWidget.getBoundingClientRect().right - menuWidget.getBoundingClientRect().x) / 2;
        let centerY = (menuWidget.getBoundingClientRect().bottom - menuWidget.getBoundingClientRect().y) / 2;
        let posX = (pageX - menuWidget.getBoundingClientRect().x) - centerX;
        let posY = (pageY - menuWidget.getBoundingClientRect().y) - centerY;
        return { posX, posY };
    };

    let panMenu = function(cordX, cordY) {
        currTranslateX-= cordX;
        currTranslateY-= cordY;
        menuContainer.style.transform = `matrix(${currScale}, 0, 0, ${currScale}, ${currTranslateX}, ${currTranslateY})`;
    }

    let zoomMenu = function(cordX, cordY, zoomFactor) {
        let dx = (cordX - currTranslateX) * (zoomFactor - 1);
        let dy = (cordY - currTranslateY) * (zoomFactor - 1);
        currTranslateX-= dx;
        currTranslateY-= dy;
        currScale*= zoomFactor;
        menuContainer.style.transform = `matrix(${currScale}, 0, 0, ${currScale}, ${currTranslateX}, ${currTranslateY})`;
    }

    let initTouchPan = function(event) {
        let trackTouchmove = function(event) {
            event.preventDefault();
            if(event.touches.length == 1) {
                let newGridPos = calcGridPos(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                panMenu(gridPos.posX - newGridPos.posX, gridPos.posY - newGridPos.posY);
                gridPos.posX = newGridPos.posX;
                gridPos.posY = newGridPos.posY;
            } else {
                untrackTouch();
                menuWidget.removeEventListener("touchend", untrackTouch);
            }
        }

        let untrackTouch = function() {
            menuWidget.removeEventListener("touchmove", trackTouchmove);
        }

        let gridPos = calcGridPos(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        menuWidget.addEventListener("touchmove", trackTouchmove);
        menuWidget.addEventListener("touchend", untrackTouch, { once: true });
    };

    let initTouchZoom = function(event) {
        let trackZoom = function(event) {
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
                    zoomMenu(midPoint.posX, midPoint.posY, 1/zoomWeight);
                } else {
                    zoomMenu(midPoint.posX, midPoint.posY, zoomWeight);
                }

                dist-= deltaDist;
            } else {
                untrackTouchZoom();
                menuWidget.removeEventListener("touchend", untrackTouchZoom);
            }
        }

        let untrackTouchZoom = function(event) {
            menuWidget.removeEventListener("touchmove", trackZoom);
        }

        let gridPos1 = calcGridPos(event.touches[0].clientX, event.touches[0].clientY);
        let gridPos2 = calcGridPos(event.touches[1].clientX, event.touches[1].clientY);
        let dist = Math.hypot(gridPos1.posX - gridPos2.posX, gridPos1.posY - gridPos2.posY);
        menuWidget.addEventListener("touchmove", trackZoom);
        menuWidget.addEventListener("touchend", untrackTouchZoom, { once: true });
    }

    let handleTouchMove = function(event) {
        event.preventDefault();
        if(event.touches.length == 1) {
            initTouchPan(event);
        } else if(event.touches.length == 2) {
            initTouchZoom(event);
        }
    };

    let handleTouch = function(event) {
        menuWidget.addEventListener("touchmove", handleTouchMove, { once: true });
    }

    resizeMenuContainer();
    window.addEventListener("resize", resizeMenuContainer);
    mobileSummaryBtn.addEventListener("click", resizeMenuContainer);
    enlargeBtn.addEventListener("click", enlargeMenu);
    minBtn.addEventListener("click", minimizeMenu);
    textShelveBtn.addEventListener("click", respondToTextShelving);
    textUnshelveBtn.addEventListener("click", respondToTextUnshelving);
    menuWidget.addEventListener("touchstart", handleTouch);

    for(let menuItem of menuItems) {
        menuItem.addEventListener("mouseenter", activateMenuPart);
        menuItem.addEventListener("mouseleave", deactivateMenuPart);
        menuItem.addEventListener("keydown", handleItemKeydown);
    }

    return {
        resizeMenuContainer
    }
})();