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
    createVideoPlayer(video);
}

// Get sources for modal videos
let modalVideos = document.querySelectorAll(".subsection-modal-container video");
if(modalVideos) {
    for(let modalVideo of modalVideos) {
        sourceVideo(modalVideo);
        createVideoPlayer(modalVideo);
    }
}

function shelfOnFirstPlay(event) {
    shelfText();
    event.target.removeEventListener("play", shelfOnFirstPlay);
}

function sourceVideo(el) {
    // Check if quality is preset to 480. If yes, source it now
    let currentQuality = window.sessionStorage.getItem("vidQuality");
    if(!currentQuality) {
        currentQuality = "High";
        window.sessionStorage.setItem("vidQuality", currentQuality);
    }
    let qualityButton = document.querySelector(`.video-quality-changer[data-player='${el.getAttribute("id")}'] input#vid${currentQuality}`);
    qualityButton.checked = true;
    if(currentQuality == "Med") {
        sourceVideoSmall(el)
    }

    let doi = el.getAttribute("doi");
    if(!doi) return;
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
                let source = el.querySelector("source");
                if(!source) {
                    source = document.createElement("source");
                    el.appendChild(source);
                }
                source.setAttribute("src", videoUrl);
            }
        });
}

function showModal(el) {
    if(video && !video.paused) video.pause();
    let modalId = el.getAttribute("value");
    // openModal is defined in modal.js
    openModal(modalId);

    // Fix modal canvas size. Would use custom events, but IE does not support the recommended methods.
    let modal = document.getElementById(modalId);
    let videoPlayer = modal.querySelector(".book-section-video-player");
    if(!videoPlayer) return;
    let videoEl = videoPlayer.querySelector("video");
    let playerId = videoEl.getAttribute("id");
    let videoPaintCanvas = videoPlayer.querySelector(`#${playerId}-videoPaintCanvas`);
    let videoScrubCanvas = videoPlayer.querySelector(`#${playerId}-videoScrubCanvas`);

    videoPaintCanvas.setAttribute("width", `${videoEl.offsetHeight * (16/9)}px`);
    videoPaintCanvas.setAttribute("height", `${videoEl.offsetHeight}px`);
    videoScrubCanvas.setAttribute("width", `${videoEl.offsetHeight * (16/9)}px`);
    videoScrubCanvas.setAttribute("height", `${videoEl.offsetHeight}px`);
    
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
    let playerId = el.getAttribute("data-player");
    let videoPlayer = document.querySelector(`video#${playerId}`);
    let paused = videoPlayer.paused;
    let currTime = videoPlayer.currentTime;
    let allVideos = document.querySelectorAll("video");
    
    window.sessionStorage.setItem("vidQuality", vidQuality);
    videoPlayer.setAttribute("preload", "metadata");
    swapVideo(videoPlayer, vidQuality);
    videoPlayer.removeEventListener("play", loadVidSource);
    videoPlayer.load();
    videoPlayer.currentTime = currTime;
    if(!paused) videoPlayer.addEventListener("canplay", playVidWhenReady);

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

    if(vidQuality == "Med") {
        sourceVideoSmall(videoPlayer)
    } else {
        let doi = videoPlayer.getAttribute("doi");
        let source = videoPlayer.querySelector("source");
        if(doi) {
            source.setAttribute("src", window[`video${videoPlayer.getAttribute("id")}`]);
        } else {
            let videoFileName = videoPlayer.getAttribute("data-file");
            source.setAttribute("src", `videos/${videoFileName}`);
        }
    }
    
    // Add event listener to load the video when played
    videoPlayer.addEventListener("play", loadVidSource);
}

function sourceVideoSmall(video) {
    let videoFileName = video.getAttribute("data-file");
    let videoFileNameSmall = `${videoFileName.substring(0, videoFileName.length-4)}_480p.mp4`
    let source = video.querySelector("source");
    if(!source) {
        source = document.createElement("source");
        video.appendChild(source);
    }
    source.setAttribute("src", `videos/${videoFileNameSmall}`);
}

function loadVidSource(event) {
    let videoPlayer = event.target;
    let currTime = videoPlayer.currentTime;
    videoPlayer.removeEventListener("play", loadVidSource);
    videoPlayer.load();
    videoPlayer.currentTime = currTime;
    videoPlayer.addEventListener("canplay", playVidWhenReady);
}

function playVidWhenReady(event) {
    let videoPlayer = event.target;
    videoPlayer.removeEventListener("canplay", playVidWhenReady);
    videoPlayer.play();
}

function createVideoPlayer(videoEl) {
    let playerId = videoEl.getAttribute("id");
    let videoPlayer = videoEl.parentElement;
    let videoControls = videoPlayer.querySelector(".book-section-video-player-controls");
    let playPauseButton = videoControls.querySelector(`#${playerId}-playPauseButton`);
    let videoTimeStatus = videoControls.querySelector(`#${playerId}-videoTimeStatus`);
    let fullScreenButton = videoControls.querySelector(`#${playerId}-fullScreenButton`);
    let seekBar = videoControls.querySelector(`#${playerId}-seekBar`);
    seekBar.bufferPercent = 0;
    let videoPaintCanvas = videoPlayer.querySelector(`#${playerId}-videoPaintCanvas`);
    let videoScrubCanvas = videoPlayer.querySelector(`#${playerId}-videoScrubCanvas`);
    let paintContext = videoPaintCanvas.getContext("2d");
    let scrubContext = videoScrubCanvas.getContext("2d");
    let frameImages = {};
    let frameInterval;
    let videoDuration = 0;

    videoEl.addEventListener("playing", function() {
        frameInterval = setInterval(function(){
            saveFrame();
        }, 1000/15);
    });
    
    videoEl.addEventListener("pause", function() {
        clearInterval(frameInterval);
    });

    videoEl.addEventListener("seeked", async function() {
        // Overide scrub by displaying video and save frame to scrub
        let seekedTime = video.currentTime;
        let roundedSeekedTime = Math.round(seekedTime * 15) / 15
        videoScrubCanvas.style.display = "none";
        await saveFrame();
        scrubContext.drawImage(frameImages[roundedSeekedTime], 0, 0, videoScrubCanvas.width, videoScrubCanvas.height);
    });

    playPauseButton.addEventListener('click', function() {
        if (videoEl.paused || videoEl.ended) videoEl.play();
        else videoEl.pause();
    });

    fullScreenButton.addEventListener("click", function() {
        if(document.fullscreenElement 
            && document.fullscreenElement.querySelector("video") 
            && document.fullscreenElement.querySelector("video") .getAttribute("id") == playerId) {
            video.style["max-height"] = "82vh";
            document.exitFullscreen();
        } else {
            video.style["max-height"] = "initial";
            videoPlayer.requestFullscreen();
        }
    });

    videoEl.addEventListener('play', function() {
        videoPlayer.addEventListener("mouseleave", hidePlayerControls);
        videoPlayer.addEventListener("mouseenter", showPlayerControls);
        togglePlayPause();
    });
    
    videoEl.addEventListener('pause', function() {
        videoControls.style.opacity = 1;
        videoPlayer.removeEventListener("mouseleave", hidePlayerControls);
        videoPlayer.removeEventListener("mouseenter", showPlayerControls);
        togglePlayPause();
    });
    
    videoEl.addEventListener('click', function() {
        playPauseButton.click();
    });

    videoEl.addEventListener("loadedmetadata", function() {
        videoDuration = videoEl.duration;
        videoPaintCanvas.setAttribute("width", `${videoEl.offsetWidth}px`);
        videoPaintCanvas.setAttribute("height", `${videoEl.offsetHeight}px`);
        videoScrubCanvas.setAttribute("width", `${videoEl.offsetWidth}px`);
        videoScrubCanvas.setAttribute("height", `${videoEl.offsetHeight}px`);
        seekBar.step = `${1/15}`;
        let totalMinutes = (videoDuration >= 60) ? Math.floor(videoDuration / 60) : 0;
        let seconds = Math.round(videoDuration) - (totalMinutes * 60);
        let secondsFormatted = (seconds < 10) ? `0${seconds}` : seconds;
        videoTimeStatus.innerHTML = `0:00 / ${totalMinutes}:${secondsFormatted}`;
        updateBufferedTime(videoEl, seekBar);
    });

    videoEl.addEventListener("timeupdate", function() {
        seekBar.value = (videoEl.currentTime / videoDuration) * 100;
        // Update seek bar
        updateSeekBar();
        // Update timestamp
        updateTimeStamp();
    });

    seekBar.addEventListener("mousedown", function() {
        if(!videoEl.paused){
            videoEl.pause();
            seekBar.addEventListener("mouseup", function(){
                videoEl.play();
            }, { once: true });
        }
    });

    seekBar.addEventListener("input", function() {
        let seekBarTime = (parseFloat(seekBar.value) / 100) * videoDuration;

        videoScrubCanvas.style.display = "block";
        let roundedTime = Math.round(seekBarTime * 15) / 15;
        if(roundedTime in frameImages) {
            scrubContext.drawImage(frameImages[roundedTime], 0, 0, videoScrubCanvas.width, videoScrubCanvas.height);
            seekBar.addEventListener("mouseup", function(){
                videoScrubCanvas.style.display = "none";
            }, { once: true });
        }

        videoEl.currentTime = seekBarTime;
        updateSeekBar();
        updateTimeStamp();
    });

    videoEl.addEventListener("progress", function() {
        updateBufferedTime();
    });

    window.addEventListener("resize", resizeCanvases);

    if(videoEl === document.querySelector("#nonTextContent video")) {
        let nonTextSection = document.querySelector("#nonTextContent");
        nonTextSection.addEventListener("transitionend", function(event) {
            if(event.propertyName == "width") resizeCanvases();
        });
    }

    function togglePlayPause() {
        if (videoEl.paused || videoEl.ended) {
            playPauseButton.setAttribute('data-state', 'play');
        }
        else {
            playPauseButton.setAttribute('data-state', 'pause');
        }
    }

    function hidePlayerControls() {
        videoControls.style.opacity = 0;
    }
    
    function showPlayerControls() {
        videoControls.style.opacity = 1;
    }
    
    function updateSeekBar() {
        let percentage = parseFloat(seekBar.value);
        let background = `linear-gradient(90deg, #ffffff 0% ${percentage}%, #bfbfbf ${percentage+0.1}% ${seekBar.bufferPercent+0.1}%, #717171 ${seekBar.bufferPercent+0.1}%)`;
        seekBar.style.background = background;
    }
    
    function updateTimeStamp() {
        let totalTime = videoTimeStatus.innerHTML.split("/")[1].trim();
        let currentTime = (parseFloat(seekBar.value) / 100) * videoDuration;
        let minute = (currentTime >= 60) ? Math.floor(currentTime / 60) : 0;
        let seconds = (minute > 0) ? currentTime - (minute * 60) : currentTime;
        seconds = Math.round(seconds);
        let secondsFormatted = (seconds < 10) ? `0${seconds}` : seconds;
        videoTimeStatus.innerHTML = `${minute}:${secondsFormatted} / ${totalTime}`;
    }
    
    function updateBufferedTime() {
        if (videoDuration > 0) {
            for (var i = 0; i < videoEl.buffered.length; i++) {
                if (videoEl.buffered.start(videoEl.buffered.length - 1 - i) < videoEl.currentTime || videoEl.buffered.start(videoEl.buffered.length - 1 - i) <= 0) {
                    seekBar.bufferPercent = (videoEl.buffered.end(videoEl.buffered.length - 1 - i) / videoDuration) * 100;
                    updateSeekBar(seekBar);
                    break;
                }
            }
        }
    }

    function resizeCanvases() {
        videoPaintCanvas.setAttribute("width", `${videoEl.offsetHeight * (16/9)}px`);
        videoPaintCanvas.setAttribute("height", `${videoEl.offsetHeight}px`);
        videoScrubCanvas.setAttribute("width", `${videoEl.offsetHeight * (16/9)}px`);
        videoScrubCanvas.setAttribute("height", `${videoEl.offsetHeight}px`);
    }

    async function saveFrame() {
        let currentFrameTime = video.currentTime;
        if(Math.round(currentFrameTime * 15) / 15 in frameImages) return;
        paintContext.drawImage(videoEl, 0, 0, videoPaintCanvas.width, videoPaintCanvas.height);
        imageData = paintContext.getImageData(0, 0, videoPaintCanvas.width, videoPaintCanvas.height);
        imageBitmap = await createImageBitmap(imageData);
        frameImages[Math.round(currentFrameTime * 15) / 15] = imageBitmap;
    }
}

function resizeModalScrubCanvasListener() {
    let openModal = document.querySelector(".subsection-modal-container[style='display: flex;']");
    console.log(openModal);
    let modalId = openModal.getAttribute("id");
    resizeModalScrubCanvas(modalId); 
}