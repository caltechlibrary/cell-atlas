let Modal = function(root, onOpenCallback = function(){},  onCloseCallback = function(){}) {

    let modalContainer = root.querySelector(".modal__modal-container");
    let exitBtn = root.querySelector(".modal__exit-btn");
    let focusableEls = root.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    let lastFocused;

    let show = function() {
        lastFocused = document.activeElement;
        let firstFocusable = focusableEls[(window.innerWidth < 900) ? 0 : 1];
        
        root.classList.remove("modal--hidden");
        firstFocusable.focus();
        document.addEventListener("keydown", onOpenModalKeyDown);

        onOpenCallback();
    };

    let onOpenModalKeyDown = function(event) {
        if(event.key == "Escape") hide();
    };

    let hide = function() {
        onCloseCallback();

        root.classList.add("modal--hidden");
        document.removeEventListener("keydown", onOpenModalKeyDown);
        lastFocused.focus();
    };

    let onRootClick = function(event) {
        if(!modalContainer.contains(event.target)) hide();
    };

    let onRootKeydown = function(event) {
        if(event.key != "Tab") return;
        if(event.target == focusableEls[focusableEls.length - 1] && !event.shiftKey) {
            focusableEls[window.innerWidth < 900 ? 0 : 1].focus();
            event.preventDefault();
        } else if(event.target == focusableEls[window.innerWidth < 900 ? 0 : 1] && event.shiftKey) {
            focusableEls[focusableEls.length - 1].focus();
            event.preventDefault();
        }
    };

    root.addEventListener("click", onRootClick);
    root.addEventListener("keydown", onRootKeydown);
    exitBtn.addEventListener("click", hide);

    return {
        root,
        show,
        hide
    }

};