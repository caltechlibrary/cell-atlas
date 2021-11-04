let SummaryMenu = function(root) {

    let menuContainer = root.querySelector(".summary-menu__menu-container");
    let menuItems = root.querySelectorAll(".summary-menu__li");
    let focusTranslateRatio = 0.0215;
    let currTranslateX = 0;
    let currTranslateY = 0;
    let currScale = 1;
    let zoomWeight = 1.05;
    let prevTouchPos1, prevTouchPos2, prevDist;

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

    let handleTouchMove = function(event) {
        event.preventDefault();
        let newTouchPos1, newTouchPos2, newDist, midPointX, midPointY, zoomFactor;
        newTouchPos1 = calcGridPos(event.touches[0].clientX, event.touches[0].clientY);
        if(prevTouchPos1) {
            currTranslateX-= prevTouchPos1.posX - newTouchPos1.posX;
            currTranslateY-= newTouchPos1.posY - prevTouchPos1.posY;
        }
        if(event.touches[1]) {
            newTouchPos2 = calcGridPos(event.touches[1].clientX, event.touches[1].clientY);
            newDist = Math.hypot(newTouchPos1.posX - newTouchPos2.posX, newTouchPos1.posY - newTouchPos2.posY);
            midPointX = (newTouchPos1.posX + newTouchPos2.posX) / 2;
            midPointY = (newTouchPos1.posY + newTouchPos2.posY) / 2;
            if(prevDist) {
                zoomFactor = (prevDist - newDist >= 0) ? 1 / zoomWeight : zoomWeight;
                currTranslateX-= (midPointX - currTranslateX) * (zoomFactor - 1);
                currTranslateY-= (currTranslateY - midPointY) * (zoomFactor - 1);
                currScale*= zoomFactor;
            }
        }
        menuContainer.style.transform = `matrix(${currScale}, 0, 0, ${currScale}, ${currTranslateX}, ${currTranslateY})`;
        prevTouchPos1 = newTouchPos1;
        prevTouchPos2 = newTouchPos2;
        prevDist = newDist;
    };

    let calcGridPos = function(pageX, pageY) {
        let centerX = (root.getBoundingClientRect().right - root.getBoundingClientRect().x) / 2;
        let centerY = (root.getBoundingClientRect().bottom - root.getBoundingClientRect().y) / 2;
        let posX = (pageX - root.getBoundingClientRect().x) - centerX;
        let posY = centerY - (pageY - root.getBoundingClientRect().y);
        return { posX, posY };
    };

    let handleTouchEnd = function(event) {
        prevTouchPos1 = undefined;
        if(event.touches.length == 0) {
            prevTouchPos2 = undefined;
            prevDist = undefined;
        }
    };

    resizeMenuContainer();
    window.addEventListener("resize", resizeMenuContainer);
    for(let menuItem of menuItems) {
        menuItem.addEventListener("mouseenter", activateMenuPart);
        menuItem.addEventListener("mouseleave", deactivateMenuPart);
        menuItem.addEventListener("keydown", handleItemKeydown);
    }
    root.addEventListener("touchmove", handleTouchMove);
    root.addEventListener("touchend", handleTouchEnd);

    return {
        root,
        resizeMenuContainer
    }

}