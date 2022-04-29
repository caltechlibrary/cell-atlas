(function() {

    let appendixContainer = document.querySelector(".appendix");
    let rightNav = document.querySelector(".appendix__nav-arrow:last-child");
    let appendixAccordionEl = document.querySelector(".appendix-accordion");
    let treeMediaViewerEl = document.querySelector(".media-viewer");
    let treeViewerEl = document.querySelector(".tree-viewer");
    let treeViewerFsConfirmEl = document.querySelector(".tree-viewer-fs-confirm");
    let treeViewerFsConfirmModalEl = document.getElementById("treeViewerFsConfirmModal");
    let feedbackLinks = document.querySelectorAll(".about-entry__feadback-link");
    let feedbackModalEl = document.getElementById("feedback");
    let hash = window.location.hash.substring(1);
    let treeMediaViewer, treeViewer, treeViewerFsConfirmModal, feedbackModal;
    
    let onTreeMediaViewerRequestFullscreenChangeCallback = function() {
        if(window.innerWidth < 900) {
            treeMediaViewer.toggleFullscreen();
        } else {
            treeMediaViewer.toggleFixedEnlarged();
        }
    };

    let onTreeViewerFsConfirmOkCallback = function() {
        treeViewerFsConfirmModal.hide();
        treeMediaViewer.toggleFullscreen();
        treeMediaViewer.setFullscreenBtnState("expanded");
        setTimeout(() => treeViewer.activateSpeciesEntryHash(hash), 200);
    };

    let onTreeViewerFsConfirmCancelCallback = function() {
        treeViewerFsConfirmModal.hide();
    };
    
    if(appendixAccordionEl) AppendixAccordion(appendixAccordionEl);
    if(treeMediaViewerEl) {
        treeViewer = TreeViewer(treeViewerEl);
        treeMediaViewer = MediaViewer(treeMediaViewerEl, onTreeMediaViewerRequestFullscreenChangeCallback);
        treeViewerFsConfirmModal = Modal(treeViewerFsConfirmModalEl);
        TreeViewerFsConfirm(treeViewerFsConfirmEl, onTreeViewerFsConfirmOkCallback, onTreeViewerFsConfirmCancelCallback);
        if(hash) {
            if(window.innerWidth < 900) {
                treeViewerFsConfirmModal.show();
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