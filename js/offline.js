// Check for an internet connection before displaying feedback form
let feedbackModal = document.querySelector("#feedbackModal");
if(feedbackModal) {
    if(!navigator.onLine) {
        let feedbackIframe = document.querySelector("#feedbackModal iframe");
        let offlineMessage = document.querySelector(".feedback-offline-message");
        feedbackIframe.style.display = "none";
        offlineMessage.style.display = "block";
    }
}