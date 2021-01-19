function toggleView(el) {
    // Check current state of screen
    let mobileView = window.sessionStorage.getItem("mobileView");
    // If new state requested, switch states
    if(el.value != mobileView || !mobileView) {
        let videoContainer = document.getElementById("nonTextContent");
        let textContainer = document.getElementById("textContent");
        if(el.value == "text") {
            videoContainer.style.display = "none";
            textContainer.style.display = "flex";
        } else if(el.value == "video") {
            videoContainer.style.display = "flex";
            textContainer.style.display = "none";
        }
    }
}