/**
 * Creates a summary menu widget and returns summary menu object.
 *
 * @param root The dom element being registered as a summary menu.
 */
let SummaryMenu = function(root) {

    // Create frequently used variables and references to frequently used dom elements.
    let menuContainer = root.querySelector(".summary-menu__menu-container");
    let menuItems = root.querySelectorAll(".summary-menu__li");

    // Degree of distance that summary menu will move when selected.
    let focusTranslateRatio = 0.0215;

    /**
     * Variables used for menu panning and zooming.
     * 
     * These variables are defined on root and accessed in related methods using 
     * "this". This was done initially because panning/zooming did not work without it. 
     * However, a quick test showed that it might work with these variables being 
     * defined/accessed regulary without using "root"/"this". Through refactoring over time
     * it is possible that the need for "root"/"this" is no longer necessary. Might be worth 
     * removing and testing for clearer/easier code.
     * 
     * The method for touch zooming and panning is modeled after mdn's Pinch zoom gestures
     * article: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
     */

    // Define menuContainer on root to provide access in pan/zoom pointer methods.
    root.menuContainer = menuContainer;
    // Event cache used to track pointer events during panning/zooming.
    root.eventCache = [];
    // Previous distance between 2 pointers during pinch zooming. Used to calculate if zooming in/out.
    root.prevDiff = -1;
    // Current scale of summary menu changed during zooming.
    root.curScale = 1;
    // Current offset coordinates changed during zooming/panning.
    root.curTranslateX = 0;
    root.curTranslateY = 0;
    // Degree of zoom that menu will scale when pinch zooming.
    root.zoomWeight = 1.025;

    /**
     * Resize menuContainer element to keep 1:1 ratio relative to root elem, where 
     * root elem can have a more responsive size. Fired on initialization, window 
     * resize, and returned as public method to allow manual resizing.
     */
    let resizeMenuContainer = function() {
        let sideLength = Math.min(root.clientWidth, root.clientHeight);
        menuContainer.style.width = `${sideLength}px`;
        menuContainer.style.height = `${sideLength}px`;
    };

    /**
     * Activate menu item. Activation involves showing item text and visually 
     * modifying menu item graphic. Deactivates currently selected menu item.
     * Fired on menu item focus/mouseenter.
     *
     * @param event Event object created by menu item focus/mouseenter event.
     */
    let activateMenuPart = function(event) {
        let menuItem = event.target;
        let currentOpened = root.querySelector(".summary-menu__li--active");
        let partGraphic = menuItem.querySelector(".summary-menu__item-graphic");
        let partText = menuItem.querySelector(".summary-menu__li-text");

        // Get coordinates for menu/graphic center to calculate translate direction so that 
        // item can always translate away from menu center. Use helper function so we can use
        // elem's center coordinate for more accuracy.
        let menuCenterCords = getElementPageCords(menuContainer);
        let menuItemCords = getElementPageCords(menuItem);
        // Translate distance is product of focusTranslateRatio var and size of menuContainer.
        let translateDist = focusTranslateRatio * menuContainer.clientWidth;
        let tx = (menuItemCords.pageX > menuCenterCords.pageX) ? translateDist : -translateDist;
        let ty = (menuItemCords.pageY >  menuCenterCords.pageY) ? translateDist : -translateDist;

        // Deactivate current selected item. Passed as object since deactivateMenuPart expects event object.
        if(currentOpened) deactivateMenuPart({ target: currentOpened });

        // Activate menu item by showing text and modifying item graphic.
        menuItem.classList.add("summary-menu__li--active");
        partGraphic.style.transform = `scale(1.125) translate(${tx}px, ${ty}px)`;
        partText.classList.remove("summary-menu__li-text--hidden");
    };

    /**
     * Calculate center of dom elem relevant to page. Called when activating
     * menu item in activateMenuPart() to calculate item translate direciton.
     *
     * @param el dom elem to calculate center of.
     */
    let getElementPageCords = function(el) {
        let elClientRect = el.getBoundingClientRect();
        let pageX = elClientRect.right - ((elClientRect.right - elClientRect.left) / 2);
        let pageY = elClientRect.bottom - ((elClientRect.bottom - elClientRect.top) / 2);
        return { pageX, pageY };
    };

    /**
     * Deactivate menu item. Deactivation involves hiding item text and visually 
     * resetting menu item graphic. Essentially resets what was done in activateMenuPart(). 
     * Fired on menu item mouseleave/blur event and called when activating a new 
     * menu item in activateMenuPart().
     *
     * @param event Event object created by menu item mouseleave/blur event.
     */
    let deactivateMenuPart = function(event) {
        let menuItem = event.target;
        let partGraphic = menuItem.querySelector(".summary-menu__item-graphic");
        let partText = menuItem.querySelector(".summary-menu__li-text");
        menuItem.classList.remove("summary-menu__li--active");
        partGraphic.style.transform = `translate(0, 0)`;
        partText.classList.add("summary-menu__li-text--hidden");
    };

    /**
     * Adds pointer event to event cache that is used in onPointermove to 
     * calculate menu zooming/panning. Fired on root pointerdown event.
     *
     * @param event Event object created by root pointerdown event.
     */
    let onPointerdown = function(event) {
        this.eventCache.push(event);
    };

    /**
     * Pan/zoom menu based on pointer events in event cache. Fired on root
     * pointermove event.
     * 
     * This event handler is a little all over the place and could probably use 
     * some refactoring to seperate things into smaller function calls.
     * 
     * The method for touch zooming and panning is modeled after mdn's Pinch zoom gestures
     * article: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
     *
     * @param event Event object created by root pointermove event.
     */
    let onPointermove = function(event) {
        // Only recognize touch events. This control would probably be cleaner if placed in onPointerdown().
        if(event.pointerType != "touch") return;
        // Get position of first event in event cache relative to root center as if it is a cartesian graph.
        // Critical to do this before we update any pointer events below
        let prevGridPos1 = calcGridPos(this.eventCache[0].clientX, this.eventCache[0].clientY);
        // Set zoomFactor to 1. Menu will not scale up or down. Assume no zoom.
        let zoomFactor = 1;
        let gridPos1, gridPos2, curDiff, midPoint;

        // Find this event in the cache and update its record with this event.
        for (let i = 0; i < this.eventCache.length; i++) {
            if (event.pointerId == this.eventCache[i].pointerId) {
                this.eventCache[i] = event;
                break;
            }
        }
        
        // Get position of first event in (updated) event cache.
        gridPos1 = calcGridPos(this.eventCache[0].clientX, this.eventCache[0].clientY);

        // If we have a pointermove event, then we are at least panning. Calculate direction to pan
        // based on previous position of the first pointer event in the event cache.
        this.curTranslateX = this.curTranslateX - (prevGridPos1.posX - gridPos1.posX);
        this.curTranslateY = this.curTranslateY - (gridPos1.posY - prevGridPos1.posY);

        // If eventCache == 2, assume pinch zooming
        if (this.eventCache.length == 2) {
            // Get position of second event in (updated) event cache.
            gridPos2 = calcGridPos(this.eventCache[1].clientX, this.eventCache[1].clientY);
            // Calculate the current distance between pointers.
            curDiff = Math.hypot(gridPos1.posX - gridPos2.posX, gridPos1.posY - gridPos2.posY);
            // Calculate midpoint of pointer events to use as a target of where to zoom/pan.
            midPoint = {
                posX: (gridPos1.posX + gridPos2.posX) / 2,
                posY: (gridPos1.posY + gridPos2.posY) / 2,
            };
            
            // If prevDiff is defined, we can calculate a new zoom factor.
            if (this.prevDiff > 0) {
                if (curDiff > this.prevDiff) {
                    zoomFactor = this.zoomWeight;
                }
                if (curDiff < this.prevDiff) {
                    zoomFactor = (1 / this.zoomWeight);
                }
            }

            // Calculate/set new direction to pan and scale. Modifies previously calculate pan direciton
            // since zooming should also pan the menu towards the zoom midpoint.
            this.curTranslateX = this.curTranslateX - ( (midPoint.posX - this.curTranslateX) * (zoomFactor - 1) );
            this.curTranslateY = this.curTranslateY - ( (this.curTranslateY - midPoint.posY) * (zoomFactor - 1) );
            this.curScale = this.curScale * zoomFactor;
            
            // Update previous pointer distance for the next pointer move event.
            this.prevDiff = curDiff;
        }

        // Update the menu container with new styles calculated above.
        this.menuContainer.style.transform = `matrix(${this.curScale}, 0, 0, ${this.curScale}, ${this.curTranslateX}, ${this.curTranslateY})`;
    };

    /**
     * Remove pointer from pointer event cache. Reset prevDiff used to calculate 
     * pinch zooming in onPointermove(). Fired on root pointerup event.
     *
     * @param event Event object created by root pointerup event.
     */
    let onPointerup = function(event) {
        for (let i = 0; i < this.eventCache.length; i++) {
            if (this.eventCache[i].pointerId == event.pointerId) {
                this.eventCache.splice(i, 1);
                break;
            }
        }
        
        // If the number of pointers down is less than two then reset prevDiff.
        if (this.eventCache.length < 2) {
            this.prevDiff = -1;
        }
    };

    /**
     * Calculate position of page coordinates relative to root center as if it 
     * is a cartesian graph.
     * 
     * @param pageX Page x coordinate.
     * @param pageY Page y coordinate.
     */
    let calcGridPos = function(pageX, pageY) {
        let centerX = (root.getBoundingClientRect().right - root.getBoundingClientRect().x) / 2;
        let centerY = (root.getBoundingClientRect().bottom - root.getBoundingClientRect().y) / 2;
        let posX = (pageX - root.getBoundingClientRect().x) - centerX;
        let posY = centerY - (pageY - root.getBoundingClientRect().y);
        return { posX, posY };
    };

    // Reset menu container to maintain 1:1 ratio relative to root and keep it that
    // way on resize events.
    resizeMenuContainer();
    window.addEventListener("resize", resizeMenuContainer);

    // Add event listeners to menu items that facilitate menu item activation/deactivation.
    for(let menuItem of menuItems) {
        menuItem.addEventListener("mouseenter", activateMenuPart);
        menuItem.addEventListener("focus", activateMenuPart);
        menuItem.addEventListener("mouseleave", deactivateMenuPart);
        menuItem.addEventListener("blur", deactivateMenuPart);
    }

    // Add event listeners to root that facilitate pointer panning/zooming.
    root.addEventListener("pointerdown", onPointerdown);
    root.addEventListener("pointermove", onPointermove);
    root.addEventListener("pointerup", onPointerup);
    root.addEventListener("pointercancel", onPointerup);
    root.addEventListener("pointerout", onPointerup);
    root.addEventListener("pointerleave", onPointerup);

    // Return public properties/methods.
    return {
        root,
        resizeMenuContainer
    }

}