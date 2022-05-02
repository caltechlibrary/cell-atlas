(function() {

    let appendixContainer = document.querySelector(".appendix");
    let rightNav = document.querySelector(".appendix__nav-arrow:last-child");
    let appendixAccordionEl = document.querySelector(".appendix-accordion");
    let treeMediaViewerEl = document.querySelector(".media-viewer");
    let treeViewerEl = document.querySelector(".tree-viewer");
    let treeViewerFsConfirmEl = document.querySelector(".tree-viewer-fs-confirm");
    let treeViewerFsConfirmModalEl = document.getElementById("treeViewerFsConfirmModal");
    let phylogeneticListToggleBtn = document.querySelector(".appendix__phylogenetic-list-toggle-btn");
    let phylogeneticListPanel = document.querySelector(".appendix__phylogenetic-list-panel");
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

    let onPhylogeneticListToggleBtnClick = function() {
        if(phylogeneticListToggleBtn.getAttribute("aria-expanded") == "false") {
            phylogeneticListPanel.classList.remove("appendix__phylogenetic-list-panel--collapsed");
            if(!document.querySelector("body").classList.contains("preload")) {
                phylogeneticListPanel.style.height = `${phylogeneticListPanel.scrollHeight}px`;
                phylogeneticListPanel.addEventListener("transitionend", onPhylogeneticListPanelExpanded, { once: true });
            } else {
                phylogeneticListPanel.style.height = null;
            }
            phylogeneticListToggleBtn.setAttribute("aria-expanded", "true");
        } else {
            phylogeneticListPanel.style.height = `${phylogeneticListPanel.scrollHeight}px`;
            window.requestAnimationFrame(() => {
                phylogeneticListPanel.classList.add("appendix__phylogenetic-list-panel--collapsed");
                phylogeneticListPanel.style.height = "0px";
            });
            phylogeneticListToggleBtn.setAttribute("aria-expanded", "false");
        }
    };

    let onPhylogeneticListPanelExpanded = function(event) {
        if(!event.target.classList.contains("appendix__phylogenetic-list-panel--collapsed")) event.target.style.height = null;
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
        phylogeneticListToggleBtn.addEventListener("click", onPhylogeneticListToggleBtnClick);
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