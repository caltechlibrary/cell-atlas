let TreeViewer = function(root) {

    let svgContainer = root.querySelector(".tree-viewer__svg-container");
    let treeSvg = root.querySelector(".tree-viewer__tree-svg");
    let speciesAnchors = root.querySelectorAll(".tree-viewer__species-anchor");
    let popUps = root.querySelectorAll(".tree-viewer__pop-up");
    let zoomInBtn = root.querySelector(".tree-viewer__zoom-btn-in");
    let zoomOutBtn = root.querySelector(".tree-viewer__zoom-btn-out");
    let deactivatePopUp;
    svgContainer.treeSvg = treeSvg;
    svgContainer.eventCache = [];
    svgContainer.prevMidPoint;
    svgContainer.prevDist;
    svgContainer.zoomWeight = 1.025;
    svgContainer.curScale = 1;
    svgContainer.curTranslateX = 0;
    svgContainer.curTranslateY = 0;

    let onSpeciesAnchorFocus = function(event) {
        let speciesAnchor = event.currentTarget;
        let rootDimensions = root.getBoundingClientRect();
        activateSpeciesEntry(speciesAnchor.getAttribute("data-species"), event.clientX - rootDimensions.left, event.clientY - rootDimensions.top);
    };

    let activateSpeciesEntry = function(id, posX, posY) {
        let speciesAnchor = root.querySelector(`.tree-viewer__species-anchor[data-species='${id}']`);
        let popUp = root.querySelector(`#${id}`);
        clearTimeout(deactivatePopUp);
        if(root.querySelector(".tree-viewer__species-anchor--active") == speciesAnchor) return;
        deactivateCurSpeciesEntry();
        if(speciesAnchor && popUp) {
            speciesAnchor.classList.add("tree-viewer__species-anchor--active");
            popUp.style.left = `${posX}px`;
            popUp.style.top = `${posY}px`;
            popUp.classList.remove("tree-viewer__pop-up--hidden");
        }
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

    let onWheel = function(event) {
        event.preventDefault();
        zoomTree(event.clientX, event.clientY, (event.deltaY <= 0) ? svgContainer.zoomWeight : 1 / svgContainer.zoomWeight);
    };

    let onPointerdown = function(event) {
        this.eventCache.push(event);
    };

    let onPointermove = function(event) {
        let prevPointerEvent;

        for (let i = 0; i < this.eventCache.length; i++) {
            if (event.pointerId == this.eventCache[i].pointerId) {
                prevPointerEvent = this.eventCache[i];
                this.eventCache[i] = event;
                break;
            }
        }

        if(this.eventCache.length == 1) {
            panTree(this.eventCache[0].clientX - prevPointerEvent.clientX, this.eventCache[0].clientY - prevPointerEvent.clientY);
        } else if(this.eventCache.length == 2) {
            let dist = Math.hypot(this.eventCache[1].clientX - this.eventCache[0].clientX, this.eventCache[1].clientY - this.eventCache[0].clientY);
            let midPoint = { 
                clientX: (this.eventCache[1].clientX + this.eventCache[0].clientX) / 2, 
                clientY: (this.eventCache[1].clientY + this.eventCache[0].clientY) / 2
            };
            if(this.prevMidPoint && this.prevDist) {
                panTree(midPoint.clientX - this.prevMidPoint.clientX, midPoint.clientY - this.prevMidPoint.clientY);
                if(Math.abs(dist - this.prevDist) > 0.998) zoomTree(midPoint.clientX, midPoint.clientY, (dist >= this.prevDist) ? this.zoomWeight : 1 / this.zoomWeight);
            }
            this.prevMidPoint = midPoint;
            this.prevDist = dist;
        }
    };

    let panTree = function(offsetX, offsetY) {
        svgContainer.curTranslateX+= offsetX;
        svgContainer.curTranslateY+= offsetY;
        svgContainer.treeSvg.style.transform = `matrix(${svgContainer.curScale}, 0, 0, ${svgContainer.curScale}, ${svgContainer.curTranslateX}, ${svgContainer.curTranslateY})`;
    };

    let zoomTree = function(pointX, pointY, zoomFactor) {
        let rootDimensions = root.getBoundingClientRect();
        let rootMidPoint = {
            clientX: rootDimensions.left + (rootDimensions.width / 2), 
            clientY: rootDimensions.top + (rootDimensions.height / 2)
        };
        svgContainer.curTranslateX+= (pointX - rootMidPoint.clientX) * (1 - zoomFactor);
        svgContainer.curTranslateY+= (pointY - rootMidPoint.clientY) * (1 - zoomFactor);
        svgContainer.curScale*= zoomFactor;
        svgContainer.treeSvg.style.transform = `matrix(${svgContainer.curScale}, 0, 0, ${svgContainer.curScale}, ${svgContainer.curTranslateX}, ${svgContainer.curTranslateY})`;
    };

    let onPointerup = function(event) {
        for (let i = 0; i < this.eventCache.length; i++) {
            if (this.eventCache[i].pointerId == event.pointerId) {
                this.eventCache.splice(i, 1);
                break;
            }
        }

        if (this.eventCache.length < 2) {
            this.prevMidPoint = undefined;
            this.prevDist = undefined;
        }
        
    };

    let onZoomInBtnClick = function(event) {
        let rootDimensions = root.getBoundingClientRect();
        let rootMidPoint = {
            clientX: rootDimensions.left + (rootDimensions.width / 2), 
            clientY: rootDimensions.top + (rootDimensions.height / 2)
        };
        zoomTree(rootMidPoint.clientX, rootMidPoint.clientY, svgContainer.zoomWeight);
    };

    let onZoomOutBtnClick = function(event) {
        let rootDimensions = root.getBoundingClientRect();
        let rootMidPoint = {
            clientX: rootDimensions.left + (rootDimensions.width / 2), 
            clientY: rootDimensions.top + (rootDimensions.height / 2)
        };
        zoomTree(rootMidPoint.clientX, rootMidPoint.clientY, 1/ svgContainer.zoomWeight);
    };

    let activateSpeciesEntryHash = function(id) {
        let speciesAnchor = root.querySelector(`.tree-viewer__species-anchor[data-species='${id}']`);
        let speciesAnchorDimensions = speciesAnchor.getBoundingClientRect();
        zoomTree(speciesAnchorDimensions.left, speciesAnchorDimensions.top, svgContainer.zoomWeight * 2.5);
        speciesAnchorDimensions = speciesAnchor.getBoundingClientRect();
        activateSpeciesEntry(id, speciesAnchorDimensions.left, speciesAnchorDimensions.top);
    };

    for(let speciesAnchor of speciesAnchors) {
        speciesAnchor.addEventListener("mouseenter", onSpeciesAnchorFocus);
        speciesAnchor.addEventListener("mouseleave", initSpeciesEntryDeactivation);
    }
    for(let popUp of popUps) {
        popUp.addEventListener("mouseenter", onPopUpFocus);
        popUp.addEventListener("mouseleave", initSpeciesEntryDeactivation);
    }
    svgContainer.addEventListener("wheel", onWheel);
    svgContainer.addEventListener("pointerdown", onPointerdown);
    svgContainer.addEventListener("pointermove", onPointermove);
    svgContainer.addEventListener("pointerup", onPointerup);
    svgContainer.addEventListener("pointercancel", onPointerup);
    svgContainer.addEventListener("pointerleave", onPointerup);
    zoomInBtn.addEventListener("click", onZoomInBtnClick);
    zoomOutBtn.addEventListener("click", onZoomOutBtnClick);


    return {
        root,
        activateSpeciesEntryHash
    };

};