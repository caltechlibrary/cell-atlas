let MediaViewer = function(root, videoPlayer, compSlider, proteinViewer, summaryMenu, treeViewer, resizeCallbacks = []) {
    
    let tabContainer = root.querySelector(".media-viewer__tab-container");
    let mediaContainer = root.querySelector(".media-viewer__media-container");
    let mediaComponents = root.querySelectorAll(".media-viewer__media-component");
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
            for(let resizeCallback of resizeCallbacks) resizeCallback();
        }
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
    };

    let positionFixedEnlargedSlider = function() {
        // section content is in .page__content-container
        let contentContainer = document.querySelector(".page__content-container");
        let posTop = contentContainer.getBoundingClientRect().top + contentContainer.getBoundingClientRect().height / 2;
        let availHeight = contentContainer.getBoundingClientRect().height - 50;
        let availWidth = contentContainer.getBoundingClientRect().width - 100;
        let aspectRatio = 16 / 9;
        let width = Math.min(availWidth, availHeight * aspectRatio);
        let height = width / aspectRatio;
        mediaContainer.style.top = `${posTop}px`;
        mediaContainer.style.width = `${width + 14}px`;
        mediaContainer.style.height = `${height + 14}px`;
        for(let resizeCallback of resizeCallbacks) resizeCallback();
    };

    let minimizeFixedEnlarged = function() {
        mediaContainer.classList.remove("media-viewer__media-container--fixed-enlarged");
        mediaContainer.removeAttribute("style");
        window.removeEventListener("resize", positionFixedEnlargedSlider);
    };

    if(tabContainer) tabContainer.addEventListener("click", handleTabContainerClick);
    fullscreenBtn.addEventListener("click", handleFullscreenBtnClick);
    
    for(let resizeCallback of resizeCallbacks) root.addEventListener("fullscreenchange", resizeCallback);

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