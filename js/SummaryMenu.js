let SummaryMenu = function(root) {

    let menuContainer = root.querySelector(".summary-menu__menu-container");
    let menuItems = root.querySelectorAll(".summary-menu__li");
    let focusTranslateRatio = 0.0215;
    let currTranslateX = 0;
    let currTranslateY = 0;
    let currScale = 1;
    let zoomWeight = 1.05;

    let resizeMenuContainer = function() {
        let sideLength = Math.min(root.clientWidth, root.clientHeight);
        menuContainer.style.width = `${sideLength}px`;
        menuContainer.style.height = `${sideLength}px`;
    };

    let activateMenuPart = function(event) {
        let menuItem = event.target;
        let currentOpened = root.querySelector(".summary-menu__li--active");
        let partGraphic = menuItem.querySelector(".summary-menu__item-graphic");
        let partText = menuItem.querySelector(".summary-menu__li-text");
        let menuCenterCords = getElementPageCords(menuContainer);
        let menuItemCords = getElementPageCords(menuItem);
        let translateDist = focusTranslateRatio * menuContainer.clientWidth;
        let tx = (menuItemCords.pageX > menuCenterCords.pageX) ? translateDist : -translateDist;
        let ty = (menuItemCords.pageY >  menuCenterCords.pageY) ? translateDist : -translateDist;
        if(currentOpened) deactivateMenuPart({ target: currentOpened });
        menuItem.classList.add("summary-menu__li--active");
        partGraphic.style.transform = `scale(1.125) translate(${tx}px, ${ty}px)`;
        partText.classList.remove("summary-menu__li-text--hidden");
    };

    let getElementPageCords = function(el) {
        let elClientRect = el.getBoundingClientRect();
        let pageX = elClientRect.right - ((elClientRect.right - elClientRect.left) / 2);
        let pageY = elClientRect.bottom - ((elClientRect.bottom - elClientRect.top) / 2);
        return { pageX, pageY };
    };

    let deactivateMenuPart = function(event) {
        let menuItem = event.target;
        let partGraphic = menuItem.querySelector(".summary-menu__item-graphic");
        let partText = menuItem.querySelector(".summary-menu__li-text");
        menuItem.classList.remove("summary-menu__li--active");
        partGraphic.style.transform = `translate(0, 0)`;
        partText.classList.add("summary-menu__li-text--hidden");
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

    let handleTouch = function(event) {
        root.addEventListener("touchmove", handleTouchMove, { once: true });
    };

    let handleTouchMove = function(event) {
        event.preventDefault();
        if(event.touches.length == 1) {
            initTouchPan(event);
        } else if(event.touches.length == 2) {
            initTouchZoom(event);
        }
    };

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
                root.removeEventListener("touchend", untrackTouch);
            }
        }

        let untrackTouch = function() {
            root.removeEventListener("touchmove", trackTouchmove);
        }

        let gridPos = calcGridPos(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        root.addEventListener("touchmove", trackTouchmove);
        root.addEventListener("touchend", untrackTouch, { once: true });
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
                root.removeEventListener("touchend", untrackTouchZoom);
            }
        }

        let untrackTouchZoom = function(event) {
            root.removeEventListener("touchmove", trackZoom);
        }

        let gridPos1 = calcGridPos(event.touches[0].clientX, event.touches[0].clientY);
        let gridPos2 = calcGridPos(event.touches[1].clientX, event.touches[1].clientY);
        let dist = Math.hypot(gridPos1.posX - gridPos2.posX, gridPos1.posY - gridPos2.posY);
        root.addEventListener("touchmove", trackZoom);
        root.addEventListener("touchend", untrackTouchZoom, { once: true });
    };

    let calcGridPos = function(pageX, pageY) {
        let centerX = (root.getBoundingClientRect().right - root.getBoundingClientRect().x) / 2;
        let centerY = (root.getBoundingClientRect().bottom - root.getBoundingClientRect().y) / 2;
        let posX = (pageX - root.getBoundingClientRect().x) - centerX;
        let posY = (pageY - root.getBoundingClientRect().y) - centerY;
        return { posX, posY };
    };

    let panMenu = function(cordX, cordY) {
        currTranslateX-= cordX;
        currTranslateY-= cordY;
        menuContainer.style.transform = `matrix(${currScale}, 0, 0, ${currScale}, ${currTranslateX}, ${currTranslateY})`;
    };

    let zoomMenu = function(cordX, cordY, zoomFactor) {
        let dx = (cordX - currTranslateX) * (zoomFactor - 1);
        let dy = (cordY - currTranslateY) * (zoomFactor - 1);
        currTranslateX-= dx;
        currTranslateY-= dy;
        currScale*= zoomFactor;
        menuContainer.style.transform = `matrix(${currScale}, 0, 0, ${currScale}, ${currTranslateX}, ${currTranslateY})`;
    };

    resizeMenuContainer();
    window.addEventListener("resize", resizeMenuContainer);
    for(let menuItem of menuItems) {
        menuItem.addEventListener("mouseenter", activateMenuPart);
        menuItem.addEventListener("mouseleave", deactivateMenuPart);
        menuItem.addEventListener("keydown", handleItemKeydown);
    }
    root.addEventListener("touchstart", handleTouch);

    return {
        root,
        resizeMenuContainer
    }

}