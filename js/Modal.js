let Modal = function(root, mainMediaViewer, proteinMediaViewer, narrationPlayer) {

    let modalContainer = root.querySelector(".modal__modal-container");
    let exitBtn = root.querySelector(".modal__exit-btn");
    let contentContainer = root.querySelector(".modal__content-container");
    let openProteinViewerBtn = root.querySelector(".vid-metadata__viewer-btn");
    let narrationToggleBtn = root.querySelector(".modal__toggle-narration-btn");

    let show = function() {
        if(proteinMediaViewer && !proteinMediaViewer.proteinViewer.initialized) proteinMediaViewer.proteinViewer.init();
        if(contentContainer) contentContainer.setAttribute("tabindex", 0);
        root.classList.remove("modal--hidden");
        root.focus();
        if(mainMediaViewer && mainMediaViewer.videoPlayer && !mainMediaViewer.videoPlayer.root.classList.contains("video-player--hidden") && window.innerWidth > 900 && window.createImageBitmap) {
            setTimeout(mainMediaViewer.videoPlayer.resizeScrubCanvas, 200);
        }
        document.addEventListener("keydown", onOpenModalKeyDown);
    };

    let onOpenModalKeyDown = function(event) {
        if(event.key == "Escape") hide();
    };

    let hide = function() {
        let openViewerMediaContainerEl = root.querySelector(".media-viewer__media-container--fixed-enlarged");
        if(openViewerMediaContainerEl) {
            if(openViewerMediaContainerEl.parentElement.classList.contains("media-viewer--protein-viewer")) {
                closeProteinViewer();
                proteinMediaViewer.setFullscreenBtnState("minimized");
            } else {
                toggleMainMediaViewerFs();
                mainMediaViewer.setFullscreenBtnState("minimized");
            }
        }
        if(mainMediaViewer && mainMediaViewer.videoPlayer && !mainMediaViewer.videoPlayer.video.paused) mainMediaViewer.videoPlayer.togglePlayBack();
        if(narrationPlayer && !narrationPlayer.audio.paused) narrationPlayer.togglePlayback();
        root.classList.add("modal--hidden");
        if(contentContainer) contentContainer.setAttribute("tabindex", -1);
        document.removeEventListener("keydown", onOpenModalKeyDown);
    };

    let onRootClick = function(event) {
        if(!modalContainer.contains(event.target)) hide();
    };

    let toggleMainMediaViewerFs = function() {
        toggleMediaViewerFs(mainMediaViewer);
    };

    let openProteinViewer = function(event) {
        proteinMediaViewer.root.classList.remove("media-viewer--hidden");
        proteinMediaViewer.setFullscreenBtnState("expanded");
        toggleMediaViewerFs(proteinMediaViewer);
    };

    let closeProteinViewer = function(event) {
        proteinMediaViewer.root.classList.add("media-viewer--hidden");
        toggleMediaViewerFs(proteinMediaViewer);
    };

    let toggleMediaViewerFs = function(mediaViewer) {
        if(window.innerWidth < 900) {
            mediaViewer.toggleFullscreen();
        } else {
            mediaViewer.toggleFixedEnlarged();
        }
    };

    let toggleNarrationPlayer = function() {
        let showIcon = root.querySelector(".modal__toggle-narration-btn-show-icon");
        let hideIcon = root.querySelector(".modal__toggle-narration-btn-hide-icon");
        if(narrationPlayer.root.classList.contains("narration-player--hidden")) {
            if(!narrationPlayer.initialized) narrationPlayer.init();
            narrationPlayer.root.classList.remove("narration-player--hidden");
            showIcon.classList.add("modal__toggle-narration-btn-icon--hidden");
            hideIcon.classList.remove("modal__toggle-narration-btn-icon--hidden");
            narrationToggleBtn.classList.add("modal__toggle-narration-btn--activated");
        } else {
            narrationPlayer.root.classList.add("narration-player--hidden");
            showIcon.classList.remove("modal__toggle-narration-btn-icon--hidden");
            hideIcon.classList.add("modal__toggle-narration-btn-icon--hidden");
            narrationToggleBtn.classList.remove("modal__toggle-narration-btn--activated");
            if(!narrationPlayer.audio.paused) narrationPlayer.togglePlayback();
        }
    };

    root.addEventListener("click", onRootClick);
    if(exitBtn) exitBtn.addEventListener("click", hide);
    if (mainMediaViewer) mainMediaViewer.fullscreenBtn.addEventListener("click", toggleMainMediaViewerFs);
    if(openProteinViewerBtn) openProteinViewerBtn.addEventListener("click", openProteinViewer);
    if(proteinMediaViewer) proteinMediaViewer.fullscreenBtn.addEventListener("click", closeProteinViewer);
    if (narrationToggleBtn) narrationToggleBtn.addEventListener("click", toggleNarrationPlayer);

    return {
        root,
        show,
        hide
    }

};