(function() {

    let appendixAccordionEl = document.querySelector(".appendix-accordion");
    let treeMediaViewerEl = document.querySelector(".media-viewer");
    let hash = window.location.hash.substring(1);
    let appendixController, appendixAccordion, treeMediaViewer;

    let AppendixController = function() {
        
        let handleTreeMediaViewerFsBtnClick = function() {
            if(window.innerWidth < 900) {
                treeMediaViewer.toggleFullscreen();
            } else {
                treeMediaViewer.toggleFixedEnlarged();
            }
        };

        return {
            handleTreeMediaViewerFsBtnClick
        }

    };
    
    appendixController = AppendixController();
    if(appendixAccordionEl) {
        appendixAccordion = AppendixAccordion(appendixAccordionEl);
        if(hash) appendixAccordion.manuallyOpenPanel(hash);
    }
    if(treeMediaViewerEl) {
        let treeViewerEl = treeMediaViewerEl.querySelector(".tree-viewer");
        let treeViewer = TreeViewer(treeViewerEl);
        treeMediaViewer = MediaViewer(treeMediaViewerEl, undefined, undefined, undefined, undefined, treeViewer);
        treeMediaViewer.fullscreenBtn.addEventListener("click", appendixController.handleTreeMediaViewerFsBtnClick);
    }

})();