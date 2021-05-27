let viewerApps = document.getElementsByClassName("viewer-app");
for(let viewerApp of viewerApps) {
    initializeViewer(viewerApp);
}

function initializeViewer(viewerEl) {
    let id = viewerEl.getAttribute("id");
    let type = viewerEl.getAttribute("data-viewer");
    let pdb = viewerEl.getAttribute("data-pdb");
    let link = document.querySelector(`.video-citation-value[data-pdb='${pdb}']`);
    let app;
    if(type == "molstar") {
        app = initializeMolstarApp(viewerEl, id, pdb);
    } else if (type == "pv"){
        app = initializePVApp(viewerEl, id, pdb);
    }

    window.addEventListener("resize", positionViewer);
    link.addEventListener("click", showViewer);

    function showViewer() {
        viewerEl.style.display = "block";
        positionViewer();
        app.resize();
    }

    function positionViewer() {
        let header = document.querySelector("header");
        let footer = document.querySelector("footer");
        let posTop = header.offsetHeight + ((footer.getBoundingClientRect().top - header.getBoundingClientRect().bottom) / 2);
        let aspectRatio = 0.5625;
        let availHeight = (footer.getBoundingClientRect().top - header.getBoundingClientRect().bottom) - 50;
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
    }
}

function initializeMolstarApp(viewerEl, id, pdb) {
    let viewer = new molstar.Viewer(id, {
        layoutIsExpanded: false,
        layoutShowControls: false,
        layoutShowRemoteState: false,
        layoutShowSequence: true,
        layoutShowLog: false,
        layoutShowLeftPanel: true,

        viewportShowExpand: true,
        viewportShowSelectionMode: false,
        viewportShowAnimation: false,

        pdbProvider: 'rcsb',
        emdbProvider: 'rcsb',
    });
    viewer.loadPdb(pdb);

    return {
        resize: () => viewer.handleResize()
    }
}

function initializePVApp(viewerEl, id, pdb) {
    let options = {
        antialias: true,
        quality : 'medium'
    };
    let viewer = pv.Viewer(document.getElementById(id), options);
    pv.io.fetchPdb(`https://files.rcsb.org/download/${pdb}.pdb`, function(structure) {
        // display the protein as cartoon, coloring the secondary structure
        // elements in a rainbow gradient.
        viewer.cartoon('protein', structure, { color : color.ssSuccession() });
        // there are two ligands in the structure, the co-factor S-adenosyl
        // homocysteine and the inhibitor ribavirin-5' triphosphate. They have
        // the three-letter codes SAH and RVP, respectively. Let's display them
        // with balls and sticks.
        var ligands = structure.select({ rnames : ['SAH', 'RVP'] });
        viewer.ballsAndSticks('ligands', ligands);
        viewer.centerOn(structure);
    });

    return {
        resize: () => viewer.resize(viewerEl.offsetWidth, viewerEl.offsetHeight)
    }
}