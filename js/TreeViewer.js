let TreeViewer = function(root) {

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

    let onSpeciesAnchorFocus = function(event) {
        activateSpeciesEntry(event.currentTarget.getAttribute("data-species"), event.clientX, event.clientY);
    };

    let activateSpeciesEntry = function(id, posX, posY) {
        let speciesAnchor = root.querySelector(`.tree-viewer__species-anchor[data-species='${id}']`);
        let popUp = root.querySelector(`#${id}`);
        clearTimeout(deactivatePopUp);
        if(root.querySelector(".tree-viewer__species-anchor--active") == speciesAnchor) return;
        deactivateCurSpeciesEntry();
        if(speciesAnchor && popUp) {
            speciesAnchor.classList.add("tree-viewer__species-anchor--active");
            positionPopUp(popUp, posX, posY);
            popUp.classList.remove("tree-viewer__pop-up--hidden");
        }
    };

    let positionPopUp = function(popUp, posX, posY) {
        let rootDimensions = root.getBoundingClientRect();
        let rootMidPoint = getMidpoint(root);
        let translateX = (posX > rootMidPoint.clientX) ? -100 : 0;
        let translateY = (posY > rootMidPoint.clientY) ? -100 : 0;
        let maxWidth = (posX > rootMidPoint.clientX) ? posX - 16 : window.innerWidth - posX - 16;
        let maxHeight = (posY > rootMidPoint.clientY) ? posY - 16 : window.innerHeight - posY - 16;
        popUp.style.left = `${posX - rootDimensions.left}px`;
        popUp.style.top = `${posY - rootDimensions.top}px`;
        popUp.style.maxWidth = `${maxWidth}px`;
        popUp.style.maxHeight = `${maxHeight}px`;
        popUp.style.transform = `translate(${translateX}%, ${translateY}%)`;
    };

    let getMidpoint = function(el) {
        let dimensions = el.getBoundingClientRect();
        return {
            clientX: dimensions.left + (dimensions.width / 2), 
            clientY: dimensions.top + (dimensions.height / 2)
        };
    };

    let onPopUpFocus = function(event) {
        clearTimeout(deactivatePopUp);
    };

    let initSpeciesEntryDeactivation = function() {
        deactivatePopUp = setTimeout(deactivateCurSpeciesEntry, 1000);
    };

    let deactivateCurSpeciesEntry = function() {
        let speciesAnchor = root.querySelector(".tree-viewer__species-anchor--active");
        let popUp = root.querySelector(".tree-viewer__pop-up:not(.tree-viewer__pop-up--hidden)");
        if(speciesAnchor) speciesAnchor.classList.remove("tree-viewer__species-anchor--active");
        if(popUp) popUp.classList.add("tree-viewer__pop-up--hidden");
    };

    let onWindowClick = function(event) {
        if(root.contains(event.target) || event.target.classList.contains("tree-viewer-fs-confirm__btn-ok")) return;
        forceClosePopUp();
    };

    let onWheel = function(event) {
        event.preventDefault();
        forceClosePopUp();
        zoomTree(event.clientX, event.clientY, (event.deltaY <= 0) ? wheelZoomWeight : 1 / wheelZoomWeight);
    };

    let onPointerdown = function(event) {
        eventCache.push(event);
        forceClosePopUp();
    };

    let onPointermove = function(event) {
        let prevPointerEvent;

        for (let i = 0; i < eventCache.length; i++) {
            if (event.pointerId == eventCache[i].pointerId) {
                prevPointerEvent = eventCache[i];
                eventCache[i] = event;
                break;
            }
        }

        if(eventCache.length == 1) {
            panTree(eventCache[0].clientX - prevPointerEvent.clientX, eventCache[0].clientY - prevPointerEvent.clientY);
        } else if(eventCache.length == 2) {
            let dist = Math.hypot(eventCache[1].clientX - eventCache[0].clientX, eventCache[1].clientY - eventCache[0].clientY);
            let midPoint = { 
                clientX: (eventCache[1].clientX + eventCache[0].clientX) / 2, 
                clientY: (eventCache[1].clientY + eventCache[0].clientY) / 2
            };
            if(prevMidPoint && prevDist) {
                panTree(midPoint.clientX - prevMidPoint.clientX, midPoint.clientY - prevMidPoint.clientY);
                if(Math.abs(dist - prevDist) > 0.998) zoomTree(midPoint.clientX, midPoint.clientY, (dist >= prevDist) ? touchZoomWeight : 1 / touchZoomWeight);
            }
            prevMidPoint = midPoint;
            prevDist = dist;
        }
    };

    let panTree = function(offsetX, offsetY) {
        curTranslateX+= offsetX;
        curTranslateY+= offsetY;
        treeSvg.style.transform = `matrix(${curScale}, 0, 0, ${curScale}, ${curTranslateX}, ${curTranslateY})`;
    };

    let zoomTree = function(pointX, pointY, zoomFactor) {
        let rootMidPoint = getMidpoint(root);
        curTranslateX+= (pointX - rootMidPoint.clientX - curTranslateX) * (1 - zoomFactor);
        curTranslateY+= (pointY - rootMidPoint.clientY - curTranslateY) * (1 - zoomFactor);
        curScale*= zoomFactor;
        treeSvg.style.transform = `matrix(${curScale}, 0, 0, ${curScale}, ${curTranslateX}, ${curTranslateY})`;
    };

    let onPointerup = function(event) {
        for (let i = 0; i < eventCache.length; i++) {
            if (eventCache[i].pointerId == event.pointerId) {
                eventCache.splice(i, 1);
                break;
            }
        }

        if (eventCache.length < 2) {
            prevMidPoint = undefined;
            prevDist = undefined;
        }
        
    };

    let forceClosePopUp = function () {
        clearTimeout(deactivatePopUp);
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
        zoomTree(speciesAnchorDimensions.left, speciesAnchorDimensions.top, (window.innerWidth > 480) ? btnZoomWeight * 3 :  btnZoomWeight * 8);
        speciesAnchorDimensions = speciesAnchor.getBoundingClientRect();
        activateSpeciesEntry(id, speciesAnchorDimensions.left, speciesAnchorDimensions.top);
    };

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