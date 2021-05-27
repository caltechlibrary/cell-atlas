let molstarApps = document.getElementsByClassName("molstar-app");
for(let molstarApp of molstarApps) {
    molstarApp.parentElement.classList.add("viewer-demo");
    initializeMolstarApp(molstarApp);
}

function initializeMolstarApp(viewerEl) {
    let id = viewerEl.getAttribute("id");
    let playerId = viewerEl.getAttribute("data-player");
    let imageBtn = document.querySelector(`button[data-player='${playerId}'][value='image']`);
    let textContent = document.getElementById("textContent");
    let pdb;

    if(id == "molstar-player-molstar-demo") {
        pdb = "5WUJ"
    } else if(id == "molstar-player-molstar-demo-subsection") {
        pdb = "6TQH"
    }
    var viewer = new molstar.Viewer(id, {
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

    imageBtn.addEventListener("click", () => resizeContainer());
    window.addEventListener("resize", () => resizeContainer());
    if(id == "molstar-player-molstar-demo") {
        updateMainMaxHeight();
        textContent.addEventListener("transitionend", () => resizeContainer());
        window.addEventListener("resize", updateMainMaxHeight);
    }

    function resizeContainer() {
        viewerEl.style.height = `${viewerEl.offsetWidth * 0.5625}px`;
        viewer.handleResize();
    }

    function updateMainMaxHeight() {
        let nonTextContent = document.querySelector("#nonTextContent");
        let videoContainer = nonTextContent.querySelector(".book-section-video-container");
        let buttonContainer = nonTextContent.querySelector(".book-section-comparison-button-container");
        viewerEl.style["max-height"] = `${(videoContainer.offsetHeight - buttonContainer.offsetHeight - 14)}px`;
    }
}