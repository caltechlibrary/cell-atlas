let MobileControls = function(root) {

    let handleControlsClick = function(event) {
        let tabBtn = event.target.closest(".mobile-controls__btn");
        if(!tabBtn || !root.contains(tabBtn) || tabBtn.classList.contains("mobile-controls__btn--selected")) return;
        let currSelected = root.querySelector(".mobile-controls__btn--selected");
        currSelected.classList.remove("mobile-controls__btn--selected");
        tabBtn.classList.add("mobile-controls__btn--selected");
    };

    root.addEventListener("click", handleControlsClick);

    return {
        root
    }

};