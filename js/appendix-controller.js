(function() {

    let appendixAccordionEl = document.querySelector(".appendix-accordion");
    let treeMediaViewerEl = document.querySelector(".media-viewer");
    let hash = window.location.hash.substring(1);
    let appendixController, appendixAccordion, treeMediaViewer;

    let AppendixController = function() {

        let onAccordionHashChange = function() {
            hash = window.location.hash.substring(1);
            if(hash) appendixAccordion.manuallyOpenPanel(hash);
        };
        
        let handleTreeMediaViewerFsBtnClick = function() {
            if(window.innerWidth < 900) {
                treeMediaViewer.toggleFullscreen();
            } else {
                treeMediaViewer.toggleFixedEnlarged();
            }
        };

        return {
            onAccordionHashChange,
            handleTreeMediaViewerFsBtnClick
        }

    };
    
    appendixController = AppendixController();
    if(appendixAccordionEl) {
        appendixAccordion = AppendixAccordion(appendixAccordionEl);
        if(hash) appendixAccordion.manuallyOpenPanel(hash);
        window.addEventListener("hashchange", appendixController.onAccordionHashChange);
    }
    if(treeMediaViewerEl) {
        let treeViewerEl = treeMediaViewerEl.querySelector(".tree-viewer");
        let treeViewer = TreeViewer(treeViewerEl);
        treeMediaViewer = MediaViewer(treeMediaViewerEl, undefined, undefined, undefined, undefined, treeViewer);
        treeMediaViewer.fullscreenBtn.addEventListener("click", appendixController.handleTreeMediaViewerFsBtnClick);
    }

})();