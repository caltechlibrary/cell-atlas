let molstarApps = document.getElementsByClassName("molstar-app");
for(let molstarApp of molstarApps) {
    molstarApp.parentElement.classList.add("viewer-demo");
    initializeMolstarApp(molstarApp);
}

function initializeMolstarApp(viewerEl) {
    let id = viewerEl.getAttribute("id");
    let pdb = viewerEl.getAttribute("data-pdb");
    let link = document.querySelector(`.video-citation-value[data-pdb='${pdb}']`);
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

    window.addEventListener("resize", positionViewer);
    link.addEventListener("click", showViewer);

    function showViewer() {
        viewerEl.style.display = "block";
        positionViewer();
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
        viewer.handleResize();
    }
}