let MobileControls = function(root) {
    
    let tabBtns = root.querySelectorAll(".mobile-controls__btn");

    let handleTabSelect = function(event) {
        let tabBtn = event.currentTarget;
        if(tabBtn.classList.contains("mobile-controls__btn--selected")) return;
        let currSelected = root.querySelector(".mobile-controls__btn--selected");
        currSelected.classList.remove("mobile-controls__btn--selected");
        tabBtn.classList.add("mobile-controls__btn--selected");
    };

    for(let tabBtn of tabBtns) tabBtn.addEventListener("click", handleTabSelect);

    return {
        root,
        tabBtns
    }

};