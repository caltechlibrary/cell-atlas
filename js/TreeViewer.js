/**
 * Truns a dom element into a tree viewer widget 
 * and returns tree viewer object.
 *
 * @param root The dom element being registered as a tree viewer.
 */
let TreeViewer = function(root) {

    // Create frequently used variables and references to frequently used dom elements.
    let svgContainer = root.querySelector(".tree-viewer__svg-container");
    let treeSvg = root.querySelector(".tree-viewer__tree-svg");
    let speciesAnchors = root.querySelectorAll(".tree-viewer__species-anchor");
    let popUps = root.querySelectorAll(".tree-viewer__pop-up");
    let zoomControlscontainer = root.querySelector(".tree-viewer__zoom-controls");
    let zoomInBtn = root.querySelector(".tree-viewer__zoom-btn-in");
    let zoomOutBtn = root.querySelector(".tree-viewer__zoom-btn-out");
    let deactivatePopUp;
    let eventCache = [];
    let btnZoomWeight = 1.3;
    let wheelZoomWeight = 1.05;
    let touchZoomWeight = 1.025;
    let curScale = 1;
    let curTranslateX = 0;
    let curTranslateY = 0;
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
     * species entry pop up.
     *
     * @param event mouseenter/click event that initiated this function.
     */
    let onSpeciesAnchorFocus = function(event) {
        // Activate pop up at position of mouse at event time.
        activateSpeciesEntry(event.currentTarget.getAttribute("data-species"), event.clientX, event.clientY);
    };

    /**
     * Activates a species entry pop up.
     *
     * @param id id of popup elem.
     * @param posX x position to open popup relative to viewport.
     * @param posY y position to open popup relative to viewport.
     */
    let activateSpeciesEntry = function(id, posX, posY) {
        let speciesAnchor = root.querySelector(`.tree-viewer__species-anchor[data-species='${id}']`);
        let popUp = root.querySelector(`#${id}`);

        /**
         * Clear possible entry deactivation timeout. We either want to deactivate entry now or keep it open 
         * based on the currently activated species entry. 
         */
        clearTimeout(deactivatePopUp);
        // If current entry is already activated, return as it is already opened.
        if(root.querySelector(".tree-viewer__species-anchor--active") == speciesAnchor) return;
        
        deactivateCurSpeciesEntry();

        // Some species entry ids have anchors with no associated pop up. Activate only when we have both. 
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

        // Get coordinates of tree viewer midpoint relative to viewport.
        let rootMidPoint = getMidpoint(root);
        // Translate menu so it is always oriented towards root center.
        let translateX = (posX > rootMidPoint.clientX) ? -100 : 0;
        let translateY = (posY > rootMidPoint.clientY) ? -100 : 0;
        // Modify max width/height so pop up is always within the window. 16px is an arbitrary window padding distance.
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
     * Returns midpoint position of a dom element relative to 
     * the viewport.
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
     * Called on popUp mouseenter. Cancels species entry 
     * deactivation timeout.
     *
     * @param event mouseenter event that initiated this function.
     */
    let onPopUpFocus = function(event) {
        clearTimeout(deactivatePopUp);
    };

    /**
     * Called on speciesAnchor and popUp mouseleave. Initializes 
     * species entry deactivation timeout.
     */
    let initSpeciesEntryDeactivation = function() {
        // Timeout allows for 1 second of mousing out before closing.
        deactivatePopUp = setTimeout(deactivateCurSpeciesEntry, 1000);
    };

    /**
     * Deactivates the currently activated species entry.
     */
    let deactivateCurSpeciesEntry = function() {
        // Assumes that there will be only be one species entry activated at a time.
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
        /**
         * Only close pop up if click is outside tree viewer and click is not from confirming tree viewer to go 
         * fullscreen (otherwise pop ups would close on mobile when users visited them through links).
         */
        if(root.contains(event.target) || event.target.classList.contains("tree-viewer-fs-confirm__btn-ok")) return;
        forceClosePopUp();
    };

    /**
     * Called on svgContainer wheel. Modifies zoom of level 
     * of tree viewer.
     *
     * @param event wheel event that initiated this function.
     */
    let onWheel = function(event) {
        // Necessary to prevent default behavior to prevent page scrolling.
        event.preventDefault();

        // Close any existing pop up as their fixed position will look strange during zoom.
        forceClosePopUp();

        // Zoom tree according to wheel direction at mouse position.
        zoomTree(event.clientX, event.clientY, (event.deltaY <= 0) ? wheelZoomWeight : 1 / wheelZoomWeight);
    };

    /**
     * Called on svgContainer pointerdown. Adds pointer event 
     * to cache.
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

        // Deactivate current species entry as tree viewer will be either zooming or panning.
        forceClosePopUp();
    };

    /**
     * Called on svgContainer pointermove. Pans/zooms tree 
     * based on event cache.
     * 
     * The method for touch zooming and panning is modeled after mdn's Pinch zoom gestures
     * article: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
     *
     * @param event pointermove event that initiated this function.
     */
    let onPointermove = function(event) {
        // Find/update this event in the event cache and obtain reference to its previous value.
        let prevPointerEvent;
        for (let i = 0; i < eventCache.length; i++) {
            if (event.pointerId == eventCache[i].pointerId) {
                prevPointerEvent = eventCache[i];
                eventCache[i] = event;
                break;
            }
        }

        if(eventCache.length == 1) {
            // If 1 event in cache, pan tree based on change in pointer position.
            panTree(eventCache[0].clientX - prevPointerEvent.clientX, eventCache[0].clientY - prevPointerEvent.clientY);
        } else if(eventCache.length == 2) {
            // If 2 events in chache, zoom tree based on change in midpoint and distance of the 2 pointers.
            let dist = Math.hypot(eventCache[1].clientX - eventCache[0].clientX, eventCache[1].clientY - eventCache[0].clientY);
            let midPoint = { 
                clientX: (eventCache[1].clientX + eventCache[0].clientX) / 2, 
                clientY: (eventCache[1].clientY + eventCache[0].clientY) / 2
            };

            // Only zoom tree if a prev global midpoint/distance values exists.
            if(prevMidPoint && prevDist) {
                // Pan tree based on change in midpoint position.
                panTree(midPoint.clientX - prevMidPoint.clientX, midPoint.clientY - prevMidPoint.clientY);
                /**
                 * Use arbitrary distance threshold to determine when to zoom tree. This prevents unwanted behavior where zooming would 
                 * be triggered too much at the slightest movement of pointers.
                 * 
                 * When threshold is reached, zoom in/out tree towards midpoint of pointers.
                 */
                if(Math.abs(dist - prevDist) > 0.998) zoomTree(midPoint.clientX, midPoint.clientY, (dist >= prevDist) ? touchZoomWeight : 1 / touchZoomWeight);
            }

            // Update global prev midpoint/distance for future zoom calculations.
            prevMidPoint = midPoint;
            prevDist = dist;
        }
    };

    /**
     * Pans tree a given offset
     *
     * @param offsetX X distance to pan tree.
     * @param offsetY Y distance to pan tree.
     */
    let panTree = function(offsetX, offsetY) {
        // Update global x/y translation vals based on desired offset.
        curTranslateX+= offsetX;
        curTranslateY+= offsetY;

        // Reflect updated values on tree.
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
         * The following translation pans the tree to try maintain the zoom point in the same spot after zooming.
         * 
         * I wrote this long ago, but I believe this SO answer was the main source for this logic:
         * https://stackoverflow.com/a/30039971/9174232
         */
        curTranslateX+= (pointX - rootMidPoint.clientX - curTranslateX) * (1 - zoomFactor);
        curTranslateY+= (pointY - rootMidPoint.clientY - curTranslateY) * (1 - zoomFactor);

        // Update curr scale scale val based on desired zoomFactor.
        curScale*= zoomFactor;

        // Reflect updated values on tree.
        treeSvg.style.transform = `matrix(${curScale}, 0, 0, ${curScale}, ${curTranslateX}, ${curTranslateY})`;
    };

    /**
     * Called on svgContainer pointerup/cancel/leave. Removes 
     * pointer event from cache and performs cleanup.
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

        // If the number of pointers down is less than two then reset global zoom vars.
        if (eventCache.length < 2) {
            prevMidPoint = undefined;
            prevDist = undefined;
        }
        
    };

    /**
     * Called on zoomControlscontainer click. Closes currently 
     * activated species pop up.
     */
    let forceClosePopUp = function () {
        // Clear possible timeout that will close currently opened pop up.
        clearTimeout(deactivatePopUp);
        // Manually deactivate currently opened pop up.
        deactivateCurSpeciesEntry();
    };

    /**
     * Called on zoomInBtn click. Zooms tree in towards 
     * the center of the tree viewer.
     * 
     * @param event click event that initiated this function. 
     */
    let onZoomInBtnClick = function(event) {
        // Use tree viewer viewport relative midpoint as zoom point.
        let rootMidPoint = getMidpoint(root);
        zoomTree(rootMidPoint.clientX, rootMidPoint.clientY, btnZoomWeight);
    };

    /**
     * Called on zoomOutBtn click. Zooms tree out away 
     * from the center of the tree viewer.
     * 
     * @param event click event that initiated this function. 
     */
    let onZoomOutBtnClick = function(event) {
        // Use tree viewer viewport relative midpoint as zoom point.
        let rootMidPoint = getMidpoint(root);
        zoomTree(rootMidPoint.clientX, rootMidPoint.clientY, 1 / btnZoomWeight);
    };

    /**
     * Returned as method of tree viewer object. Zooms tree towrads 
     * species anchor and opens species pop up associated with a 
     * given id.
     * 
     * @param id The id of the species anchor/pop up.
     */
    let activateSpeciesEntryHash = function(id) {
        let speciesAnchor = root.querySelector(`.tree-viewer__species-anchor[data-species='${id}']`);
        let speciesAnchorDimensions = speciesAnchor.getBoundingClientRect();
        let pos;

        // Zoom tree in towards top left of species anchor.
        zoomTree(speciesAnchorDimensions.left, speciesAnchorDimensions.top, (window.innerWidth > 480) ? btnZoomWeight * 3 :  btnZoomWeight * 8);
        // Obtain midpoint of spencies anchor after zooming.
        pos = calcSimulatedClick(speciesAnchor);
        
        activateSpeciesEntry(id, pos.x, pos.y);
    };

    /**
     * Returns midpoint of species anchor relative to viewport.
     * 
     * 
     * @param anchor dom element species anchor.
     */
    let calcSimulatedClick = function(anchor) {
        let speciesAnchorDimensions = anchor.getBoundingClientRect();
        let rootDimensions = root.getBoundingClientRect();

        // Get midpoint of species anchor relative to viewport.
        let x = (speciesAnchorDimensions.left + speciesAnchorDimensions.right) / 2;
        let y = (speciesAnchorDimensions.top + speciesAnchorDimensions.bottom) / 2;
        // Midpoint of anchor might be beyond bounds of tree viewer. Clamp x and y values if so.
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

    // Add neccessary event listeners to dom elements.
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

    // Return public properties/methods.
    return {
        root,
        activateSpeciesEntryHash
    };

};