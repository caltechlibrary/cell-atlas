// Function that takes id of a modal component and displays it and 
// sets up modal-related event listeners. Requires a modalOverlay element
// to exist on the page
function openModal(modalId) {
    let modal = document.getElementById(modalId);
    let modalOverlay = document.getElementById("modalOverlay");
    let lastFocused = document.activeElement;
    let modalText = modal.querySelector(".subsection-modal-text");
    let qualityChangerDesktop = modal.querySelector(".video-quality-player-control");
    let imgBlock = modal.querySelector(".content-img");
    let fullBackground = modal.querySelector(".book-section-comparison-slider-fullscreen-container");

    modalOverlay.style.display = "block";
    modal.style.display = "flex";
    modal.setAttribute("tabindex", 0);
    modal.focus();
    if(modalText) modalText.setAttribute("tabindex", "0");

    if(window.innerWidth > 900) {
        window.addEventListener("resize", computeMaxWidth);
        computeMaxWidth();
    }

    document.addEventListener("focusin", restrictFocus);
    document.addEventListener("keydown", closeModalKey);
    modalOverlay.addEventListener("mousedown", closeModalClick);
    if(modalText) addTypeFocusToggle(modalText);

    function restrictFocus(event) {
        if(!modal.contains(event.target)) {
            event.stopPropagation();
            modal.focus();
        }
    }
    
    function closeModalKey(event) {
        if(event.key === 27 || event.key === "Escape"){
            hideModal();
        } 
    }
    
    function closeModalClick(event) {
        if(event.target == modalOverlay || event.target.classList[0] == "modal-exit-button-mobile"){
            hideModal();
        }
    }

    function hideModal() {
        let modalVideo = modal.querySelector("video");
        if(modalVideo && !modalVideo.paused) modalVideo.pause();
        document.removeEventListener("focusin", restrictFocus);
        document.removeEventListener("keydown", closeModalKey);
        window.removeEventListener("resize", computeMaxWidth);
        modalOverlay.removeEventListener("click", closeModalClick);
        modalOverlay.style.display = "none";
        modal.style.display = "none";
        if(qualityChangerDesktop && qualityChangerDesktop.getAttribute("data-state") == "expanded") {
            qualityChangerDesktop.setAttribute("data-state", "collapsed");
        }
        if(modalText) modalText.setAttribute("tabindex", "-1");
        if(fullBackground && window.innerWidth > 900 && fullBackground.getAttribute("data-state") != "failed") {
            let minimizeButton = fullBackground.querySelector(".book-section-comparison-exit-fullscreen-desktop");
            minimizeButton.click();
        }
        if(imgBlock && window.innerWidth > 900) {
            let imgContainer = imgBlock.querySelector(".content-img__img-container");
            if(imgContainer.classList.contains("content-img__img-container--enlarged")) {
                let minBtn = imgBlock.querySelector(".content-img__minimize-btn");
                minBtn.click();
            }
        }
        lastFocused.focus();
    }

    function computeMaxWidth() {
        if(window.innerWidth > 900) {
            if(window.innerHeight < 900) {
                let maxHeight = modalOverlay.offsetHeight * 0.97
                let fixedMaxWidth = (maxHeight * 1.28) - (maxHeight * 0.1);
                let currentMaxWidth = window.innerWidth * 0.52;
                modal.style["max-width"] = (fixedMaxWidth < currentMaxWidth) ? `${fixedMaxWidth}px` : "52%";
            } else {
                modal.style["max-width"] = "52%";
            }
        }
    }
}

let viewerEls = document.getElementsByClassName("protein-viewer");
for(let viewerEl of viewerEls) {
    let openViewer = function() {
        if(window.innerWidth >= 900) {
            viewerEl.classList.add("protein-viewer--enlarged");
            viewerEl.classList.remove("protein-viewer--hidden");
            positionViewerPopUp();
            window.addEventListener("resize", positionViewerPopUp);
        }
    }

    let closeViewer = function() {
        if(window.innerWidth >= 900) {
            viewerEl.classList.add("protein-viewer--hidden");
            viewerEl.classList.remove("protein-viewer--enlarged");
        }
    }

    let positionViewerPopUp = function() {
        let header = document.querySelector("header");
        let footer = document.querySelector("footer");
        let distHeaderFooter = footer.getBoundingClientRect().top - header.getBoundingClientRect().bottom
        let posTop = header.offsetHeight + (distHeaderFooter / 2);
        let aspectRatio = 0.5625;
        let availHeight = distHeaderFooter - 50;
        let availWidth = window.innerWidth - 100;
        let desiredWidth = availHeight / aspectRatio;
        if(desiredWidth <= availWidth) {
            viewerEl.style.width = `${desiredWidth}px`;
            viewerEl.style.height = `${desiredWidth * aspectRatio}px`;
        } else {
            viewerEl.style.width = `${availWidth}px`;
            viewerEl.style.height = `${availWidth * aspectRatio}px`;
        }
        viewerEl.style.top = `${posTop}px`;
        resizeViewer();
    }

    let resizeViewer = function() {
        let viewerElCompStyle = window.getComputedStyle(viewerEl);
        let width = parseFloat(viewerElCompStyle.width);
        let height = parseFloat(viewerElCompStyle.height);
        let borderWidth = parseFloat(viewerElCompStyle.borderWidth);
        viewerObj.resize(width - (borderWidth * 2), height - (borderWidth * 2));
    }

    let changeModel = function() {
        let modelType = modelSelect.value;
        let color = colorSelect.value;
        let options = {};
        if(color == "chain") {
            options.color = pv.color.byChain();
        } else if(color == "ss") {
            options.color = pv.color.bySS();
        } else if(color == "tempFactor") {
            options.color = pv.color.byAtomProp(color);
        }

        viewerObj.clear();
        viewerStructs.forEach(function(viewerStruct, index) {
            viewerObj.renderAs(`structure_${index}`, viewerStruct, modelType, options);
        });
    }

    let changeColor = function() {
        let color = colorSelect.value;
        viewerObj.forEach(function(geomObj) {
            if(color == "chain") {
                geomObj.colorBy(pv.color.byChain());
            } else if(color == "ss") {
                geomObj.colorBy(pv.color.bySS());
            } else if(color == "tempFactor") {
                geomObj.colorBy(pv.color.byAtomProp(color));
            }
        });
        viewerObj.requestRedraw();
    }

    let pdb = viewerEl.getAttribute("data-pdb");
    let openBtn = document.querySelector(`button[value='${pdb}']`);
    let minBtn = viewerEl.querySelector(".protein-viewer__min-btn");
    let modelSelect = viewerEl.querySelector(".protein-viewer__model-select");
    let colorSelect = viewerEl.querySelector(".protein-viewer__color-select");
    let viewerOptions = {
        antialias: true,
        quality : 'medium',
        fog: false
    };
    let viewerObj = pv.Viewer(viewerEl, viewerOptions);
    let viewerStructs;
    
    openBtn.addEventListener("click", openViewer);
    minBtn.addEventListener("click", closeViewer);
    modelSelect.addEventListener("change", changeModel);
    colorSelect.addEventListener("change", changeColor);
    pv.io.fetchPdb(`https://files.rcsb.org/view/${pdb}.pdb1`, function(structures) {
        viewerObj.on('viewerReady', function() {
            viewerStructs = structures
            viewerStructs.forEach(function(viewerStruct, index) {
                viewerObj.cartoon(`structure_${index}`, viewerStruct, { color: pv.color.byChain() })
            });
            viewerObj.autoZoom();
        });
    }, { loadAllModels: true });
}