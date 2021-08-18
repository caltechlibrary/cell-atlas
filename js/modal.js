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
    let viewerBlock = modal.querySelector(".protein-viewer");
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
        if(viewerBlock && window.innerWidth > 900) {
            let viewerContainer = viewerBlock.querySelector(".protein-viewer__viewer-container");
            if(viewerContainer.classList.contains("protein-viewer__viewer-container--enlarged")) {
                let minBtn = viewerBlock.querySelector(".protein-viewer__min-btn");
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
            viewerContainer.classList.add("protein-viewer__viewer-container--enlarged");
            viewerEl.classList.remove("protein-viewer--hidden");
            positionViewerPopUp();
            parentModal.classList.add("subsection-modal--min");
            window.addEventListener("resize", positionViewerPopUp);
            viewerObj.requestRedraw();
        } else {
            window.addEventListener("resize", resizeViewer);
            if(viewerContainer.requestFullscreen) {
                document.addEventListener("fullscreenchange", function() {
                    viewerEl.classList.remove("protein-viewer--hidden");
                    resizeViewer();
                }, { once: true });
                viewerContainer.requestFullscreen();
            } else {
                fsContainer.classList.add("protein-viewer__fullscreen-container--fs-polyfill");
                viewerContainer.classList.add("protein-viewer__viewer-container--fs-polyfill");
                viewerEl.classList.remove("protein-viewer--hidden");
                resizeViewer();
            }
        }
    }

    let closeViewer = function() {
        viewerEl.classList.add("protein-viewer--hidden");
        if(window.innerWidth >= 900) {
            viewerContainer.classList.remove("protein-viewer__viewer-container--enlarged");
            parentModal.classList.remove("subsection-modal--min");
            window.removeEventListener("resize", positionViewerPopUp);
        } else {
            window.removeEventListener("resize", resizeViewer);
            if(viewerContainer.requestFullscreen) {
                window.removeEventListener("resize", resizeViewer);
                document.exitFullscreen();
            } else {
                fsContainer.classList.remove("protein-viewer__fullscreen-container--fs-polyfill");
                viewerContainer.classList.remove("protein-viewer__viewer-container--fs-polyfill");
            }
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
            viewerContainer.style.width = `${desiredWidth}px`;
            viewerContainer.style.height = `${desiredWidth * aspectRatio}px`;
        } else {
            viewerContainer.style.width = `${availWidth}px`;
            viewerContainer.style.height = `${availWidth * aspectRatio}px`;
        }
        viewerContainer.style.top = `${posTop}px`;
        resizeViewer();
    }

    let resizeViewer = function() {
        let viewerContainerCompStyle = window.getComputedStyle(viewerContainer);
        let width = viewerContainer.offsetWidth;
        let height = viewerContainer.offsetHeight;
        let borderWidth = parseFloat(viewerContainerCompStyle.borderWidth);
        viewerObj.resize(width - (borderWidth * 2), height - (borderWidth * 2));
    }

    let changeModel = function() {
        let modelType = modelSelect.value;
        let color = colorSelect.value;
        let options = {};
        if(color == "chain") {
            options.color = pv.color.byChain(chainGradient);
        } else if(color == "ss") {
            options.color = pv.color.bySS(ssGradient);
        }

        atomLabel.classList.add("protein-viewer__atom-label--hidden");
        viewerObj.clear();
        viewerStructs.forEach(function(viewerStruct, index) {
            viewerObj.renderAs(`structure_${index}`, viewerStruct, modelType, options);
        });
        if(prevPicked) {
            unHighlightAtom(prevPicked.node);
            prevPicked = null;
        }
    }

    let changeColor = function() {
        let color = colorSelect.value;
        viewerObj.forEach(function(geomObj) {
            if(color == "chain") {
                geomObj.colorBy(pv.color.byChain(chainGradient));
            } else if(color == "ss") {
                geomObj.colorBy(pv.color.bySS(ssGradient));
            }
        });
        viewerObj.requestRedraw();
    }

    let highlightAtom = function(geomObj, atom) {
        let view = geomObj.structure().createEmptyView();
        view.addAtom(atom);
        geomObj.setSelection(view);
    }

    let unHighlightAtom = function(geomObj) {
        let view = geomObj.structure().createEmptyView();
        geomObj.setSelection(view);
    }

    let handleInput = function(pos) {
        let picked = viewerObj.pick(pos);
        if((!prevPicked && !picked) || prevPicked && picked && picked.target() == prevPicked.atom) return;
        if(prevPicked) {
            unHighlightAtom(prevPicked.node);
            prevPicked = null;
        }
        if(picked) {
            let atom = picked.target();
            let atomNameComponents = atom.qualifiedName().split(".");
            let proteinNum = atomNameComponents[0].charCodeAt("0") - 64;
            let residueNum = atomNameComponents[1].substring(3);
            let proteinName = proteinDict[atomNameComponents[1].substring(0, 3)];
            highlightAtom(picked.node(), atom);
            if(proteinName == "water") {
                atomLabel.innerHTML = `${proteinName}`;
            } else {
                atomLabel.innerHTML = `Protein ${proteinNum} | Residue #${residueNum} | ${proteinName}`;
            }
            atomLabel.classList.remove("protein-viewer__atom-label--hidden");
            prevPicked = { node: picked.node() }
        } else {
            atomLabel.classList.add("protein-viewer__atom-label--hidden");
        }
        viewerObj.requestRedraw();
    }

    let handleTouch = function(event) {
        let handleTouchend = function() {
            if(validTap) {
                let pos = { x: event.touches[0].clientX - pvCanvas.getBoundingClientRect().x, y: event.touches[0].clientY - pvCanvas.getBoundingClientRect().y };
                handleInput(pos);
            }
            viewerContainer.removeEventListener("touchmove", handleTouchmove);
        }

        let handleTouchmove = function() {
            validTap = false;
        }

        let validTap = true;
        viewerContainer.addEventListener("touchend", handleTouchend, { once: true });
        viewerContainer.addEventListener("touchmove", handleTouchmove, { once: true });
    }

    let handleMouseDown = function(event) {
        let handleMouseup = function() {
            if(validPress) {
                let pos = { x: event.clientX - pvCanvas.getBoundingClientRect().x, y: event.clientY - pvCanvas.getBoundingClientRect().y };
                handleInput(pos);
            }
            viewerContainer.removeEventListener("mousemove", handleMousemove);
        }

        let handleMousemove = function() {
            validPress = false;
        }

        let validPress = true;
        viewerContainer.addEventListener("mouseup", handleMouseup, { once: true });
        viewerContainer.addEventListener("mousemove", handleMousemove, { once: true });
    }

    let processFetchRes = function(res) {
        let contentLength = res.headers.get("content-length");
        if(contentLength > largeFileSize) {
            for(let option of modelSelect.options) {
                if(option.value == "ballsAndSticks" || (option.value == "spheres" && window.innerWidth < 900)) modelSelect.removeChild(option);
            }
        }
        return res.text();
    }

    let loadPdb = function(data) {
        viewerStructs = pv.io.pdb(data, { loadAllModels: true });
        viewerStructs.forEach(function(viewerStruct, index) {
            viewerObj.cartoon(`structure_${index}`, viewerStruct, { color: pv.color.byChain(chainGradient) })
        });
        viewerObj.autoZoom();
    }

    let pdb = viewerEl.getAttribute("data-pdb");
    let openBtn = document.querySelector(`button[value='${pdb}']`);
    let parentModal = viewerEl.parentElement;
    let viewerContainer = viewerEl.querySelector(".protein-viewer__viewer-container");
    let fsContainer = viewerEl.querySelector(".protein-viewer__fullscreen-container");
    let atomLabel = viewerEl.querySelector(".protein-viewer__atom-label");
    let minBtn = viewerEl.querySelector(".protein-viewer__min-btn");
    let modelSelect = viewerEl.querySelector(".protein-viewer__model-select");
    let colorSelect = viewerEl.querySelector(".protein-viewer__color-select");
    let viewerOptions = {
        antialias: true,
        quality : 'medium',
        fog: false,
        selectionColor : "#000"
    };
    let chainGradient = pv.color.gradient(["#FF6C0C", "#5A2328", "#70A0AF", "#A8C686", "#003B4C"]);
    let ssGradient = pv.color.gradient(["#CCCCCC", "#003B4C", "#FF6C0C"]);
    let viewerObj = pv.Viewer(viewerContainer, viewerOptions);
    let pvCanvas = viewerContainer.querySelector("canvas");
    let viewerStructs;
    let prevPicked;
    let proteinDict = {
        "ALA": "alanine",
        "ARG": "arginine",
        "ASN": "asparagine",
        "ASP": "aspartate",
        "CYS": "cysteine",
        "GLU": "glutamate",
        "GLN": "glutamine",
        "GLY": "glycine",
        "HIS": "histidine",
        "ILE": "isoleucine",
        "LEU": "leucine",
        "LYS": "lysine",
        "MET": "methionine",
        "PHE": "phenylalanine",
        "PRO": "proline",
        "SEC": "selenocysteine",
        "SER": "serine",
        "THR": "threonine",
        "TRP": "tryptophan",
        "TYR": "tyrosine",
        "VAL": "valine",
        "HOH": "water",
        "XAA": "other"
    }
    // File size in bytes of PDB files that may cause rendering issues
    let largeFileSize = 5000000;
    
    openBtn.addEventListener("click", openViewer);
    minBtn.addEventListener("click", closeViewer);
    modelSelect.addEventListener("change", changeModel);
    colorSelect.addEventListener("change", changeColor);
    viewerContainer.addEventListener("touchstart", handleTouch);
    viewerContainer.addEventListener("mousedown", handleMouseDown);
    fetch(`https://www.cellstructureatlas.org/pdb/${pdb}.pdb1`)
        .then(processFetchRes)
        .then(loadPdb);
}