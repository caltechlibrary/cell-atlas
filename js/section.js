// Script still a WIP. Script was written to just to get the job done for the static site prototype. 
// Will be improving this script where needed as time goes on.

// Check if there is "Learn More" content. If not, add margin on bottom of text seciton on desktop only
let sectionText = document.querySelector(".book-section-text");
if(sectionText) {
    let learnMore = sectionText.querySelector(".book-section-learn-more");
    if(!learnMore && window.innerWidth > 800) {
        sectionText.style["padding-bottom"] = "1em";
    }
}

let sectionTextMaterial = document.querySelector(".book-section-text-material");
if(sectionTextMaterial) {
    sectionTextMaterial.addEventListener("mousedown", function() {
        sectionTextMaterial.classList.add("book-section-video-player-controls-mouse-focus");
    });
    sectionTextMaterial.addEventListener("keydown", function() {
        sectionTextMaterial.classList.remove("book-section-video-player-controls-mouse-focus"); 
    });
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

// Add keyboard only focus styles to quality changer
let qualityChangerButtons = document.querySelectorAll(".video-quality-changer-input span");
let qualityChangerInputs = document.querySelectorAll(".video-quality-changer-input input");
for(let i = 0; i < qualityChangerButtons.length; i++) {
    qualityChangerInputs[i].addEventListener("keydown", function() {
        useKeyboardFocus({ target: qualityChangerButtons[i] });
    });
    qualityChangerButtons[i].addEventListener("mousedown", useMouseFocus);
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
let comparisonVideoButtons = document.querySelectorAll(".book-section-comparison-button-container button");
for(let comparisonVideoButton of comparisonVideoButtons) {
    comparisonVideoButton.addEventListener("mousedown", function() {
        comparisonVideoButton.classList.add("book-section-video-player-controls-mouse-focus");
    });
    comparisonVideoButton.addEventListener("keydown", function() {
        comparisonVideoButton.classList.remove("book-section-video-player-controls-mouse-focus");
    });
}

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

function sourceVideo(el) {
    // Check if quality is preset to 480. If yes, source it now
    let currentQuality = window.sessionStorage.getItem("vidQuality");
    if(!currentQuality) {
        currentQuality = "High";
        window.sessionStorage.setItem("vidQuality", currentQuality);
    }
    let qualityButton = document.querySelector(`.video-quality-changer[data-player='${el.getAttribute("id")}'] input#vid${currentQuality}`);
    if(qualityButton) qualityButton.checked = true;
    if(currentQuality == "Med") {
        sourceVideoSmall(el);
        el.load();
    }

    let doi = el.getAttribute("doi");
    if(!doi) {
        // Check if quality is high and video is still relative
        if(currentQuality == "High" || !currentQuality) setSource(el, el.getAttribute("data-file"));
        return;
    };
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
                el.load();
            }
        });
}

function setSource(videoEl, fileName) {
    let source = videoEl.querySelector("source");
    if(!source) {
        source = document.createElement("source");
        videoEl.appendChild(source);
    }
    if(window.location.origin == "https://caltechlibrary.github.io") {
        source.setAttribute("src", `https://www.cellstructureatlas.org/videos/${fileName}`);
    } else {
        source.setAttribute("src", `videos/${fileName}`);
    }
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
    videoPlayer.addEventListener("canplay", function() {
        videoPlayer.currentTime = currTime;
        if(!paused) videoPlayer.play();
    }, { once: true });

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
            if(window.location.origin == "https://caltechlibrary.github.io") {
                source.setAttribute("src", `https://www.cellstructureatlas.org/videos/${videoFileName}`);
            } else {
                source.setAttribute("src", `videos/${videoFileName}`);
            }
        }
    }
    
    // Add event listener to load the video when played
    videoPlayer.addEventListener("play", loadVidSource);
}

function sourceVideoSmall(video) {
    let videoFileName = video.getAttribute("data-file");
    let videoFileNameSmall = `${videoFileName.substring(0, videoFileName.length-4)}_480p.mp4`;
    setSource(video, videoFileNameSmall);
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
    let videoPaintCanvas = videoPlayer.querySelector(`#${playerId}-videoPaintCanvas`);
    let videoScrubCanvas = videoPlayer.querySelector(`#${playerId}-videoScrubCanvas`);
    let paintContext = videoPaintCanvas.getContext("2d");
    let scrubContext = videoScrubCanvas.getContext("2d");
    seekBar.bufferPercent = 0;
    let videoDuration = 0;
    let fps = 15;
    let isPaused = true;
    let frameImages;
    let frameInterval;

    playPauseButton.addEventListener("mousedown", useMouseFocus);
    fullScreenButton.addEventListener("mousedown", useMouseFocus);
    seekBar.addEventListener("mousedown", useMouseFocus);
    playPauseButton.addEventListener("keydown", useKeyboardFocus);
    fullScreenButton.addEventListener("keydown", useKeyboardFocus);
    seekBar.addEventListener("keydown", useKeyboardFocus);

    videoEl.addEventListener("canplay", function() {
        playPauseButton.removeAttribute("disabled");
        fullScreenButton.removeAttribute("disabled");
        seekBar.removeAttribute("disabled");

        videoEl.addEventListener('click', function() {
            playPauseButton.click();
        });
    }, { once: true });

    if(window.createImageBitmap) {
        videoEl.addEventListener("playing", function() {
            frameInterval = setInterval(function(){
                saveFrame();
            }, 1000/fps);
        });

        videoEl.addEventListener("seeked", async function() {
            // Overide scrub by displaying video and save frame to scrub
            let seekedTime = videoEl.currentTime;
            let roundedSeekedTime = Math.round(seekedTime * fps) / fps;
            // Check if frame does not exist already
            if(roundedSeekedTime in frameImages) return;
            videoScrubCanvas.style.display = "none";
            await saveFrame();
            scrubContext.drawImage(frameImages[roundedSeekedTime], 0, 0, videoScrubCanvas.width, videoScrubCanvas.height);
        });
    }
 
    videoEl.addEventListener("pause", function() {
        clearInterval(frameInterval);
    });

    playPauseButton.addEventListener('click', function() {
        if (videoEl.paused || videoEl.ended) videoEl.play();
        else videoEl.pause();
    });

    fullScreenButton.addEventListener("click", function() {
        if(document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement) {
            window.addEventListener("touchstart", detectSwipe);
            videoPlayer.classList.remove("book-section-video-player-fullscreen");
            if (document.exitFullscreen) {
                document.exitFullscreen();
                document.removeEventListener("fullscreenchange", toggleFullscreen);
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
                document.removeEventListener("webkitfullscreenchange", toggleFullscreen);
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
                document.removeEventListener("msfullscreenchange", toggleFullscreen);
            }
        } else {
            if (videoPlayer.requestFullscreen) {
                videoPlayer.requestFullscreen();
                document.addEventListener("fullscreenchange", toggleFullscreen);
            } else if (videoPlayer.webkitRequestFullscreen) { /* Safari */
                videoPlayer.webkitRequestFullscreen();
                document.addEventListener("webkitfullscreenchange", toggleFullscreen);
            } else if (videoPlayer.msRequestFullscreen) { /* IE11 */
                videoPlayer.msRequestFullscreen();
                document.addEventListener("msfullscreenchange", toggleFullscreen);
            }
        }
    });

    videoEl.addEventListener('play', function() {
        isPaused = false;
        videoPlayer.addEventListener("mouseleave", hidePlayerControls);
        videoPlayer.addEventListener("mouseenter", showPlayerControls);
        togglePlayPause();
    });
    
    videoEl.addEventListener('pause', function() {
        isPaused = true;
        videoControls.style.opacity = 1;
        videoPlayer.removeEventListener("mouseleave", hidePlayerControls);
        videoPlayer.removeEventListener("mouseenter", showPlayerControls);
        togglePlayPause();
    });

    videoEl.addEventListener("loadedmetadata", function() {
        // TODO: put clear interval in a better spot
        clearInterval(frameInterval);
        frameImages = {};
        videoDuration = videoEl.duration;
        videoPaintCanvas.setAttribute("width", `${videoEl.offsetWidth}px`);
        videoPaintCanvas.setAttribute("height", `${videoEl.offsetHeight}px`);
        videoScrubCanvas.setAttribute("width", `${videoEl.offsetWidth}px`);
        videoScrubCanvas.setAttribute("height", `${videoEl.offsetHeight}px`);
        seekBar.step = `${1/fps}`;
        let totalMinutes = (videoDuration >= 60) ? Math.floor(videoDuration / 60) : 0;
        let seconds = Math.round(videoDuration) - (totalMinutes * 60);
        let secondsFormatted = (seconds < 10) ? `0${seconds}` : seconds;
        videoTimeStatus.innerHTML = `0:00 / ${totalMinutes}:${secondsFormatted}`;
        updateBufferedTime(videoEl, seekBar);
    });

    videoEl.addEventListener("timeupdate", function() {
        if(videoEl.readyState > 0) {
            seekBar.value = (videoEl.currentTime / videoDuration) * 100;
            // Update seek bar
            updateSeekBar();
            // Update timestamp
            updateTimeStamp();
        }
    });

    videoEl.addEventListener("ended", function() {
        clearInterval(frameInterval);
    });

    videoEl.addEventListener("waiting", function() {
        clearInterval(frameInterval);
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

        if(window.createImageBitmap) {
            videoScrubCanvas.style.display = "block";
            let roundedTime = Math.round(seekBarTime * fps) / fps;
            if(roundedTime in frameImages) {
                scrubContext.drawImage(frameImages[roundedTime], 0, 0, videoScrubCanvas.width, videoScrubCanvas.height);
            }   
        }

        videoEl.currentTime = seekBarTime;
        updateSeekBar();
        updateTimeStamp();
    });

    seekBar.addEventListener("mouseup", function(){
        videoScrubCanvas.style.display = "none";
    });

    seekBar.addEventListener("keyup", function(){
        videoScrubCanvas.style.display = "none";
    });

    seekBar.addEventListener("keydown", function(){
        if(!isPaused) {
            videoEl.pause();
            seekBar.addEventListener("keyup", function() {
                videoEl.play();
            }, { once: true });
        }
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
        let currentFrameTime = videoEl.currentTime;
        if(Math.round(currentFrameTime * fps) / fps in frameImages) return;
        paintContext.drawImage(videoEl, 0, 0, videoPaintCanvas.width, videoPaintCanvas.height);
        imageData = paintContext.getImageData(0, 0, videoPaintCanvas.width, videoPaintCanvas.height);
        imageBitmap = await createImageBitmap(imageData);
        frameImages[Math.round(currentFrameTime * fps) / fps] = imageBitmap;
    }

    function toggleFullscreen() {
        if(document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement) {
            window.removeEventListener("touchstart", detectSwipe);
            videoPlayer.classList.add("book-section-video-player-fullscreen");
        } else {
            window.addEventListener("touchstart", detectSwipe);
            videoPlayer.classList.remove("book-section-video-player-fullscreen");
        }
    }
}

function useMouseFocus(event) {
    let el = event.target;
    el.classList.add("book-section-video-player-controls-mouse-focus");
}

function useKeyboardFocus(event) {
    let el = event.target;
    el.classList.remove("book-section-video-player-controls-mouse-focus");
}

function toggleImageSlider(el) {
    let selectedValue = el.getAttribute("value");
    let videoPlayerId = el.getAttribute("data-player");
    let videoQualitySwitcher = document.querySelector(`.video-quality-changer[data-player='${videoPlayerId}']`);
    let videoContainer = document.querySelector(`.book-section-video-player[data-player='${videoPlayerId}']`);
    let videoElement = videoContainer.querySelector("video");
    let comparissonFullBackground = document.querySelector(`#fullBackground-${videoPlayerId}`);
    let currSelectedButton = el.parentElement.querySelector("button[data-state='selected']");

    if(!videoElement.paused) videoElement.pause();

    if(selectedValue == "image") {
        comparissonFullBackground.style.display = "block";
        videoContainer.style.display = "none";
        if(videoQualitySwitcher) videoQualitySwitcher.style.display = "none";
    } else {
        comparissonFullBackground.style.display = "none";
        videoContainer.style.display = "flex";
        if(videoQualitySwitcher) videoQualitySwitcher.style.display = "flex";
    }
    currSelectedButton.setAttribute("data-state", "");
    el.setAttribute("data-state", "selected");
}

function initializeCompSlider(compSliderContainer) {
    let playerId = compSliderContainer.getAttribute("data-player");
    let afterImage = compSliderContainer.querySelector(".book-section-comparison-after");
    let beforeImage = compSliderContainer.querySelector("img");
    let comparissonSlider = compSliderContainer.querySelector(".book-section-comparison-slider");
    let compInputRange = compSliderContainer.querySelector(".book-section-comparison-range");
    let exitFullBtn = compSliderContainer.querySelector(`#compExitFull-${playerId}`);
    let fullBackground = compSliderContainer.parentElement;
    let enterFullBtn = fullBackground.querySelector(`#compEnterFull-${playerId}`);
    let imgFileName = compSliderContainer.getAttribute("data-img-name");

    comparissonSlider.addEventListener("mousedown", slideReady);
    comparissonSlider.addEventListener("touchstart", slideReady);
    compInputRange.addEventListener("input", inputToSlide);
    enterFullBtn.addEventListener("click", compEnterFullScreen);
    exitFullBtn.addEventListener("click", compExitFullScreen);

    afterImage.style["background-image"] = `url(https://www.cellstructureatlas.org/img/stillimages/${imgFileName}_after.jpg)`;

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
        pageX = event.pageX || event.changedTouches[0].pageX;
        let positionX = pageX - boundingRect.left;
        positionX = positionX - window.pageXOffset;
        return positionX;
    }

    function slide(position) {
        let afterValue = position;
        comparissonSlider.style.left = `${afterValue}px`;
        compInputRange.value = (afterValue / beforeImage.offsetWidth) * 100;
        let marginLeft = window.getComputedStyle(beforeImage)["margin-left"];
        marginLeft = parseFloat(marginLeft.substring(0, marginLeft.length - 2));
        afterImage.style.width = `${afterValue - marginLeft}px`;
    }

    function inputToSlide() {
        afterImage.style.width = `${compInputRange.value}%`;
        comparissonSlider.style.left = `${compInputRange.value}%`;
    }

    function compEnterFullScreen() {
        window.removeEventListener("touchstart", detectSwipe);
        enterFullBtn.style.display = "none"; 
        exitFullBtn.style.display = "flex";
        fullBackground.setAttribute("data-state", "fullscreen");
        if(fullBackground.requestFullscreen) {
            fullBackground.requestFullscreen();
        } else {
            let nonTextContent = document.querySelector("#nonTextContent");
            nonTextContent.style["z-index"] = 100;
            beforeImage.classList.add("book-section-comparison-fullscreen-polyfill");
            compSliderContainer.classList.add("book-section-comparison-fullscreen-polyfill");
            if(compSliderContainer.getAttribute("data-modal") == "true") {
                let modalContainer = document.querySelector(`.subsection-modal-container[data-player='${playerId}']`);
                let textContent = document.querySelector("#textContent");
                modalContainer.classList.add("subsection-modal-container-slider-fullscreen");
                textContent.style.display = "none";
            }
        }
    }

    function compExitFullScreen() {
        window.addEventListener("touchstart", detectSwipe);
        exitFullBtn.style.display = "none"; 
        enterFullBtn.style.display = "flex";
        fullBackground.setAttribute("data-state", "initial");
        if(fullBackground.requestFullscreen) {
            document.exitFullscreen();
        } else {
            let nonTextContent = document.querySelector("#nonTextContent");
            nonTextContent.style["z-index"] = "initial";
            beforeImage.classList.remove("book-section-comparison-fullscreen-polyfill");
            compSliderContainer.classList.remove("book-section-comparison-fullscreen-polyfill");
            if(compSliderContainer.getAttribute("data-modal") == "true") {
                let modalContainer = document.querySelector(`.subsection-modal-container[data-player='${playerId}']`);
                modalContainer.classList.remove("subsection-modal-container-slider-fullscreen");
                textContent.style.display = "flex";
            }
        }
    }

    function posToPercent() {
        let percentage = (afterImage.getBoundingClientRect().width / beforeImage.offsetWidth) * 100;
        comparissonSlider.style.left = `${percentage}%`;
        compInputRange.value = Math.floor(percentage);
        let marginLeft = window.getComputedStyle(beforeImage)["margin-left"];
        marginLeft = parseFloat(marginLeft.substring(0, marginLeft.length - 2));
        afterImage.style.width = `${percentage - ((marginLeft / beforeImage.offsetWidth) * 100)}%`;
    }

}