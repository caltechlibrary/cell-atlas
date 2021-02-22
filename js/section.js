// Script still a WIP. Script was written to just to get the job done for the static site prototype. 
// Will be improving this script where needed as time goes on.

// Check url to see if modal anchor is included. If so, trigger button press
let secUrl = window.location.href;
let secSplit = secUrl.split("#");
if(secSplit.length > 1) {
    let buttons = [];
    let anchor = secSplit[1];
    let learnMore = document.querySelector(".book-section-learn-more");
    if(learnMore) buttons = learnMore.getElementsByTagName("button");
    for(let button of buttons){
        if (button.value == anchor) {
            button.click();
        }
    }
}

// Check if there is "Learn More" content. If not, add margin on bottom of text seciton on desktop only
let sectionText = document.querySelector(".book-section-text");
if(sectionText) {
    let learnMore = sectionText.querySelector(".book-section-learn-more");
    if(!learnMore && window.innerWidth > 800) {
        sectionText.style["padding-bottom"] = "1em";
    }
}

// Add event listener to video player to shelf text on first play
let video = document.querySelector("#nonTextContent video");
if(video) {
    video.addEventListener("play", shelfOnFirstPlay);
    // Source the video using the DOI only if a local path is not being used
    if(!video.querySelector("source")) sourceVideo(video);
}

// Get sources for modal videos
let modalVideos = document.querySelectorAll(".subsection-modal-container video");
if(modalVideos) {
    for(let modalVideo of modalVideos) {
        sourceVideo(modalVideo);
    }
}

function shelfOnFirstPlay(event) {
    shelfText();
    event.target.removeEventListener("play", shelfOnFirstPlay);
}

function sourceVideo(el) {
    // Check if quality is preset to 480. If yes, source it now
    let currentQuality = window.sessionStorage.getItem("vidQuality");
    if(currentQuality == "Med") {
        let qualityButton = document.querySelector(`.video-quality-changer[data-player='${el.getAttribute("id")}'] input#vidMed`);
        let videoFileName = el.getAttribute("data-file");
        let videoFileNameSmall = `${videoFileName.substring(0, videoFileName.length-4)}_480p.mp4`
        let source = el.querySelector("source");
        if(!source) {
            source = document.createElement("source");
            el.appendChild(source);
        }
        source.setAttribute("src", `videos/${videoFileNameSmall}`);
        qualityButton.checked = true;
    }

    let doi = el.getAttribute("doi");
    if(!doi) {
        if(currentQuality == "High") {
            let qualityButton = document.querySelector(`.video-quality-changer[data-player='${el.getAttribute("id")}'] input#vidHigh`);
            qualityButton.checked = true;
        }
        return;
    }
    let doiUrl = 'https://api.datacite.org/dois/' + doi + '/media';
    fetch(doiUrl)
        .then(function(res) {
            return res.json();
        })
        .then(function(data){
            let videoUrl = data.data[0].attributes.url;
            // Create global var for url to access later
            window[`video${el.getAttribute("id")}`] = videoUrl;
            if(currentQuality == "High" || !currentQuality) {
                let qualityButton = document.querySelector(`.video-quality-changer[data-player='${el.getAttribute("id")}'] input#vidHigh`);
                let source = el.querySelector("source");
                if(!source) {
                    source = document.createElement("source");
                    el.appendChild(source);
                }
                source.setAttribute("src", videoUrl);
                qualityButton.checked = true;
            }
        });
}

function showModal(el) {
    let modalId = el.getAttribute("value");
    // openModal is defined in modal.js
    openModal(modalId);
}

function shelfText(el) {
    let nonTextSection = document.getElementById("nonTextContent");
    let textSection = document.getElementById("textContent");
    let unshelfButton = document.getElementById("unshelfButton");

    // Make content of text section untabable
    let textSectionChildren = textSection.getElementsByTagName("*");
    for(child of textSectionChildren) {
        if(child.tabIndex >= 0) child.setAttribute("tabindex", "-99");
    }
    
    // Push text section offscreen
    textSection.style.transform = "translate(100%, -50%)";

    // Bring non text section center screen and enlarge
    nonTextSection.style.right = "0";
    nonTextSection.style.width = "100%";


    // Bring unshelf button on screen once text is transitioned off screen
    setTimeout(function(){
        // Calculate top margin value for unshelf button
        let pageContainer = document.querySelector(".book-page-content");
        let heightFromTop = (pageContainer.offsetHeight - textSection.offsetHeight) / 2;
        unshelfButton.style.top = `${heightFromTop}px`;
        unshelfButton.style.transform =  "translate(-100%, 0px)";
        unshelfButton.setAttribute("tabindex", "0");;
    }, 1000);
}

function openText(el) {
    let nonTextSection = document.getElementById("nonTextContent");
    let textSection = document.getElementById("textContent");
    let unshelfButton = document.getElementById("unshelfButton");

    // Make unshelf button untabable
    unshelfButton.setAttribute("tabindex", "-1");

    // Push open text button offscreen
    unshelfButton.style.transform =  "translate(0px, 0px)";

    // Bring non text section back to the left and make smaller
    nonTextSection.style.right = "62%";
    nonTextSection.style.width = "62%";


    // Bring unshelf button on screen once text is transitioned off screen
    setTimeout(function(){
        textSection.style.transform = "translate(0, -50%)";
        let textSectionChildren = textSection.getElementsByTagName("*");
        for(child of textSectionChildren) {
            if(child.tabIndex == -99) child.setAttribute("tabindex", "0");
        }
    }, 1000);
}

function changeQuality(el) {
    let vidQuality = (el.value == "480") ? "Med" : "High";
    let playerId = el.parentElement.getAttribute("data-player");
    let videoPlayer = document.querySelector(`video#${playerId}`);
    let allVideos = document.querySelectorAll("video");
    window.sessionStorage.setItem("vidQuality", vidQuality);
    videoPlayer.setAttribute("preload", "metadata");
    swapVideo(videoPlayer, vidQuality);

    // Change the quality for the other videos as well
    for(let video of allVideos) {
        if(video.getAttribute("id") != playerId) {
            video.setAttribute("preload", "none");
            let qualityButton = document.querySelector(`.video-quality-changer[data-player='${video.getAttribute("id")}'] input#vid${vidQuality}`);
            qualityButton.checked = true;
            swapVideo(video, vidQuality);
        }
    }
}

function swapVideo(videoPlayer, vidQuality) {
    let paused = videoPlayer.paused;
    if(!paused) videoPlayer.pause();
    let source = videoPlayer.querySelector("source");
    let currentTime = videoPlayer.currentTime;

    if(vidQuality == "Med") {
        let videoFileName = videoPlayer.getAttribute("data-file");
        let videoFileNameSmall = `${videoFileName.substring(0, videoFileName.length-4)}_480p.mp4`;
        source.setAttribute("src", `videos/${videoFileNameSmall}`);
    } else {
        let doi = videoPlayer.getAttribute("doi");
        if(doi) {
            source.setAttribute("src", window[`video${videoPlayer.getAttribute("id")}`]);
        } else {
            let videoFileName = videoPlayer.getAttribute("data-file");
            source.setAttribute("src", `videos/${videoFileName}`);
        }
    }
    
    videoPlayer.load();
    videoPlayer.currentTime = currentTime;
    if(!paused) videoPlayer.play();
}