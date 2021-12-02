let TreeViewer = function(root) {

    let speciesAnchors = root.querySelectorAll(".tree-viewer__species-anchor");
    let popUps = root.querySelectorAll(".tree-viewer__pop-up");
    let deactivatePopUp;

    let onSpeciesAnchorFocus = function(event) {
        let speciesAnchor = event.currentTarget;
        let popUp = root.querySelector(`#${speciesAnchor.getAttribute("data-species")}`);
        clearTimeout(deactivatePopUp);
        if(root.querySelector(".tree-viewer__species-anchor--active") == speciesAnchor) return;
        deactivateCurSpeciesEntry();
        speciesAnchor.classList.add("tree-viewer__species-anchor--active");
        if(popUp) {
            popUp.style.top = `${event.clientY}px`
            popUp.style.left = `${event.clientX}px`
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

    for(let speciesAnchor of speciesAnchors) {
        speciesAnchor.addEventListener("mouseenter", onSpeciesAnchorFocus);
        speciesAnchor.addEventListener("mouseleave", initSpeciesEntryDeactivation);
    }
    for(let popUp of popUps) {
        popUp.addEventListener("mouseenter", onPopUpFocus);
        popUp.addEventListener("mouseleave", initSpeciesEntryDeactivation);
    }

    return {
        root
    };

};