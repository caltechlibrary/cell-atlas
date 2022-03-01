let MediaViewer = function(root, videoPlayer, compSlider, proteinViewer, summaryMenu, treeViewer) {
    
    let tabContainer = root.querySelector(".media-viewer__tab-container");
    let mediaContainer = root.querySelector(".media-viewer__media-container");
    let mediaComponents = root.querySelectorAll(".media-viewer__media-component")
    let graphic = root.querySelector(".media-viewer__graphic");
    let fullscreenBtn = root.querySelector(".media-viewer__fullscreen-btn");

    let handleTabContainerClick = function(event) {
        let tabBtn = event.target.closest(".media-viewer__tab-btn");
        if(!tabBtn || !tabContainer.contains(tabBtn) || tabBtn.classList.contains("media-viewer__tab-btn-vid--selected")) return;
        let currSelectedBtn = tabContainer.querySelector(".media-viewer__tab-btn-vid--selected");
        let mediaType = tabBtn.getAttribute("value");

        currSelectedBtn.classList.remove("media-viewer__tab-btn-vid--selected");
        tabBtn.classList.add("media-viewer__tab-btn-vid--selected");
        displayMediaType(mediaType);
    };

    let displayMediaType = function(mediaType) {
        let mediaComponent = root.querySelector(`.media-viewer__media-component[data-media-type='${mediaType}']`);
        for(let mediaComponent of mediaComponents) mediaComponent.classList.add("media-viewer__media-component--hidden");
        mediaComponent.classList.remove("media-viewer__media-component--hidden");
        if(mediaType == "vid") {
            fullscreenBtn.classList.add("media-viewer__fullscreen-btn--hidden");
        } else {
            fullscreenBtn.classList.remove("media-viewer__fullscreen-btn--hidden");
        }
    };

    let handleFullscreenBtnClick = function(event) {
        let ariaLabel = fullscreenBtn.getAttribute("aria-label");
        if(ariaLabel == "Enter full screen") {
            setFullscreenBtnState("expanded");
        } else {
            setFullscreenBtnState("minimized");
        }
    };

    let setFullscreenBtnState = function(state) {
        let enterFsIcon = fullscreenBtn.querySelector(".media-viewer__enter-fs-icon");
        let exitFsIcon = fullscreenBtn.querySelector(".media-viewer__exit-fs-icon");
        let labelString;
        if(state == "expanded") {
            labelString = "Exit full screen";
            enterFsIcon.classList.add("media-viewer__fullscreen-btn-icon--hidden");
            exitFsIcon.classList.remove("media-viewer__fullscreen-btn-icon--hidden");
        } else if(state == "minimized") {
            exitFsIcon.classList.add("media-viewer__fullscreen-btn-icon--hidden");
            enterFsIcon.classList.remove("media-viewer__fullscreen-btn-icon--hidden");
            labelString = "Enter full screen";
        }
        fullscreenBtn.setAttribute("aria-label", labelString);
        fullscreenBtn.setAttribute("title", labelString);
    };

    let toggleFullscreen = function() {
        if(!root.classList.contains("media-viewer--fullscreen")) {
            displayFullscreen();
        } else {
            exitFullscreen();
        }
    };

    let displayFullscreen = function() {
        let mediaComponent = root.querySelector(`.media-viewer__media-component:not(.media-viewer__media-component--hidden)`);
        root.classList.add("media-viewer--fullscreen");
        if(tabContainer) tabContainer.classList.add("media-viewer__tab-container--fullscreen");
        mediaContainer.classList.add("media-viewer__media-container--fullscreen");
        mediaComponent.classList.add("media-viewer__media-component--fullscreen");
        if(root.requestFullscreen) {
            root.requestFullscreen();
        } else {
            root.classList.add("media-viewer--fullscreen-polyfill");
            if(proteinViewer) proteinViewer.resizeViewer();
        }
        if(proteinViewer) window.addEventListener("resize", proteinViewer.resizeViewer);
    };

    let exitFullscreen = function() {
        let mediaComponent = root.querySelector(`.media-viewer__media-component:not(.media-viewer__media-component--hidden)`);
        root.classList.remove("media-viewer--fullscreen");
        if(tabContainer) tabContainer.classList.remove("media-viewer__tab-container--fullscreen");
        mediaContainer.classList.remove("media-viewer__media-container--fullscreen");
        mediaComponent.classList.remove("media-viewer__media-component--fullscreen");
        if(root.requestFullscreen) {
            document.exitFullscreen();
        } else {
            root.classList.remove("media-viewer--fullscreen-polyfill");
        }
        if(proteinViewer) window.removeEventListener("resize", proteinViewer.resizeViewer);
    };

    let onProteinMediaViewerFullscreenChange = function() {
        if(document.fullscreenElement || document.fullscreenElement == root) proteinViewer.resizeViewer();
    };

    let toggleFixedEnlarged = function() {
        if(!mediaContainer.classList.contains("media-viewer__media-container--fixed-enlarged")) {
            displayFixedEnlarged();
        } else {
            minimizeFixedEnlarged();
        }
    };

    let displayFixedEnlarged = function() {
        mediaContainer.classList.add("media-viewer__media-container--fixed-enlarged");
        positionFixedEnlargedSlider();
        window.addEventListener("resize", positionFixedEnlargedSlider);
        if(proteinViewer) proteinViewer.requestRedraw();
    };

    let positionFixedEnlargedSlider = function() {
        let headerEl = document.querySelector("header");
        let footerEl = document.querySelector("footer");
        let headerFooterDistance = footerEl.getBoundingClientRect().top - headerEl.getBoundingClientRect().bottom;
        let posTop = headerEl.offsetHeight + (headerFooterDistance / 2);
        let availHeight = headerFooterDistance - 50;
        let availWidth = window.innerWidth - 100;
        let aspectRatio = 16 / 9;
        let desiredWidth = availHeight * aspectRatio;
        let correctWidth = (desiredWidth < availWidth) ? desiredWidth : availWidth;
        mediaContainer.style.width = `${correctWidth}px`;
        if(proteinViewer) {
            mediaContainer.style.height = `${correctWidth / aspectRatio}px`;
            proteinViewer.resizeViewer();
        }
        mediaContainer.style.top = `${posTop}px`;
    };

    let minimizeFixedEnlarged = function() {
        mediaContainer.classList.remove("media-viewer__media-container--fixed-enlarged");
        mediaContainer.removeAttribute("style");
        window.removeEventListener("resize", positionFixedEnlargedSlider);
    };

    if(proteinViewer) root.addEventListener("fullscreenchange", onProteinMediaViewerFullscreenChange);
    if(tabContainer) tabContainer.addEventListener("click", handleTabContainerClick);
    fullscreenBtn.addEventListener("click", handleFullscreenBtnClick);

    return {
        root,
        mediaContainer,
        videoPlayer,
        compSlider,
        proteinViewer,
        summaryMenu,
        treeViewer,
        fullscreenBtn,
        displayMediaType,
        setFullscreenBtnState,
        toggleFullscreen,
        toggleFixedEnlarged
    }
};