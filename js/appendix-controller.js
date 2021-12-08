(function() {

    let appendixContainer = document.querySelector(".appendix");
    let rightNav = document.querySelector(".appendix__nav-arrow:last-child");
    let appendixAccordionEl = document.querySelector(".appendix-accordion");
    let treeMediaViewerEl = document.querySelector(".media-viewer");
    let treeViewerFsConfirmEl = document.getElementById("treeViewerFsConfirm");
    let feedbackLink = document.querySelector(".about-entry__feadback-link");
    let feedbackModalEl = document.getElementById("feedback");
    let modalOverlay = document.querySelector(".modal-overlay"); 
    let hash = window.location.hash.substring(1);
    let appendixController, appendixAccordion, treeMediaViewer, treeViewerFsConfirm, feedbackModal;

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

        let onTreeViewerFsConfirmCancel= function() {
            treeViewerFsConfirm.hide();
            modalOverlay.classList.add("modal-overlay--hidden");
        };

        let onTreeViewerFsConfirmOK = function() {
            treeViewerFsConfirm.hide();
            modalOverlay.classList.add("modal-overlay--hidden");
            appendixController.handleTreeMediaViewerFsBtnClick();
            treeMediaViewer.treeViewer.activateSpeciesEntryHash(hash);
        };

        let openFeedbackModal = function() {
            feedbackModal.show();
            modalOverlay.classList.remove("modal-overlay--hidden");
        };

        let hideFeedbackModal = function() {
            feedbackModal.hide();
            modalOverlay.classList.add("modal-overlay--hidden");
        };

        return {
            onAccordionHashChange,
            handleTreeMediaViewerFsBtnClick,
            onTreeViewerFsConfirmCancel,
            onTreeViewerFsConfirmOK,
            openFeedbackModal,
            hideFeedbackModal
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
        treeViewerFsConfirm = Modal(treeViewerFsConfirmEl, undefined, undefined, undefined);
        treeMediaViewer.fullscreenBtn.addEventListener("click", appendixController.handleTreeMediaViewerFsBtnClick);
        treeViewerFsConfirmEl.querySelector(".tree-viewer-fs-confirm__btn-cancel").addEventListener("click", appendixController.onTreeViewerFsConfirmCancel);
        treeViewerFsConfirmEl.querySelector(".tree-viewer-fs-confirm__btn-ok").addEventListener("click", appendixController.onTreeViewerFsConfirmOK);
        if(hash) {
            if(window.innerWidth < 900) {
                treeViewerFsConfirm.show();
                modalOverlay.classList.remove("modal-overlay--hidden");
            } else {
                appendixController.handleTreeMediaViewerFsBtnClick();
                treeMediaViewer.treeViewer.activateSpeciesEntryHash(hash);
            }
        }
    }
    if(feedbackLink) {
        feedbackModal = Modal(feedbackModalEl, undefined, undefined, undefined);
        feedbackLink.addEventListener("click", appendixController.openFeedbackModal);
        feedbackModal.exitBtn.addEventListener("click", appendixController.hideFeedbackModal);
        modalOverlay.addEventListener("click", appendixController.hideFeedbackModal);
    }
    if(appendixContainer.offsetWidth > appendixContainer.clientWidth) {
        let currentMargin = parseInt(window.getComputedStyle(rightNav)["margin-right"]);
        rightNav.style["margin-right"] = `${(appendixContainer.offsetWidth - appendixContainer.clientWidth) + currentMargin}px`;
    }

})();