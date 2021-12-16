let ProteinViewer = function(root) {

    let pdb = root.getAttribute("data-pdb");
    let modelSelect = root.querySelector(".protein-viewer__model-select");
    let colorSelect = root.querySelector(".protein-viewer__color-select");
    let atomLabel = root.querySelector(".protein-viewer__atom-label");
    let viewerObj = pv.Viewer(root, {
        antialias: true,
        quality : 'medium',
        fog: false,
        selectionColor : "#000"
    });
    let pvCanvas = root.querySelector("canvas");
    let chainGradient = pv.color.gradient(["#FF6C0C", "#5A2328", "#70A0AF", "#A8C686", "#003B4C"]);
    let ssGradient = pv.color.gradient(["#CCCCCC", "#003B4C", "#FF6C0C"]);
    let initialized = false;
    let largeFileSize = 5000000;
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
    };
    let viewerStructs, prevPicked;;

    let init = function() {
        if(window.innerWidth < 900) {
            for(let option of modelSelect.options) {
                if(option.value == "spheres" || option.value == "ballsAndSticks") modelSelect.removeChild(option);
            }
        }
        fetch(`https://www.cellstructureatlas.org/pdb/${pdb}.pdb1`)
                .then(processFetchRes)
                .then(loadPdb);
        this.initialized = true;
    };

    let processFetchRes = function(res) {
        let contentLength = res.headers.get("content-length");
        if(contentLength > largeFileSize) {
            for(let option of modelSelect.options) {
                if(option.value == "ballsAndSticks") modelSelect.removeChild(option);
            }
        }
        return res.text();
    };

    let loadPdb = function(data) {
        viewerStructs = pv.io.pdb(data, { loadAllModels: true });
        viewerStructs.forEach(function(viewerStruct, index) {
            viewerObj.cartoon(`structure_${index}`, viewerStruct, { color: pv.color.byChain(chainGradient) })
        });
        viewerObj.autoZoom();
    };

    let resizeViewer = function() {
        viewerObj.resize(root.offsetWidth, root.offsetHeight);
    };

    let handleTouch = function(event) {
        let handleTouchend = function() {
            if(validTap) {
                let pos = { x: event.touches[0].clientX - pvCanvas.getBoundingClientRect().x, y: event.touches[0].clientY - pvCanvas.getBoundingClientRect().y };
                handleInput(pos);
            }
            root.removeEventListener("touchmove", handleTouchmove);
        }

        let handleTouchmove = function() {
            validTap = false;
        }

        let validTap = true;
        root.addEventListener("touchend", handleTouchend, { once: true });
        root.addEventListener("touchmove", handleTouchmove, { once: true });
    };

    let handleMouseDown = function(event) {
        let handleMouseup = function() {
            if(validPress) {
                let pos = { x: event.clientX - pvCanvas.getBoundingClientRect().x, y: event.clientY - pvCanvas.getBoundingClientRect().y };
                handleInput(pos);
            }
            root.removeEventListener("mousemove", handleMousemove);
        }

        let handleMousemove = function() {
            validPress = false;
        }

        let validPress = true;
        root.addEventListener("mouseup", handleMouseup, { once: true });
        root.addEventListener("mousemove", handleMousemove, { once: true });
    };

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
            let residueNum = atomNameComponents[1].substring(3);
            let proteinName = proteinDict[atomNameComponents[1].substring(0, 3)];
            highlightAtom(picked.node(), atom);
            if(!proteinName) {
                atomLabel.innerHTML = "non-protein";
            } else if(proteinName == "water") {
                atomLabel.innerHTML = `${proteinName}`;
            } else {
                atomLabel.innerHTML = `Residue #${residueNum} | ${proteinName}`;
            }
            atomLabel.classList.remove("protein-viewer__atom-label--hidden");
            prevPicked = { node: picked.node() }
        } else {
            atomLabel.classList.add("protein-viewer__atom-label--hidden");
        }
        requestRedraw();
    };

    let requestRedraw = function() {
        viewerObj.requestRedraw();
    };

    let highlightAtom = function(geomObj, atom) {
        let view = geomObj.structure().createEmptyView();
        view.addAtom(atom);
        geomObj.setSelection(view);
    };

    let unHighlightAtom = function(geomObj) {
        let view = geomObj.structure().createEmptyView();
        geomObj.setSelection(view);
    };

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
    };

    let changeColor = function() {
        let color = colorSelect.value;
        viewerObj.forEach(function(geomObj) {
            if(color == "chain") {
                geomObj.colorBy(pv.color.byChain(chainGradient));
            } else if(color == "ss") {
                geomObj.colorBy(pv.color.bySS(ssGradient));
            }
        });
        requestRedraw();
    };

    root.addEventListener("touchstart", handleTouch);
    root.addEventListener("mousedown", handleMouseDown);
    modelSelect.addEventListener("change", changeModel);
    colorSelect.addEventListener("change", changeColor);

    return {
        initialized,
        init,
        resizeViewer,
        requestRedraw
    }
};