// Script still a WIP. Script was written to just to get the job done for the static site prototype. 
// Will be improving this script where needed as time goes on.

// Check if there is "Learn More" content. If not, add margin on bottom of text seciton on desktop only
let sectionText = document.querySelector(".book-section-text");
if(sectionText) {
    let learnMore = sectionText.querySelector(".book-section-learn-more");
    if(!learnMore && window.innerWidth > 900) {
        sectionText.style["padding-bottom"] = "1em";
    }
}

let sectionTextMaterial = document.querySelector(".book-section-text-material");
if(sectionTextMaterial) addTypeFocusToggle(sectionTextMaterial);

let comparisonVideoButtons = document.querySelectorAll(".book-section-comparison-button-container button");
for(let comparisonVideoButton of comparisonVideoButtons) {
    addTypeFocusToggle(comparisonVideoButton);
}

// Add event listener to video player to shelf text on first play
let video = document.querySelector("#nonTextContent video");
if(video) {
    video.addEventListener("play", shelfOnFirstPlay);
    // Source the video using the DOI only if a local path is not being used
    createVideoPlayer(video);
}

// Get sources for modal videos
let modalVideos = document.querySelectorAll(".subsection-modal-container video");
if(modalVideos) {
    for(let modalVideo of modalVideos) {
        createVideoPlayer(modalVideo);
    }
}

document.addEventListener("keydown", function(event) {
    let focusedElement = document.activeElement;
    if(!focusedElement || 
        focusedElement.tagName == "INPUT") {
            return;
        }
    if(event.key === "ArrowLeft"){
        let prevLink = document.querySelector("a[data-nav='prev']");
        if(prevLink) prevLink.click();
    } else if (event.key === "ArrowRight") {
        let nextLink = document.querySelector("a[data-nav='next']");
        if(nextLink) nextLink.click();
    }
});

let comparissonContainers = document.querySelectorAll(".book-section-comparison-slider-container");
for(let comparissonContainer of comparissonContainers) {
    initializeCompSlider(comparissonContainer);
}

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

function shelfOnFirstPlay(event) {
    shelfText();
    event.target.removeEventListener("play", shelfOnFirstPlay);
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
        unshelfButton.setAttribute("tabindex", "0");
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

function expandQualityChanger(el) {
    let widgetContainer = el.parentElement;
    let changerContainer = widgetContainer.querySelector(".video-quality-changer");
    let state = widgetContainer.getAttribute("data-state");

    if(state == "expanded") {
        collapseChanger();
    } else {
        changerContainer.removeEventListener("transitionend", collapseState);
        widgetContainer.setAttribute("data-state", "expanded");
        changerContainer.style.padding = "3px 0 1.5em 3px";
        changerContainer.style.height = "4.5em";
        window.addEventListener("click", closeChangerClick);
    }
}

function collapseChanger() {
    let widgetContainer = document.querySelector(".video-quality-player-control[data-state='expanded']");
    let changerContainer = widgetContainer.querySelector(".video-quality-changer");
    changerContainer.style.height = 0;
    changerContainer.style.padding = 0;
    window.removeEventListener("click", closeChangerClick);
    if(document.querySelector("body").classList.contains("preload")) {
        widgetContainer.setAttribute("data-state", "collapsed");
    } else {
        changerContainer.addEventListener("transitionend", collapseState, { once: true });
    }
}

function collapseState(event) {
    let widgetContainer = event.target.parentElement;
    widgetContainer.setAttribute("data-state", "collapsed");
}

function closeChangerClick(event) {
    let widgetContainer = document.querySelector(".video-quality-player-control[data-state='expanded']");
    if(widgetContainer && !widgetContainer.contains(event.target)) {
        collapseChanger();
    }
}

function createVideoPlayer(videoEl) {
    let playerId = videoEl.getAttribute("id");
    let doi = videoEl.getAttribute("doi");
    let highSrc;
    let medSrc;
    let videoPlayer = document.querySelector(`.book-section-video-player[data-player='${playerId}']`);
    let videoControls = videoPlayer.querySelector(".book-section-video-player-controls");
    let playPauseButton = videoControls.querySelector(`#${playerId}-playPauseButton`);
    let videoTimeStatus = videoControls.querySelector(`#${playerId}-videoTimeStatus`);
    let qualityChangerDesktop = videoControls.querySelector(`#${playerId}-qualityChanger`);
    let qualityText = qualityChangerDesktop.querySelector("button span");
    let playerQualityInputs = document.querySelectorAll(`.video-quality-changer-entry input[data-player='${playerId}']`);
    let allPageQualityInputs = document.querySelectorAll(".video-quality-changer-entry input");
    let fullScreenButton = videoControls.querySelector(`#${playerId}-fullScreenButton`);
    let seekBar = videoControls.querySelector(`#${playerId}-seekBar`);
    let videoPaintCanvas = videoPlayer.querySelector(`#${playerId}-videoPaintCanvas`);
    let videoScrubCanvas = videoPlayer.querySelector(`#${playerId}-videoScrubCanvas`);
    let paintContext = videoPaintCanvas.getContext("2d");
    let scrubContext = videoScrubCanvas.getContext("2d");
    seekBar.bufferPercent = 0;
    let videoDuration;
    let fps = 15;
    let frameImages;
    let frameInterval;

    addTypeFocusToggle(playPauseButton);
    addTypeFocusToggle(fullScreenButton);
    addTypeFocusToggle(seekBar);

    window.addEventListener("resize", resizeCanvases);
    videoEl.addEventListener("loadedmetadata", initializePlayer);
    videoEl.addEventListener("canplay", enablePlayer, { once: true });
    videoEl.addEventListener("play", onVidPlay);
    videoEl.addEventListener("pause", onVidPause);
    videoEl.addEventListener("timeupdate", handleTimeUpdate);
    videoEl.addEventListener("progress", updateBufferedTime);
    if(!OFFLINE && window.createImageBitmap) {
        videoEl.addEventListener("playing", initializeFrameInterval);
        videoEl.addEventListener("seeked", onSeeked);
        videoEl.addEventListener("ended", clearFrameInterval);
        videoEl.addEventListener("waiting", clearFrameInterval);
    }
    if(videoEl === document.querySelector("#nonTextContent video")) {
        let showVidBtn = document.querySelector(`#nonTextContent button[data-player='${playerId}']`);
        let nonTextSection = document.querySelector("#nonTextContent");
        
        nonTextSection.addEventListener("transitionend", resizeCanvases);
        if(showVidBtn) showVidBtn.addEventListener("click", resizeCanvases);
    }
    playPauseButton.addEventListener('click', togglePlayPause);
    for(let qualityInput of allPageQualityInputs) {
        qualityInput.addEventListener("change", loadQuality);
    }
    fullScreenButton.addEventListener("click", toggleFullscreen);
    seekBar.addEventListener("input", handleSeekInput);
    seekBar.addEventListener("mousedown", pauseOnSeekControl);
    seekBar.addEventListener("keydown", pauseOnSeekControl);
    seekBar.addEventListener("mouseup", hideScrubCanvas);
    seekBar.addEventListener("keyup", hideScrubCanvas); 

    if(!OFFLINE) {
        let currQuality = window.sessionStorage.getItem("vidQuality");
        let qualityValue = (currQuality == "Med") ? "480" : "1080";
        let dataFile = videoEl.getAttribute("data-file");
        let dataFileMed = `${dataFile.substring(0, dataFile.length-4)}_480p.mp4`;
        let source = document.createElement("source");

        videoEl.appendChild(source);
        medSrc = `videos/${dataFileMed}`;
        if(window.location.origin == "https://caltechlibrary.github.io" || window.location.origin == "http://localhost:8000") {
            medSrc = "https://www.cellstructureatlas.org/" + medSrc;
        }

        if(currQuality == "Med") {
            source.setAttribute("src", medSrc);
            videoEl.load();
        } else if(!doi) {
            source.setAttribute("src", highSrc);
            videoEl.load();
        }

        if(doi) {
            let doiUrl = 'https://api.datacite.org/dois/' + doi + '/media';
            fetch(doiUrl)
                .then(function(res) {
                    return res.json();
                })
                .then(function(data){
                    highSrc = data.data[0].attributes.url;
                    if(currQuality == "High" || !currQuality) {
                        source.setAttribute("src", highSrc);
                        videoEl.load();
                    }
                });
        } else {
            highSrc = `videos/${dataFile}`;
            if(window.location.origin == "https://caltechlibrary.github.io" || window.location.origin == "http://localhost:8000") {
                highSrc = "https://www.cellstructureatlas.org/" + highSrc;
            }
            if(currQuality == "High" || !currQuality) {
                source.setAttribute("src", highSrc);
                videoEl.load();
            }
        }

        updateQualityChanger(qualityValue);
    }

    function resizeCanvases() {
        videoPaintCanvas.setAttribute("width", `${videoEl.offsetHeight * (16/9)}px`);
        videoPaintCanvas.setAttribute("height", `${videoEl.offsetHeight}px`);
        videoScrubCanvas.setAttribute("width", `${videoEl.offsetHeight * (16/9)}px`);
        videoScrubCanvas.setAttribute("height", `${videoEl.offsetHeight}px`);
    }

    function initializePlayer() {
        clearFrameInterval();
        resizeCanvases();
        updateBufferedTime(videoEl, seekBar);
        frameImages = {};
        if(!videoDuration) {
            videoDuration = videoEl.duration;
            seekBar.step = `${1/fps}`;
            let totalMinutes = (videoDuration >= 60) ? Math.floor(videoDuration / 60) : 0;
            let seconds = Math.round(videoDuration) - (totalMinutes * 60);
            let secondsFormatted = (seconds < 10) ? `0${seconds}` : seconds;
            videoTimeStatus.innerHTML = `0:00 / ${totalMinutes}:${secondsFormatted}`;
        }
    }

    function enablePlayer() {
        playPauseButton.removeAttribute("disabled");
        fullScreenButton.removeAttribute("disabled");
        seekBar.removeAttribute("disabled");
        videoEl.addEventListener('click', function() {
            playPauseButton.click();
        });
    }

    function onVidPlay() {
        videoPlayer.addEventListener("mouseleave", hidePlayerControls);
        videoPlayer.addEventListener("mouseenter", showPlayerControls);
        togglePlayState();
    }

    function onVidPause() {
        clearFrameInterval();
        videoControls.style.opacity = 1;
        videoPlayer.removeEventListener("mouseleave", hidePlayerControls);
        videoPlayer.removeEventListener("mouseenter", showPlayerControls);
        togglePlayState();
    }

    function hidePlayerControls() {
        videoControls.style.opacity = 0;
    }
    
    function showPlayerControls() {
        videoControls.style.opacity = 1;
    }

    function togglePlayState() {
        if (videoEl.paused || videoEl.ended) {
            playPauseButton.setAttribute('data-state', 'play');
        }
        else {
            playPauseButton.setAttribute('data-state', 'pause');
        }
    }

    function handleTimeUpdate() {
        if(videoEl.readyState > 0) {
            seekBar.value = (videoEl.currentTime / videoDuration) * 100;
            updateSeekBar();
            updateTimeStamp();
        }
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

    function initializeFrameInterval() {
        frameInterval = setInterval(function(){
            saveFrame();
        }, 1000/fps);
    }

    async function onSeeked() {
        // Overide scrub by displaying video and save frame to scrub
        let seekedTime = videoEl.currentTime;
        let roundedSeekedTime = Math.round(seekedTime * fps) / fps;
        // Check if frame does not exist already
        if(roundedSeekedTime in frameImages) return;
        videoScrubCanvas.style.display = "none";
        await saveFrame();
        scrubContext.drawImage(frameImages[roundedSeekedTime], 0, 0, videoScrubCanvas.width, videoScrubCanvas.height);
    }

    async function saveFrame() {
        let currentFrameTime = videoEl.currentTime;
        if(Math.round(currentFrameTime * fps) / fps in frameImages) return;
        paintContext.drawImage(videoEl, 0, 0, videoPaintCanvas.width, videoPaintCanvas.height);
        imageData = paintContext.getImageData(0, 0, videoPaintCanvas.width, videoPaintCanvas.height);
        imageBitmap = await createImageBitmap(imageData);
        frameImages[Math.round(currentFrameTime * fps) / fps] = imageBitmap;
    }

    function clearFrameInterval() {
        clearInterval(frameInterval);
    }

    function togglePlayPause() {
        if (videoEl.paused || videoEl.ended) {
            videoEl.play();
        } else {
            videoEl.pause();
        }
    }

    function loadQuality(event) {
        let qualityInput = event.currentTarget;
        let vidQuality = (qualityInput.value == "480") ? "Med" : "High";
        let source = videoEl.querySelector("source");
        let currentTime = videoEl.currentTime;
        let paused = videoEl.paused;

        window.sessionStorage.setItem("vidQuality", vidQuality);
        videoEl.setAttribute("preload", "none");
        for(let playerQualityInput of playerQualityInputs) {
            if(playerQualityInput == event.target) {
                videoEl.setAttribute("preload", "metadata");
            }
        }
        updateQualityChanger(qualityInput.value);

        if(vidQuality == "High") {
            source.setAttribute("src", highSrc);
        } else {
            source.setAttribute("src", medSrc);
        }

        videoEl.load();
        videoEl.addEventListener("canplay", function() {
            videoEl.currentTime = currentTime;
            if(!paused) videoEl.play();
        }, { once: true });
    }

    function updateQualityChanger(quality) {
        qualityText.innerHTML = `${quality}p`;
        let qualityInputs = document.querySelectorAll(`.video-quality-changer-entry input[data-player='${playerId}'][value='${quality}']`);
        for(qualityInput of qualityInputs) {
            qualityInput.checked = true;
        }
    }

    function toggleFullscreen() {
        if(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            window.addEventListener("touchstart", detectSwipe);
            videoPlayer.classList.remove("book-section-video-player-fullscreen");
            if (document.exitFullscreen) {
                document.exitFullscreen();
                document.removeEventListener("fullscreenchange", handleFullscreenChange);
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
                document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
                document.removeEventListener("msfullscreenchange", handleFullscreenChange);
            }
        } else {
            if (videoPlayer.requestFullscreen) {
                videoPlayer.requestFullscreen();
                document.addEventListener("fullscreenchange", handleFullscreenChange);
            } else if (videoPlayer.webkitRequestFullscreen) { /* Safari */
                videoPlayer.webkitRequestFullscreen();
                document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
            } else if (videoPlayer.msRequestFullscreen) { /* IE11 */
                videoPlayer.msRequestFullscreen();
                document.addEventListener("msfullscreenchange", handleFullscreenChange);
            }
        }
    }

    function handleFullscreenChange() {
        if(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            window.removeEventListener("touchstart", detectSwipe);
            videoPlayer.classList.add("book-section-video-player-fullscreen");
        } else {
            window.addEventListener("touchstart", detectSwipe);
            videoPlayer.classList.remove("book-section-video-player-fullscreen");
        }
    }

    function handleSeekInput() {
        let seekBarTime = (parseFloat(seekBar.value) / 100) * videoDuration;

        if(!OFFLINE && window.createImageBitmap) {
            videoScrubCanvas.style.display = "block";
            let roundedTime = Math.round(seekBarTime * fps) / fps;
            if(roundedTime in frameImages) {
                scrubContext.drawImage(frameImages[roundedTime], 0, 0, videoScrubCanvas.width, videoScrubCanvas.height);
            }   
        }

        videoEl.currentTime = seekBarTime;
        updateSeekBar();
        updateTimeStamp();
    }

    function pauseOnSeekControl() {
        if(!videoEl.paused) {
            videoEl.pause();
            seekBar.addEventListener("keyup", autoResumeVid);
            seekBar.addEventListener("mouseup", autoResumeVid);
        }
    }

    function autoResumeVid(event) {
        event.target.removeEventListener("keyup", autoResumeVid);
        event.target.removeEventListener("mouseup", autoResumeVid);
        videoEl.play();
    }

    function hideScrubCanvas() {
        videoScrubCanvas.style.display = "none";
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
}

function toggleImageSlider(el) {
    let selectedValue = el.getAttribute("value");
    let videoPlayerId = el.getAttribute("data-player");
    let videoQualitySwitcherMobile = document.querySelector(`.video-quality-changer-mobile[data-player='${videoPlayerId}']`);
    let videoContainer = document.querySelector(`.book-section-video-player[data-player='${videoPlayerId}']`);
    let videoElement = videoContainer.querySelector("video");
    let comparissonFullBackground = document.querySelector(`#fullBackground-${videoPlayerId}`);
    let currSelectedButton = el.parentElement.querySelector("button[data-state='selected']");

    if(!videoElement.paused) videoElement.pause();

    if(selectedValue == "image") {
        comparissonFullBackground.style.display = "block";
        videoContainer.style.display = "none";
        if(window.innerWidth <= 900 && videoQualitySwitcherMobile) videoQualitySwitcherMobile.style.display = "none";
    } else {
        comparissonFullBackground.style.display = "none";
        videoContainer.style.display = "flex";
        if(window.innerWidth <= 900 && videoQualitySwitcherMobile) videoQualitySwitcherMobile.style.display = "flex";
    }
    currSelectedButton.setAttribute("data-state", "");
    el.setAttribute("data-state", "selected");
}

function initializeCompSlider(compSliderContainer) {
    let playerId = compSliderContainer.getAttribute("data-player");
    let afterImage = compSliderContainer.querySelector(".book-section-comparison-after");
    let beforeImage = compSliderContainer.querySelector(".book-section-comparison-before");
    let loadFailedImg = compSliderContainer.querySelector(".book-section-comparison-load-failed");
    let comparissonSlider = compSliderContainer.querySelector(".book-section-comparison-slider");
    let compInputRange = compSliderContainer.querySelector(".book-section-comparison-range");
    let minimizeBtnMobile = compSliderContainer.querySelector(`#compMinimizeMobile-${playerId}`);
    let fullBackground = compSliderContainer.parentElement;
    let enlargeBtn = fullBackground.querySelector(`#compEnlarge-${playerId}`);
    let minimizeBtnDesk = fullBackground.querySelector(`#compMinimizeDesktop-${playerId}`);
    let imgFileName = compSliderContainer.getAttribute("data-img-name");
    let inModal = !document.querySelector("#nonTextContent").contains(fullBackground);

    // Source the images and listen to errors that may arise
    if(OFFLINE) {
        beforeImage.setAttribute("src", `img/stillimages/${imgFileName}_before.jpg`);
        afterImage.style["background-image"] = `url(img/stillimages/${imgFileName}_after.jpg)`;
    } else {
        beforeImage.addEventListener("error", handleCompLoadError);
        beforeImage.setAttribute("src", `https://www.cellstructureatlas.org/img/stillimages/${imgFileName}_before.jpg`);
        
        let testImgEl = document.createElement("img");
        testImgEl.addEventListener("load", function() {
            testImgEl.remove();
            afterImage.style["background-image"] = `url(https://www.cellstructureatlas.org/img/stillimages/${imgFileName}_after.jpg)`;
        });
        testImgEl.addEventListener("error", handleCompLoadError);
        testImgEl.setAttribute("src", `https://www.cellstructureatlas.org/img/stillimages/${imgFileName}_after.jpg`);
    }

    comparissonSlider.addEventListener("mousedown", slideReady);
    comparissonSlider.addEventListener("touchstart", slideReady);
    compInputRange.addEventListener("input", inputToSlide);
    enlargeBtn.addEventListener("click", enlargeSlider);
    minimizeBtnMobile.addEventListener("click", minimizeSlider);
    minimizeBtnDesk.addEventListener("click", minimizeSlider);

    if(!inModal && window.innerWidth >= 900) {
        let shelfButton = document.getElementById("shelfButton");
        let unshelfButton = document.getElementById("unshelfButton");
        let vidPlayBtn = document.querySelector(`#${playerId}-playPauseButton`);

        updateMainCompMaxHeight();
        window.addEventListener("resize", updateMainCompMaxHeight);
        shelfButton.addEventListener("click", respondToTextShelving);
        unshelfButton.addEventListener("click", respondToTextShelving);
        vidPlayBtn.addEventListener("click", respondToTextShelving, { once: true });
    }

    // Functions to handle the before/after sliding

    function slideReady(e) {
        e.preventDefault();
        window.addEventListener("mousemove", slideMove);
        window.addEventListener("touchmove", slideMove);
        window.addEventListener("mouseup", slideFinish);
        window.addEventListener("touchend", slideFinish);
    }
    
    function slideFinish() {
        posToPercent();
        window.removeEventListener("mousemove", slideMove);
        window.removeEventListener("touchmove", slideMove);
        window.removeEventListener("mouseup", slideFinish);
        window.removeEventListener("touchend", slideFinish);
    }

    function slideMove(event) {
        let position = getCursorPos(event);
        if (position < 0) position = 0;
        if (position > beforeImage.offsetWidth) position = beforeImage.offsetWidth;
        slide(position);
    }

    function getCursorPos(event) {
        event = event || window.event;
        let boundingRect = compSliderContainer.getBoundingClientRect();
        pageX = ("pageX" in event) ? event.pageX : event.changedTouches[0].pageX;
        let positionX = pageX - boundingRect.left;
        positionX = positionX - window.pageXOffset;
        return positionX;
    }

    function slide(position) {
        let marginLeft = window.getComputedStyle(beforeImage)["margin-left"];
        comparissonSlider.style.left = `${position}px`;
        compInputRange.value = (position / beforeImage.offsetWidth) * 100;
        marginLeft = parseFloat(marginLeft.substring(0, marginLeft.length - 2));
        afterImage.style.width = `${position - marginLeft}px`;
    }

    function inputToSlide() {
        afterImage.style.width = `${compInputRange.value}%`;
        comparissonSlider.style.left = `${compInputRange.value}%`;
    }

    function posToPercent() {
        let percentage = (afterImage.getBoundingClientRect().width / beforeImage.offsetWidth) * 100;
        comparissonSlider.style.left = `${percentage}%`;
        compInputRange.value = Math.floor(percentage);
        let marginLeft = window.getComputedStyle(beforeImage)["margin-left"];
        marginLeft = parseFloat(marginLeft.substring(0, marginLeft.length - 2));
        afterImage.style.width = `${percentage - ((marginLeft / beforeImage.offsetWidth) * 100)}%`;
    }

    // Functions to handle the the enlarging/minimizing

    function enlargeSlider() {
        window.removeEventListener("touchstart", detectSwipe);
        enlargeBtn.style.display = "none"; 
        fullBackground.setAttribute("data-state", "fullscreen");
        if(window.innerWidth > 900) {
            enlargeDesktop();
        } else {
            enlargeMobile();
        }
    }

    function enlargeDesktop() {
        minimizeBtnDesk.style.display = "flex";
        if(inModal) {
            fullBackground.classList.add("book-section-comparison-slider-enlarged");
            positionEnlargedModalSlider();
            window.addEventListener("resize", positionEnlargedModalSlider);
        } else {
            let unshelfBtn = document.querySelector("#unshelfButton");
            minimizeBtnDesk.disabled = true;
            unshelfBtn.addEventListener("transitionend", function() {
                minimizeBtnDesk.disabled = false;
            }, { once: true });
            shelfText();
        }
    }

    function enlargeMobile() {
        minimizeBtnMobile.style.display = "flex";
        if(fullBackground.requestFullscreen) {
            fullBackground.requestFullscreen();
        } else {
            let nonTextContent = document.querySelector("#nonTextContent");
            nonTextContent.style["z-index"] = 100;
            beforeImage.classList.add("book-section-comparison-fullscreen-polyfill");
            compSliderContainer.classList.add("book-section-comparison-fullscreen-polyfill");
            resizePolyFullscreen();
            window.addEventListener("resize", resizePolyFullscreen);
            if(inModal) {
                let modalContainer = document.querySelector(`.subsection-modal-container[data-player='${playerId}']`);
                let textContent = document.querySelector("#textContent");
                modalContainer.classList.add("subsection-modal-container-slider-fullscreen");
                textContent.style.display = "none";
            }
        }
    }

    function minimizeSlider() {
        window.addEventListener("touchstart", detectSwipe);
        minimizeBtnMobile.style.display = "none"; 
        minimizeBtnDesk.style.display = "none";
        enlargeBtn.style.display = "flex";
        fullBackground.setAttribute("data-state", "initial");
        if(window.innerWidth > 900) {
            minimizeDesktop();
        } else {
            minimizeMobile();
        }
    }

    function minimizeDesktop() {
        if(inModal) {
            fullBackground.classList.remove("book-section-comparison-slider-enlarged");
            fullBackground.style.width = "initial";
            fullBackground.style.top = "initial";
            beforeImage.style.height = "initial";
            window.removeEventListener("resize", positionEnlargedModalSlider);
        } else {
            enlargeBtn.disabled = true;
            let textSection = document.getElementById("textContent");
            textSection.addEventListener("transitionend", function() {
                enlargeBtn.disabled = false;
            }, { once: true });
            openText();
        }
    }

    function minimizeMobile() {
        if(fullBackground.requestFullscreen) {
            document.exitFullscreen();
        } else {
            let nonTextContent = document.querySelector("#nonTextContent");
            nonTextContent.style["z-index"] = "initial";
            beforeImage.classList.remove("book-section-comparison-fullscreen-polyfill");
            compSliderContainer.classList.remove("book-section-comparison-fullscreen-polyfill");
            window.removeEventListener("resize", resizePolyFullscreen);
            beforeImage.style.removeProperty("height");
            compSliderContainer.style.removeProperty("height");
            if(inModal) {
                let modalContainer = document.querySelector(`.subsection-modal-container[data-player='${playerId}']`);
                modalContainer.classList.remove("subsection-modal-container-slider-fullscreen");
                textContent.style.display = "flex";
            }
        }
    }

    function positionEnlargedModalSlider() {
        let header = document.querySelector("header");
        let footer = document.querySelector("footer");
        let posTop = header.offsetHeight + ((footer.getBoundingClientRect().top - header.getBoundingClientRect().bottom) / 2);
        let aspectRatio = (beforeImage.offsetWidth / beforeImage.offsetHeight);
        let availHeight = (footer.getBoundingClientRect().top - header.getBoundingClientRect().bottom) - 50;
        let availWidth = window.innerWidth - 100;
        let imageWidth = availHeight * aspectRatio;
        if(imageWidth < availWidth) {
            fullBackground.style.width = `${imageWidth}px`;
            beforeImage.style.height = `${imageWidth / aspectRatio}px`;
        } else {
            fullBackground.style.width = `${availWidth}px`;
            beforeImage.style.height = `${availWidth / aspectRatio}px`;
        }
        fullBackground.style.top = `${posTop}px`;
    }

    function respondToTextShelving(event) {
        if(event.currentTarget.id == "shelfButton" || event.currentTarget.id == `${playerId}-playPauseButton`) {
            window.removeEventListener("touchstart", detectSwipe);
            fullBackground.setAttribute("data-state", "fullscreen");
            enlargeBtn.style.display = "none"; 
            minimizeBtnDesk.style.display = "flex";
            minimizeBtnDesk.disabled = true;
            unshelfButton.addEventListener("transitionend", function() {
                minimizeBtnDesk.disabled = false;
            }, { once: true });
        } else if(event.currentTarget.id == "unshelfButton"){
            window.addEventListener("touchstart", detectSwipe);
            fullBackground.setAttribute("data-state", "initial");
            minimizeBtnMobile.style.display = "none"; 
            minimizeBtnDesk.style.display = "none";
            enlargeBtn.style.display = "flex";
            enlargeBtn.disabled = true;
            let textSection = document.getElementById("textContent");
            textSection.addEventListener("transitionend", function() {
                enlargeBtn.disabled = false;
            }, { once: true });
        }
    }

    function updateMainCompMaxHeight() {
        let nonTextContent = document.querySelector("#nonTextContent");
        let videoContainer = nonTextContent.querySelector(".book-section-video-container");
        let buttonContainer = nonTextContent.querySelector(".book-section-comparison-button-container");
        beforeImage.style["max-height"] = `${(videoContainer.offsetHeight - buttonContainer.offsetHeight - 14)}px`;
    }

    function resizePolyFullscreen(event) {
        setTimeout(function() {
            if(window.innerWidth > window.innerHeight) {
                beforeImage.style.height = `${window.innerHeight}px`;
                compSliderContainer.style.height = `${window.innerHeight}px`;
            } else {
                beforeImage.style.removeProperty("height");
                compSliderContainer.style.removeProperty("height");
            }
        }, 200);
    }

    function handleCompLoadError() {
        fullBackground.setAttribute("data-state", "failed");
        beforeImage.style.setProperty("display", "none", "important");
        afterImage.style.setProperty("display", "none", "important");
        compInputRange.style.setProperty("display", "none", "important");
        comparissonSlider.style.setProperty("display", "none", "important");
        enlargeBtn.style.setProperty("display", "none", "important");
        minimizeBtnMobile.style.setProperty("display", "none", "important");
        minimizeBtnDesk.style.setProperty("display", "none", "important");
        loadFailedImg.style.display = "block";
        if(loadFailedImg === document.querySelector("#nonTextContent .book-section-comparison-load-failed")) {
            let shelfButton = document.getElementById("shelfButton");
            let unshelfButton = document.getElementById("unshelfButton");
            let nonTextContent = document.querySelector("#nonTextContent");
            let videoContainer = nonTextContent.querySelector(".book-section-video-container");
            let buttonContainer = nonTextContent.querySelector(".book-section-comparison-button-container");
            shelfButton.removeEventListener("click", respondToTextShelving);
            unshelfButton.removeEventListener("click", respondToTextShelving);
            if(window.innerWidth >= 900) loadFailedImg.style["max-height"] = `${(videoContainer.offsetHeight - buttonContainer.offsetHeight - 14)}px`;
            window.addEventListener("resize", function() {
                if(window.innerWidth >= 900) loadFailedImg.style["max-height"] = `${(videoContainer.offsetHeight - buttonContainer.offsetHeight - 14)}px`;
            });
        }
        
    }

}