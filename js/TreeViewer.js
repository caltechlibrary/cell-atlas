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
    svgContainer.prevDiff = -1;
    svgContainer.curScale = 1;
    svgContainer.curTranslateX = 0;
    svgContainer.curTranslateY = 0;
    svgContainer.zoomWeight = 1.025;
    svgContainer.wheelZoomWeight = 1.05;

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
        let gridPos = calcGridPos(event.pageX, event.pageY);
        let zoomFactor;
        if(event.deltaY >= 0) {
            zoomFactor = (1 / this.wheelZoomWeight);
        } else {
            zoomFactor = this.wheelZoomWeight;
        }

        this.curTranslateX = this.curTranslateX - ( (gridPos.posX - this.curTranslateX) * (zoomFactor - 1) );
        this.curTranslateY = this.curTranslateY - ( (this.curTranslateY - gridPos.posY) * (zoomFactor - 1) );
        this.curScale = this.curScale * zoomFactor;

        this.treeSvg.style.transform = `matrix(${this.curScale}, 0, 0, ${this.curScale}, ${this.curTranslateX}, ${this.curTranslateY})`;
    };

    let onPointerdown = function(event) {
        this.eventCache.push(event);
    };

    let onPointermove = function(event) {
        if(this.eventCache.length == 0) return;
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

        this.treeSvg.style.transform = `matrix(${this.curScale}, 0, 0, ${this.curScale}, ${this.curTranslateX}, ${this.curTranslateY})`;
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

    let onZoomInBtnClick = function(event) {
        let rootDimensions = root.getBoundingClientRect();
        let gridPos = calcGridPos(rootDimensions.left + (root.offsetWidth / 2), rootDimensions.top + (root.offsetHeight / 2));
        manualZoomTree(gridPos, svgContainer.wheelZoomWeight);
    };

    let onZoomOutBtnClick = function() {
        let rootDimensions = root.getBoundingClientRect();
        let gridPos = calcGridPos(rootDimensions.left + (root.offsetWidth / 2), rootDimensions.top + (root.offsetHeight / 2));
        manualZoomTree(gridPos, 1/svgContainer.wheelZoomWeight);
    };

    let manualZoomTree = function(gridPos, zoomFactor) {
        svgContainer.curTranslateX = svgContainer.curTranslateX - ( (gridPos.posX - svgContainer.curTranslateX) * (zoomFactor - 1) );
        svgContainer.curTranslateY = svgContainer.curTranslateY - ( (svgContainer.curTranslateY - gridPos.posY) * (zoomFactor - 1) );
        svgContainer.curScale = svgContainer.curScale * zoomFactor;

        svgContainer.treeSvg.style.transform = `matrix(${svgContainer.curScale}, 0, 0, ${svgContainer.curScale}, ${svgContainer.curTranslateX}, ${svgContainer.curTranslateY})`;
    };

    let manuallyOpenPopUp = function(id) {
        let speciesAnchor = root.querySelector(`.tree-viewer__species-anchor[data-species='${id}']`);
        let speciesAnchorDimensions = speciesAnchor.getBoundingClientRect();
        let rootDimensions = root.getBoundingClientRect();
        let gridPos = calcGridPos(speciesAnchorDimensions.left, speciesAnchorDimensions.top);
        manualZoomTree(gridPos, svgContainer.wheelZoomWeight * 2.5);

        speciesAnchorDimensions = speciesAnchor.getBoundingClientRect();
        activateSpeciesEntry(id, (speciesAnchorDimensions.left + (speciesAnchorDimensions.width/2)) - rootDimensions.left, (speciesAnchorDimensions.top + (speciesAnchorDimensions.height/2)) - rootDimensions.top);

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
        manuallyOpenPopUp
    };

};