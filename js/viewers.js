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
        quality : 'medium',
        fog: false
    };
    let viewerMenu = viewerEl.querySelector(".pv-menu");
    let viewer = pv.Viewer(document.getElementById(id), options);
    let structure;
    let renderType;

    pv.io.fetchPdb(`https://files.rcsb.org/download/${pdb}.pdb`, function(struct) {
        structure = struct;
        viewer.cartoon('structure', structure);
        renderType = "cartoon";
        viewer.centerOn(struct);
    });
    viewerMenu.style.display = "block";
    document.getElementById('lines').addEventListener("click", () => renderModel("lines"));
    document.getElementById('points').addEventListener("click", () => renderModel("points"));
    document.getElementById('spheres').addEventListener("click", () => renderModel("spheres"));
    document.getElementById('lineTrace').addEventListener("click", () => renderModel("lineTrace"));
    document.getElementById('sline').addEventListener("click", () => renderModel("sline"));
    document.getElementById('trace').addEventListener("click", () => renderModel("trace"));
    document.getElementById('tube').addEventListener("click", () => renderModel("tube"));
    document.getElementById('cartoon').addEventListener("click", () => renderModel("cartoon"));
    document.getElementById('ballsAndSticks').addEventListener("click", () => renderModel("ballsAndSticks"));

    document.getElementById('uniform').onclick = uniform;
    document.getElementById('chain').onclick = chain;
    document.getElementById('ssSuccession').onclick = ssSuccession;
    document.getElementById('ss').onclick = ss;
    document.getElementById('rainbow').onclick = rainbow;

    document.getElementById('bondCount').addEventListener("click", () => colorAtomProp("bondCount"));
    document.getElementById('index').addEventListener("click", () => colorAtomProp("index"));
    document.getElementById('isHetatm').addEventListener("click", () => colorAtomProp("isHetatm"));
    document.getElementById('occupancy').addEventListener("click", () => colorAtomProp("occupancy"));
    document.getElementById('tempFactor').addEventListener("click", () => colorAtomProp("tempFactor"));

    document.getElementById('r-index').addEventListener("click", () => colorResidueProp("index"));
    document.getElementById('isAminoacid').addEventListener("click", () => colorResidueProp("isAminoacid"));
    document.getElementById('isNucleotide').addEventListener("click", () => colorResidueProp("isNucleotide"));
    document.getElementById('isWater').addEventListener("click", () => colorResidueProp("isWater"));
    document.getElementById('num').addEventListener("click", () => colorResidueProp("num"));

    function renderModel(name, options) {
        viewer.clear();
        renderType = name;
        viewer.renderAs('structure', structure, name, options);
    }

    function uniform() {
        renderModel(renderType, { color: pv.color.uniform('blue') });
    }
    function chain() {
        renderModel(renderType, { color: pv.color.byChain() });
    }
    function ssSuccession() {
        renderModel(renderType, { color: pv.color.ssSuccession() });
    }
    function ss() {
        renderModel(renderType, { color: pv.color.bySS() });
    }
    function rainbow() {
        renderModel(renderType, { color: pv.color.rainbow() });
    }
    function colorAtomProp(prop) {
        renderModel(renderType, { color: pv.color.byAtomProp(prop) });
    }
    function colorResidueProp(prop) {
        renderModel(renderType, { color: pv.color.byResidueProp(prop) });
    }

    window.addEventListener("resize", () => viewer.resize(viewerEl.clientWidth, viewerEl.clientHeight));

    return {
        resize: () => viewer.resize(viewerEl.clientWidth, viewerEl.clientHeight)
    }
}