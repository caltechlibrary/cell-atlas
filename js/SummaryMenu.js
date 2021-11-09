let SummaryMenu = function(root) {

    let menuContainer = root.querySelector(".summary-menu__menu-container");
    let menuItems = root.querySelectorAll(".summary-menu__li");
    let focusTranslateRatio = 0.0215;
    root.menuContainer = menuContainer;
    root.eventCache = [];
    root.prevDiff = -1;
    root.curScale = 1;
    root.curTranslateX = 0;
    root.curTranslateY = 0;
    root.zoomWeight = 1.025;

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

    let onPointerdown = function(event) {
        this.eventCache.push(event);
    };

    let onPointermove = function(event) {
        let prevGridPos1 = calcGridPos(this.eventCache[0].clientX, this.eventCache[0].clientY);
        let zoomFactor = 1;
        let gridPos1, gridPos2, curDiff, midPoint;

        for (let i = 0; i < this.eventCache.length; i++) {
            if (event.pointerId == this.eventCache[i].pointerId) {
                this.eventCache[i] = event;
                break;
            }
        }
        
        gridPos1 = calcGridPos(this.eventCache[0].clientX, this.eventCache[0].clientY);

        this.curTranslateX = this.curTranslateX - (prevGridPos1.posX - gridPos1.posX);
        this.curTranslateY = this.curTranslateY - (gridPos1.posY - prevGridPos1.posY);

        if (this.eventCache.length == 2) {
            gridPos2 = calcGridPos(this.eventCache[1].clientX, this.eventCache[1].clientY);
            curDiff = Math.hypot(gridPos1.posX - gridPos2.posX, gridPos1.posY - gridPos2.posY);
            midPoint = {
                posX: (gridPos1.posX + gridPos2.posX) / 2,
                posY: (gridPos1.posY + gridPos2.posY) / 2,
            };
            
            if (this.prevDiff > 0) {
                if (curDiff > this.prevDiff) {
                    zoomFactor = this.zoomWeight;
                }
                if (curDiff < this.prevDiff) {
                    zoomFactor = (1 / this.zoomWeight);
                }
            }

            this.curTranslateX = this.curTranslateX - ( (midPoint.posX - this.curTranslateX) * (zoomFactor - 1) );
            this.curTranslateY = this.curTranslateY - ( (this.curTranslateY - midPoint.posY) * (zoomFactor - 1) );
            this.curScale = this.curScale * zoomFactor;
            
            this.prevDiff = curDiff;
        }

        this.menuContainer.style.transform = `matrix(${this.curScale}, 0, 0, ${this.curScale}, ${this.curTranslateX}, ${this.curTranslateY})`;
    };

    let onPointerup = function(event) {
        for (let i = 0; i < this.eventCache.length; i++) {
            if (this.eventCache[i].pointerId == event.pointerId) {
                this.eventCache.splice(i, 1);
                break;
            }
        }

        if (this.eventCache.length < 2) {
            this.prevDiff = -1;
        }
    };

    let calcGridPos = function(pageX, pageY) {
        let centerX = (root.getBoundingClientRect().right - root.getBoundingClientRect().x) / 2;
        let centerY = (root.getBoundingClientRect().bottom - root.getBoundingClientRect().y) / 2;
        let posX = (pageX - root.getBoundingClientRect().x) - centerX;
        let posY = centerY - (pageY - root.getBoundingClientRect().y);
        return { posX, posY };
    };

    resizeMenuContainer();
    window.addEventListener("resize", resizeMenuContainer);
    for(let menuItem of menuItems) {
        menuItem.addEventListener("mouseenter", activateMenuPart);
        menuItem.addEventListener("mouseleave", deactivateMenuPart);
        menuItem.addEventListener("keydown", handleItemKeydown);
    }
    root.addEventListener("pointerdown", onPointerdown);
    root.addEventListener("pointermove", onPointermove);
    root.addEventListener("pointerup", onPointerup);
    root.addEventListener("pointercancel", onPointerup);
    root.addEventListener("pointerout", onPointerup);
    root.addEventListener("pointerleave", onPointerup);

    return {
        root,
        resizeMenuContainer
    }

}