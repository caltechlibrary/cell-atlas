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
    let viewerMenu = viewerEl.querySelector(".pv-menu");
    let viewer = pv.Viewer(document.getElementById(id), options);
    let structure;

    pv.io.fetchPdb(`https://files.rcsb.org/download/${pdb}.pdb`, function(struct) {
        structure = struct;
        preset();
        viewer.centerOn(struct);
    });
    viewerMenu.style.display = "block";
    document.getElementById('cartoon').onclick = cartoon;
    document.getElementById('line-trace').onclick = lineTrace;
    document.getElementById('preset').onclick = preset;
    document.getElementById('lines').onclick = lines;
    document.getElementById('trace').onclick = trace;
    document.getElementById('sline').onclick = sline;
    document.getElementById('tube').onclick = tube;

    function lines() {
        viewer.clear();
        viewer.lines('structure', structure);
    }
    function cartoon() {
        viewer.clear();
        viewer.cartoon('structure', structure, { color: color.ssSuccession() });
    }
    function lineTrace() {
        viewer.clear();
        viewer.lineTrace('structure', structure);
    }
    function sline() {
        viewer.clear();
        viewer.sline('structure', structure);
    }

    function tube() {
        viewer.clear();
        viewer.tube('structure', structure);
    }

    function trace() {
        viewer.clear();
        viewer.trace('structure', structure);
    }
    function preset() {
        viewer.clear();
        let ligand = structure.select({rnames : ['RVP', 'SAH']});
        viewer.ballsAndSticks('ligand', ligand);
        viewer.cartoon('protein', structure);
    }

    window.addEventListener("resize", () => viewer.resize(viewerEl.clientWidth, viewerEl.clientHeight));

    return {
        resize: () => viewer.resize(viewerEl.clientWidth, viewerEl.clientHeight)
    }
}