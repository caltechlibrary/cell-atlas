let MediaViewer = function(root, onRequestFullscreenChangeCallback = function(){}, resizeCallback = function(){}, mediaSwitchCallback = function(){}) {
    
    let tabContainer = root.querySelector(".media-viewer__tab-container");
    let tabBtns = root.querySelectorAll(".media-viewer__tab-btn");
    let mediaContainer = root.querySelector(".media-viewer__media-container");
    let mediaComponents = root.querySelectorAll(".media-viewer__media-component");
    let fullscreenBtn = root.querySelector(".media-viewer__fullscreen-btn");

    let handleRootFullscreenChange = function() {
        resizeCallback(root);
    };

    let handleTabBtnClick = function(event) {
        let tabBtn = event.currentTarget;
        let currSelectedBtn = tabContainer.querySelector(".media-viewer__tab-btn-vid--selected");
        let mediaType = tabBtn.getAttribute("value");

        if(tabBtn == currSelectedBtn) return;

        currSelectedBtn.classList.remove("media-viewer__tab-btn-vid--selected");
        tabBtn.classList.add("media-viewer__tab-btn-vid--selected");
        displayMediaType(mediaType);
    };

    let displayMediaType = function(mediaType) {
        let targetMediaComponent = root.querySelector(`.media-viewer__media-component[data-media-type='${mediaType}']`);
        for(let mediaComponent of mediaComponents) mediaComponent.classList.add("media-viewer__media-component--hidden");
        targetMediaComponent.classList.remove("media-viewer__media-component--hidden");
        if(mediaType == "vid") {
            fullscreenBtn.classList.add("media-viewer__fullscreen-btn--hidden");
        } else {
            fullscreenBtn.classList.remove("media-viewer__fullscreen-btn--hidden");
        }
        mediaSwitchCallback(root, mediaType);
    };

    let handleFullscreenBtnClick = function(event) {
        let ariaLabel = fullscreenBtn.getAttribute("aria-label");
        if(ariaLabel == "Enter full screen") {
            setFullscreenBtnState("expanded");
        } else {
            setFullscreenBtnState("minimized");
        }
        onRequestFullscreenChangeCallback(root.id);
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
        root.classList.add("media-viewer--fullscreen");
        if(root.requestFullscreen) {
            root.requestFullscreen();
        } else {
            root.classList.add("media-viewer--fullscreen-polyfill");
            makeRootModal();
            resizeCallback(root);
        }
    };

    let exitFullscreen = function() {
        root.classList.remove("media-viewer--fullscreen");
        if(root.requestFullscreen) {
            document.exitFullscreen();
        } else {
            root.classList.remove("media-viewer--fullscreen-polyfill");
            revertRootModal();
            resizeCallback(root);
        }
    };

    let toggleFixedEnlarged = function() {
        if(!root.classList.contains("media-viewer--fixed-enlarged")) {
            displayFixedEnlarged();
        } else {
            minimizeFixedEnlarged();
        }
    };

    let displayFixedEnlarged = function() {
        root.classList.add("media-viewer--fixed-enlarged");
        resizeCallback(root);
        makeRootModal();
    };

    let minimizeFixedEnlarged = function() {
        root.classList.remove("media-viewer--fixed-enlarged");
        resizeCallback(root);
        revertRootModal();
    };

    let makeRootModal = function() {
        root.setAttribute("role", "dialog");
        root.setAttribute("aria-label", "Media container");
        root.setAttribute("aria-modal", "true");
        window.addEventListener("keydown", onRootModalKeydown);
    };

    let onRootModalKeydown = function(event) {
        let visibleMediaComponent = mediaContainer.querySelector(".media-viewer__media-component:not(.media-viewer__media-component--hidden)");
        let focusableEls = visibleMediaComponent.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
        
        if(event.key == "Tab") {
            if(!mediaContainer.contains(event.target) || focusableEls.length == 0 || (event.target == focusableEls[0] && event.shiftKey)) {
                fullscreenBtn.focus();
                event.preventDefault();
            } else if(event.target == fullscreenBtn && !event.shiftKey) {
                focusableEls[0].focus();
                event.preventDefault();
            }
        }
    };

    let revertRootModal = function() {
        root.removeAttribute("role");
        root.removeAttribute("aria-label");
        root.removeAttribute("aria-modal");
        window.removeEventListener("keydown", onRootModalKeydown);
    };

    root.addEventListener("fullscreenchange", handleRootFullscreenChange);
    for(let tabBtn of tabBtns) tabBtn.addEventListener("click", handleTabBtnClick);
    fullscreenBtn.addEventListener("click", handleFullscreenBtnClick);

    return {
        root,
        displayMediaType,
        setFullscreenBtnState,
        toggleFullscreen,
        toggleFixedEnlarged
    }
};