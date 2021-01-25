window.addEventListener("orientationchange", fixDropdownHeight);
if(video) video.removeEventListener("play", shelfOnFirstPlay);

function toggleView(el) {
    // Check current state of screen
    let mobileView = window.sessionStorage.getItem("mobileView");
    // If new state requested, switch states
    if(el.value != mobileView || !mobileView) {
        if(el.value == "text") {
            renderText();
        } else if(el.value == "video") {
            renderVideo();
            closeModalMobile();
        }
    }
}

function renderText() {
    console.log("Rendering text");
}

function renderVideo() {
    console.log("Rendering video");
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