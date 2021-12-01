(function() {

    let appendixAccordionEl = document.querySelector(".appendix-accordion");
    let treeMediaViewerEl = document.querySelector(".media-viewer");
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
    if(appendixAccordionEl) appendixAccordion = AppendixAccordion(appendixAccordionEl);
    if(treeMediaViewerEl) {
        let treeViewerEl = treeMediaViewerEl.querySelector(".tree-viewer");
        treeMediaViewer = MediaViewer(treeMediaViewerEl, undefined, undefined, undefined, undefined, treeViewerEl);
        treeMediaViewer.fullscreenBtn.addEventListener("click", appendixController.handleTreeMediaViewerFsBtnClick);
    }

})();