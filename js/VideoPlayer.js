/**
 * Creates a video player widget and returns videojs player object.
 * This widget definition looks different than other widget definitions
 * in this project because it internally uses a different video player
 * library, videojs https://videojs.com/.
 *
 * @param root The dom element being registered as a video player.
 */
let VideoPlayer = function(root) {

    // Create frequently used variables.
    let offline = root.getAttribute("data-offline");
    let doi = root.getAttribute("data-doi");
    let vidName = root.getAttribute("data-vid-name")

    // Create video player object from videojs. Returned from VideoPlayer(). 
    let videoPlayer = videojs(root, {
        controls: true,
        controlBar: {
            playToggle: true,
            currentTimeDisplay: true,
            timeDivider: true,
            durationDisplay: true,
            fullscreenToggle: true,
            progressControl: true,
            volumePanel: false,
            pictureInPictureToggle: false,
            remainingTimeDisplay: false
        }
    });

    /**
     * Initialize video player by setting correct source and adding
     * custom quality changer to videojs player if online.
     */
    let init = async function() {
        if(offline) {
            videoPlayer.src(`videos/${videoPlayer.getAttribute("data-src")}`);
        } else {
            // Set default quality based on session storage variable
            let vidQuality = (window.sessionStorage.getItem("vidQuality") == "480") ? "480" : "1080";

            // Set variables for 1080/480 src
            if(doi) { 
                // If doi, generate source strings from that
                let res = await fetch(`https://api.datacite.org/dois/${doi}/media`);
                let data = await res.json();
                src1080 = data.data[0].attributes.url;
                src480 = `${src1080.substring(0, src1080.indexOf(".mp4"))}_480p.mp4`;
            } else { 
                // If no doi, fallback to vidName variable which is set by build script
                src1080 = `https://www.cellstructureatlas.org/videos/${vidName}.mp4`;
                src480 = `https://www.cellstructureatlas.org/videos/${vidName}_480p.mp4`;
            }

            // Load source in video element
            videoPlayer.src((vidQuality == "480") ? src480 : src1080);

            // Add custom quality switcher defined in QualitySelector.js, where it is 
            // registered as a videojs component. The third argument "13" represents
            // the order the changer appears in the player controls (13th child) and
            // is a part of videojs.
            videoPlayer.qualityChanger = videoPlayer.controlBar.addChild("QualityChanger", {
                qualities: [
                    { quality: "1080", src: src1080 },
                    { quality: "480", src: src480 },
                ]
            }, 13);
        }
    };

    /**
     * Force player fullscreen when video is played on mobile screens.
     * Fired on videojs player play event.
     */
    let onPlay = function() {
        if(window.innerWidth < 900) videoPlayer.requestFullscreen();
    };

    /**
     * Pause player when video exits fullscreen on mobile screens.
     * Fired on videojs fullscreenchange event.
     */
    let onFullscreenchange = function() {
        if(window.innerWidth < 900 && !videoPlayer.isFullscreen()) videoPlayer.pause();
    };

    // Init player and add event listeners (the videojs way with "on" method since 
    // videoPlayer is a videojs video player).
    init();
    videoPlayer.on("play", onPlay);
    videoPlayer.on("fullscreenchange", onFullscreenchange);

    return videoPlayer;
};