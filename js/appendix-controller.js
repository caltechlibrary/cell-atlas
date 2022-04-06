(function() {

    let appendixContainer = document.querySelector(".appendix");
    let rightNav = document.querySelector(".appendix__nav-arrow:last-child");
    let appendixAccordionEl = document.querySelector(".appendix-accordion");
    let treeMediaViewerEl = document.querySelector(".media-viewer");
    let treeViewerEl = document.querySelector(".tree-viewer");
    let treeViewerFsConfirmEl = document.getElementById("treeViewerFsConfirm");
    let feedbackLinks = document.querySelectorAll(".about-entry__feadback-link");
    let feedbackModalEl = document.getElementById("feedback");
    let hash = window.location.hash.substring(1);
    let appendixAccordion, treeMediaViewer, treeViewer, treeViewerFsConfirm, feedbackModal;

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

    let onTreeViewerFsConfirmOK = function() {
        treeViewerFsConfirm.hide();
        treeMediaViewer.toggleFullscreen();
        treeMediaViewer.setFullscreenBtnState("expanded");
        setTimeout(() => treeViewer.activateSpeciesEntryHash(hash), 200);
    };
    
    if(appendixAccordionEl) {
        appendixAccordion = AppendixAccordion(appendixAccordionEl);
        if(hash) appendixAccordion.manuallyOpenPanel(hash);
        window.addEventListener("hashchange", onAccordionHashChange);
    }
    if(treeMediaViewerEl) {
        treeViewer = TreeViewer(treeViewerEl);
        treeMediaViewer = MediaViewer(treeMediaViewerEl);
        treeViewerFsConfirm = Modal(treeViewerFsConfirmEl);
        treeMediaViewer.fullscreenBtn.addEventListener("click", handleTreeMediaViewerFsBtnClick);
        treeViewerFsConfirmEl.querySelector(".tree-viewer-fs-confirm__btn-cancel").addEventListener("click", treeViewerFsConfirm.hide);
        treeViewerFsConfirmEl.querySelector(".tree-viewer-fs-confirm__btn-ok").addEventListener("click", onTreeViewerFsConfirmOK);
        if(hash) {
            if(window.innerWidth < 900) {
                treeViewerFsConfirm.show();
            } else {
                treeMediaViewer.toggleFixedEnlarged();
                treeMediaViewer.setFullscreenBtnState("expanded");
                treeViewer.activateSpeciesEntryHash(hash);
            }
        }
    }
    if(feedbackLinks.length > 0) {
        feedbackModal = Modal(feedbackModalEl);
        for(let feedbackLink of feedbackLinks) feedbackLink.addEventListener("click", feedbackModal.show);
    }
    if(appendixContainer.offsetWidth > appendixContainer.clientWidth) {
        let currentMargin = parseInt(window.getComputedStyle(rightNav)["margin-right"]);
        rightNav.style["margin-right"] = `${(appendixContainer.offsetWidth - appendixContainer.clientWidth) + currentMargin}px`;
    }

})();