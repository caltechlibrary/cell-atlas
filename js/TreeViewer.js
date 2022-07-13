/**
 * Creates a tree viewer widget and returns tree viewer object.
 *
 * @param root The dom element being registered as a tree viewer.
 */
let TreeViewer = function(root) {

    // Create references to frequently used dom elements.
    let svgContainer = root.querySelector(".tree-viewer__svg-container");
    let treeSvg = root.querySelector(".tree-viewer__tree-svg");
    let speciesAnchors = root.querySelectorAll(".tree-viewer__species-anchor");
    let popUps = root.querySelectorAll(".tree-viewer__pop-up");
    let zoomControlscontainer = root.querySelector(".tree-viewer__zoom-controls");
    let zoomInBtn = root.querySelector(".tree-viewer__zoom-btn-in");
    let zoomOutBtn = root.querySelector(".tree-viewer__zoom-btn-out");

    // Timeout used to close pop up windows after inactivity.
    let deactivatePopUp;

    /**
     * Variables used for menu panning and zooming.
     * 
     * The method for touch zooming and panning is modeled after mdn's Pinch zoom gestures
     * article: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
     */
    let eventCache = [];

    // Variables used to determine degree of zoom distance during zoom operations.
    let btnZoomWeight = 1.3;
    let wheelZoomWeight = 1.05;
    let touchZoomWeight = 1.025;
    
    /**
     * Variables used to keep track of curr tree 
     * translations during zoom/pan. This is done 
     * to prevent calculating curr translations
     * using Window.getComputedStyle(), which would 
     * use messy string manipulation.
     * 
     * Using getComputedStyle is less management. 
     * But using globals removes dependency on
     * getComputedStyle() string format.
     */
    let curScale = 1;
    let curTranslateX = 0;
    let curTranslateY = 0;

    // Variables used to calculate zoom destination/direction during zoom operations.
    let prevMidPoint, prevDist;

    /**
     * Called on svgContainer focus. Enables keyboard panning 
     * functionality.
     */
    let activateKeyboardPanning = function() {
        document.addEventListener("keydown", onKeyboardPan);
    };

    /**
     * Called on document keydown. Pans tree based on key press.
     *
     * @param event Keydown event that initiated this function.
     */
    let onKeyboardPan = function(event) {
        if(event.key == "ArrowUp" || event.key == "ArrowRight" || event.key == "ArrowDown" || event.key == "ArrowLeft") {
            // Necessary to prevent default functionality to prevent page scrolling.
            event.preventDefault();

            if(event.key == "ArrowUp") {
                panTree(0, 5);
            } else if (event.key == "ArrowRight") {
                panTree(-5, 0);
            } else if (event.key == "ArrowDown") {
                panTree(0, -5);
            } else if (event.key == "ArrowLeft") {
                panTree(5, 0);
            }
        }
    };

    /**
     * Called on svgContainer blur. Disables keyboard panning 
     * functionality.
     */
    let deactivateKeyboardPanning = function() {
        document.removeEventListener("keydown", onKeyboardPan);
    };

    /**
     * Called on speciesAnchor mouseenter/click. Activates 
     * species entry at mouse position.
     *
     * @param event mouseenter/click event that initiated this function.
     */
    let onSpeciesAnchorFocus = function(event) {
        activateSpeciesEntry(event.currentTarget.getAttribute("data-species"), event.clientX, event.clientY);
    };

    /**
     * Activates a species entry anchor and pop up.
     *
     * @param id id/species value of the species popup elem/anchor elem.
     * @param posX x position to open popup relative to viewport.
     * @param posY y position to open popup relative to viewport.
     */
    let activateSpeciesEntry = function(id, posX, posY) {
        let speciesAnchor = root.querySelector(`.tree-viewer__species-anchor[data-species='${id}']`);
        let popUp = root.querySelector(`#${id}`);

        // Clear possible entry deactivation timeout and instead:
        // If current entry is already activated, return. Timeout was cleared so menu won't undesirably close.
        // If other entry is activated, deactivate it manually now and activate new entry.
        clearTimeout(deactivatePopUp);
        if(root.querySelector(".tree-viewer__species-anchor--active") == speciesAnchor) return;
        deactivateCurSpeciesEntry();

        // Highlight anchor and open pop up if they both exists (some anchors have no pop up). 
        if(speciesAnchor && popUp) {
            speciesAnchor.classList.add("tree-viewer__species-anchor--active");
            positionPopUp(popUp, posX, posY);
            popUp.classList.remove("tree-viewer__pop-up--hidden");
        }
    };

    /**
     * Positions a species popup elem to a given x/y position.
     *
     * @param popUp species popup dom elem.
     * @param posX x position to open popup relative to viewport.
     * @param posY y position to open popup relative to viewport.
     */
    let positionPopUp = function(popUp, posX, posY) {
        let rootDimensions = root.getBoundingClientRect();

        // Get coordinates of root midpoint relative to viewport.
        let rootMidPoint = getMidpoint(root);
        // Translate menu so it is always oriented towards root center.
        let translateX = (posX > rootMidPoint.clientX) ? -100 : 0;
        let translateY = (posY > rootMidPoint.clientY) ? -100 : 0;
        // Modify max width/height so it is always within the window.
        // 16 is an arbitrary padding distance from viewport edge.
        let maxWidth = (posX > rootMidPoint.clientX) ? posX - 16 : window.innerWidth - posX - 16;
        let maxHeight = (posY > rootMidPoint.clientY) ? posY - 16 : window.innerHeight - posY - 16;

        // Popups are absolutely positioned, so account for that in top/left styling.
        popUp.style.left = `${posX - rootDimensions.left}px`;
        popUp.style.top = `${posY - rootDimensions.top}px`;
        popUp.style.maxWidth = `${maxWidth}px`;
        popUp.style.maxHeight = `${maxHeight}px`;
        popUp.style.transform = `translate(${translateX}%, ${translateY}%)`;
    };

    /**
     * Calculates and returns midpoint position of a dom element 
     * relative to the viewport.
     *
     * @param el dom element to find midpoint of.
     */
    let getMidpoint = function(el) {
        let dimensions = el.getBoundingClientRect();
        return {
            clientX: dimensions.left + (dimensions.width / 2), 
            clientY: dimensions.top + (dimensions.height / 2)
        };
    };

    /**
     * Called on popUp mouseenter. Clears timeout that deactivates
     * currently activated species entry.
     *
     * @param event mouseenter event that initiated this function.
     */
    let onPopUpFocus = function(event) {
        // Safe to clear timeout since we assume mouse over will only happen on pop up that is currently opened.
        // When a new species entry is activated, the old pop up is closed manually. See documentation on
        // deactivateCurSpeciesEntry method for more. 
        clearTimeout(deactivatePopUp);
    };

    /**
     * Called on speciesAnchor and popUp mouseleave. Starts timeout
     * to deactivtae species entry.
     */
    let initSpeciesEntryDeactivation = function() {
        // Timeout allows for 1 second of mousing out before closing.
        deactivatePopUp = setTimeout(deactivateCurSpeciesEntry, 1000);
    };

    /**
     * Deactivates the currently activated species entry.
     * 
     * This requires careful species activation management as
     * it assumes only 1 pop up will be opened. This is the 
     * only method where entries are deactivated, so tracing
     * calls to this method hopefully makes that management
     * easier. It would also be useful to track the 
     * deactivatePopUp timeout. This could probably be 
     * refacted in a much better system.
     */
    let deactivateCurSpeciesEntry = function() {
        let speciesAnchor = root.querySelector(".tree-viewer__species-anchor--active");
        let popUp = root.querySelector(".tree-viewer__pop-up:not(.tree-viewer__pop-up--hidden)");
        if(speciesAnchor) speciesAnchor.classList.remove("tree-viewer__species-anchor--active");
        if(popUp) popUp.classList.add("tree-viewer__pop-up--hidden");
    };

    /**
     * Called on window click. Deactivates currently activated 
     * species entry when click is made outside of viewer.
     *
     * @param event click event that initiated this function.
     */
    let onWindowClick = function(event) {
        // Do nothing if the root contains click event or if user is confirming fullscreen.
        // We don't want the menu to close when the user opens the viewer in fullscreen.
        if(root.contains(event.target) || event.target.classList.contains("tree-viewer-fs-confirm__btn-ok")) return;
        forceClosePopUp();
    };

    /**
     * Called on svgContainer wheel. Zooms tree based on wheel
     * direction.
     *
     * @param event wheel event that initiated this function.
     */
    let onWheel = function(event) {
        // Necessary to prevent default behavior to prevent page scrolling on zoom attempts.
        event.preventDefault();

        // Close any existing pop up as the anchor elements will be changing position during zoom.
        forceClosePopUp();

        // Zoom tree according to wheel direction (in/out) at mouse position.
        zoomTree(event.clientX, event.clientY, (event.deltaY <= 0) ? wheelZoomWeight : 1 / wheelZoomWeight);
    };

    /**
     * Called on svgContainer pointerdown. Adds pointer event 
     * to cache that is used for zomming/panning.
     * 
     * The method for touch zooming and panning is modeled after mdn's Pinch zoom gestures
     * article: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
     *
     * @param event pointerdown event that initiated this function.
     */
    let onPointerdown = function(event) {
        // Prevent default behavior just in case pointer dragging would interfere with viewer zooming/panning.
        event.preventDefault();

        eventCache.push(event);

        // Deactivate current species entry as the anchor elements will be changing position during zoom.
        forceClosePopUp();
    };

    /**
     * Called on svgContainer pointermove. Pans/zooms tree 
     * based on pointer event cache.
     * 
     * This handler is convoluted and could be be refactored.
     * 
     * The method for touch zooming and panning is modeled after mdn's Pinch zoom gestures
     * article: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
     *
     * @param event pointermove event that initiated this function.
     */
    let onPointermove = function(event) {
        // Create reference to prev pointer event associated with the id of pointer event that initiated this function.
        let prevPointerEvent;

        // Find this event in the cache and store reference to it and update its record with this event.
        for (let i = 0; i < eventCache.length; i++) {
            if (event.pointerId == eventCache[i].pointerId) {
                prevPointerEvent = eventCache[i];
                eventCache[i] = event;
                break;
            }
        }

        // If one event in cache, we are panning. If two events we are zooming.
        if(eventCache.length == 1) {
            // Pan tree based on change in pointer position of current and previous events.
            panTree(eventCache[0].clientX - prevPointerEvent.clientX, eventCache[0].clientY - prevPointerEvent.clientY);
        } else if(eventCache.length == 2) {
            // Calculate distance between the 2 pointers.
            let dist = Math.hypot(eventCache[1].clientX - eventCache[0].clientX, eventCache[1].clientY - eventCache[0].clientY);
            // Calculate the midpoint between the 2 pointers relative to the viewport.
            let midPoint = { 
                clientX: (eventCache[1].clientX + eventCache[0].clientX) / 2, 
                clientY: (eventCache[1].clientY + eventCache[0].clientY) / 2
            };

            // Only zoom tree if a prev midpoint/distance exists.
            if(prevMidPoint && prevDist) {
                // Pan tree based on change in midpoint position.
                panTree(midPoint.clientX - prevMidPoint.clientX, midPoint.clientY - prevMidPoint.clientY);
                // Zoom tree if arbitrary distance threshold is reached. Prevents unintentional zooming if using 2 fingers to pan.
                if(Math.abs(dist - prevDist) > 0.998) zoomTree(midPoint.clientX, midPoint.clientY, (dist >= prevDist) ? touchZoomWeight : 1 / touchZoomWeight);
            }

            // Update prev midpoint/distance for future zoom calculations.
            prevMidPoint = midPoint;
            prevDist = dist;
        }
    };

    /**
     * Pans tree a given offset x/y values.
     *
     * @param offsetX X distance to pan tree.
     * @param offsetY Y distance to pan tree.
     */
    let panTree = function(offsetX, offsetY) {
        // Update curr x/y translation vals based on desired offset.
        curTranslateX+= offsetX;
        curTranslateY+= offsetY;

        treeSvg.style.transform = `matrix(${curScale}, 0, 0, ${curScale}, ${curTranslateX}, ${curTranslateY})`;
    };

     /**
     * Zooms tree to a given x/y coordinate in the direction 
     * of a given zoom factor.
     *
     * @param pointX X coord to zoom tree relative to viewport.
     * @param pointY Y coord to zoom tree relative to viewport.
     * @param zoomFactor Degree to zoom tree in/out.
     */
    let zoomTree = function(pointX, pointY, zoomFactor) {
        // Get coordinates of root midpoint relative to viewport.
        let rootMidPoint = getMidpoint(root);
        
        /**
         * The following translation pans the image to maintain the same point underneath the cursor after zooming.
         * 
         * I wrote this long ago, but I believe this SO answer was the main source for this logic:
         * https://stackoverflow.com/a/30039971/9174232
         */
        curTranslateX+= (pointX - rootMidPoint.clientX - curTranslateX) * (1 - zoomFactor);
        curTranslateY+= (pointY - rootMidPoint.clientY - curTranslateY) * (1 - zoomFactor);

        // Update curr scale scale val based on desired zoomFactor.
        curScale*= zoomFactor;

        treeSvg.style.transform = `matrix(${curScale}, 0, 0, ${curScale}, ${curTranslateX}, ${curTranslateY})`;
    };

    /**
     * Called on svgContainer pointerup/cancel/leave. Removes 
     * pointer event from cache that is used for 
     * zomming/panning and resets zooming variables.
     * 
     * The method for touch zooming and panning is modeled after mdn's Pinch zoom gestures
     * article: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
     *
     * @param event pointerup event that initiated this function.
     */
    let onPointerup = function(event) {
        // Remove this event from the cache.
        for (let i = 0; i < eventCache.length; i++) {
            if (eventCache[i].pointerId == event.pointerId) {
                eventCache.splice(i, 1);
                break;
            }
        }

        // If the number of pointers down is less than two then reset zoom vars.
        if (eventCache.length < 2) {
            prevMidPoint = undefined;
            prevDist = undefined;
        }
        
    };

    /**
     * Deactivates the currently activated species entry.
     */
    let forceClosePopUp = function () {
        // Clear possible entry deactivation timeout.
        clearTimeout(deactivatePopUp);
        // Deactivate currently opened pop up.
        deactivateCurSpeciesEntry();
    };

    let onZoomInBtnClick = function(event) {
        let rootMidPoint = getMidpoint(root);
        zoomTree(rootMidPoint.clientX, rootMidPoint.clientY, btnZoomWeight);
    };

    let onZoomOutBtnClick = function(event) {
        let rootMidPoint = getMidpoint(root);
        zoomTree(rootMidPoint.clientX, rootMidPoint.clientY, 1 / btnZoomWeight);
    };

    let activateSpeciesEntryHash = function(id) {
        let speciesAnchor = root.querySelector(`.tree-viewer__species-anchor[data-species='${id}']`);
        let speciesAnchorDimensions = speciesAnchor.getBoundingClientRect();
        let pos;
        zoomTree(speciesAnchorDimensions.left, speciesAnchorDimensions.top, (window.innerWidth > 480) ? btnZoomWeight * 3 :  btnZoomWeight * 8);
        pos = calcSimulatedClick(speciesAnchor);
        activateSpeciesEntry(id, pos.x, pos.y);
    };

    let calcSimulatedClick = function(anchor) {
        let speciesAnchorDimensions = anchor.getBoundingClientRect();
        let rootDimensions = root.getBoundingClientRect();
        let x = (speciesAnchorDimensions.left + speciesAnchorDimensions.right) / 2;
        let y = (speciesAnchorDimensions.top + speciesAnchorDimensions.bottom) / 2;
        if(x > rootDimensions.right - 8) {
            x = rootDimensions.right - 8;
        } else if(x < rootDimensions.left + 8) {
            x = rootDimensions.left + 8;
        }

        if(y > rootDimensions.bottom - 8) {
            y = rootDimensions.bottom - 8;
        } else if(y < rootDimensions.top + 8) {
            y = rootDimensions.top + 8;
        }
        return { x, y };
    };

    svgContainer.addEventListener("focus", activateKeyboardPanning);
    svgContainer.addEventListener("blur", deactivateKeyboardPanning);
    for(let speciesAnchor of speciesAnchors) {
        speciesAnchor.addEventListener("mouseenter", onSpeciesAnchorFocus);
        speciesAnchor.addEventListener("click", onSpeciesAnchorFocus);
        speciesAnchor.addEventListener("mouseleave", initSpeciesEntryDeactivation);
    }
    for(let popUp of popUps) {
        popUp.addEventListener("mouseenter", onPopUpFocus);
        popUp.addEventListener("mouseleave", initSpeciesEntryDeactivation);
    }
    window.addEventListener("click", onWindowClick);
    svgContainer.addEventListener("wheel", onWheel);
    svgContainer.addEventListener("pointerdown", onPointerdown);
    svgContainer.addEventListener("pointermove", onPointermove);
    svgContainer.addEventListener("pointerup", onPointerup);
    svgContainer.addEventListener("pointercancel", onPointerup);
    svgContainer.addEventListener("pointerleave", onPointerup);
    zoomControlscontainer.addEventListener("click", forceClosePopUp);
    zoomInBtn.addEventListener("click", onZoomInBtnClick);
    zoomOutBtn.addEventListener("click", onZoomOutBtnClick);

    return {
        root,
        activateSpeciesEntryHash
    };

};