let Modal = function(root) {

    let exitBtn = root.querySelector(".modal__exit-btn");
    let textContainer = root.querySelector(".modal__text-container");

    let show = function() {
        root.classList.remove("modal--hidden");
        textContainer.setAttribute("tabindex", 0);
    };

    let hide = function() {
        root.classList.add("modal--hidden");
        textContainer.setAttribute("tabindex", -1);
    };

    return {
        root,
        exitBtn,
        show,
        hide
    }

};