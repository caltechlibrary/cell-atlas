let Modal = function(root, narrationPlayer, onOpenCallback = function(){},  onCloseCallback = function(){}) {

    let modalContainer = root.querySelector(".modal__modal-container");
    let exitBtn = root.querySelector(".modal__exit-btn");
    let contentContainer = root.querySelector(".modal__content-container");
    let narrationToggleBtn = root.querySelector(".modal__toggle-narration-btn");

    let show = function() {
        if(contentContainer) contentContainer.setAttribute("tabindex", 0);
        root.classList.remove("modal--hidden");
        root.focus();
        document.addEventListener("keydown", onOpenModalKeyDown);
        onOpenCallback();
    };

    let onOpenModalKeyDown = function(event) {
        if(event.key == "Escape") hide();
    };

    let hide = function() {
        onCloseCallback();
        root.classList.add("modal--hidden");
        if(contentContainer) contentContainer.setAttribute("tabindex", -1);
        document.removeEventListener("keydown", onOpenModalKeyDown);
    };

    let onRootClick = function(event) {
        if(!modalContainer.contains(event.target)) hide();
    };

    let toggleNarrationPlayer = function() {
        let showIcon = root.querySelector(".modal__toggle-narration-btn-show-icon");
        let hideIcon = root.querySelector(".modal__toggle-narration-btn-hide-icon");
        if(narrationPlayer.root.classList.contains("narration-player--hidden")) {
            if(!narrationPlayer.initialized) narrationPlayer.init();
            narrationPlayer.root.classList.remove("narration-player--hidden");
            showIcon.classList.add("modal__toggle-narration-btn-icon--hidden");
            hideIcon.classList.remove("modal__toggle-narration-btn-icon--hidden");
            narrationToggleBtn.classList.add("modal__toggle-narration-btn--activated");
        } else {
            narrationPlayer.root.classList.add("narration-player--hidden");
            showIcon.classList.remove("modal__toggle-narration-btn-icon--hidden");
            hideIcon.classList.add("modal__toggle-narration-btn-icon--hidden");
            narrationToggleBtn.classList.remove("modal__toggle-narration-btn--activated");
            if(!narrationPlayer.audio.paused) narrationPlayer.togglePlayback();
        }
    };

    root.addEventListener("click", onRootClick);
    exitBtn.addEventListener("click", hide);
    if (narrationToggleBtn) narrationToggleBtn.addEventListener("click", toggleNarrationPlayer);

    return {
        root,
        show,
        hide
    }

};