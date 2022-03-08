let Modal = function(root, onOpenCallback = function(){},  onCloseCallback = function(){}) {

    let modalContainer = root.querySelector(".modal__modal-container");
    let exitBtn = root.querySelector(".modal__exit-btn");
    let contentContainer = root.querySelector(".modal__content-container");

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

    root.addEventListener("click", onRootClick);
    exitBtn.addEventListener("click", hide);

    return {
        root,
        show,
        hide
    }

};