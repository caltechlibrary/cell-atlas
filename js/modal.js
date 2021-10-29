let Modal = function(root, mainMediaViewer, proteinMediaViewer) {

    let exitBtn = root.querySelector(".modal__exit-btn");
    let textContainer = root.querySelector(".modal__text-container");
    let openProteinViewerBtn = root.querySelector(".vid-metadata__viewer-btn");

    let show = function() {
        if(!proteinMediaViewer.proteinViewer.initialized) proteinMediaViewer.proteinViewer.init();
        root.classList.remove("modal--hidden");
        textContainer.setAttribute("tabindex", 0);
        if(mainMediaViewer.videoPlayer && !mainMediaViewer.videoPlayer.root.classList.contains("video-player--hidden") && window.innerWidth > 900 && window.createImageBitmap) {
            setTimeout(mainMediaViewer.videoPlayer.resizeScrubCanvas, 200);
        }
    };

    let hide = function() {
        let openViewerMediaContainerEl = root.querySelector(".media-viewer__media-container--fixed-enlarged");
        if(openViewerMediaContainerEl) {
            if(openViewerMediaContainerEl.parentElement.classList.contains("media-viewer--protein-viewer")) {
                closeProteinViewer();
            } else {
                toggleMainMediaViewerFs();
            }
        }
        root.classList.add("modal--hidden");
        textContainer.setAttribute("tabindex", -1);
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

    mainMediaViewer.fullscreenBtn.addEventListener("click", toggleMainMediaViewerFs);
    if(openProteinViewerBtn) openProteinViewerBtn.addEventListener("click", openProteinViewer);
    if(proteinMediaViewer) proteinMediaViewer.fullscreenBtn.addEventListener("click", closeProteinViewer);

    return {
        root,
        exitBtn,
        show,
        hide
    }

};