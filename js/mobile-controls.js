window.addEventListener("orientationchange", fixDropdownHeight);
if(video) video.removeEventListener("play", shelfOnFirstPlay);

function toggleView(el) {
    // Check current state of screen
    let mobileView = window.sessionStorage.getItem("mobileView");
    // If new state requested, switch states
    if(el.value != mobileView || !mobileView) {
        let textContent = document.querySelector("#textContent");
        let nonTextContent = document.querySelector("#nonTextContent");
        if(el.value == "text") {
            textContent.style.display = "flex";
            nonTextContent.style.display = "none";
        } else if(el.value == "video") {
            textContent.style.display = "none";
            nonTextContent.style.display = "block";
            closeModalMobile();
        }
    }
}

function closeModalMobile(el) {
    let modalOverlay = document.getElementById("modalOverlay");
    modalOverlay.click();
}

function fixDropdownHeight(event) {
    let openLists = document.querySelectorAll(".book-appendix-li-dropdown[showing='true']");
    for(let list of openLists) {
        list.style.height = "0";
    } 
    // Recalculate height for open lists once screen is resized
    window.addEventListener("resize", function(){
        for(let list of openLists) {
            setTimeout(function(){
                list.style.height = list.scrollHeight + "px";
            }, 300);
        } 
    }, { once: true });
}