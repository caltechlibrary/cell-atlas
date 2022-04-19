let MobileControls = function(root, onControlClickCallback) {

    let controlBtns = root.querySelectorAll(".mobile-controls__btn");

    let handleControlsClick = function(event) {
        let controlBtn = event.currentTarget;
        let currSelected = root.querySelector(".mobile-controls__btn--selected");

        if(controlBtn == currSelected) return;
        currSelected.classList.remove("mobile-controls__btn--selected");
        controlBtn.classList.add("mobile-controls__btn--selected");
        onControlClickCallback(controlBtn.value);
    };

    for(let controlBtn of controlBtns) controlBtn.addEventListener("click", handleControlsClick);

};