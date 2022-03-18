let VideoPlayer = function(root) {
    let offline = root.getAttribute("data-offline");
    let doi = root.getAttribute("data-doi");
    let vidName = root.getAttribute("data-vid-name")
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

    let init = async function() {
        if(offline) {
            videoPlayer.src(`videos/${videoPlayer.getAttribute("data-src")}`);
        } else {
            // Set default quality based on session storage variable
            let vidQuality = (window.sessionStorage.getItem("vidQuality") == "480") ? "480" : "1080";

            // Set variables for 1080/480 src
            if(doi) { // If doi, generate source strings from that
                let res = await fetch(`https://api.datacite.org/dois/${doi}/media`);
                let data = await res.json();
                src1080 = data.data[0].attributes.url;
                src480 = `${src1080.substring(0, src1080.indexOf(".mp4"))}_480p.mp4`;
            } else { // If no doi, fallback to vidName variable which is set by build script
                src1080 = `https://www.cellstructureatlas.org/videos/${vidName}.mp4`;
                src480 = `https://www.cellstructureatlas.org/videos/${vidName}_480p.mp4`;
            }

            // Load source in video element
            videoPlayer.src((vidQuality == "480") ? src480 : src1080);

            // Add quality switcher
            let qualityChanger = videoPlayer.controlBar.addChild("QualityChanger", {
                qualities: [
                    { quality: "1080", src: src1080 },
                    { quality: "480", src: src480 },
                ]
            }, 13);
            videoPlayer.qualityChanger = qualityChanger;
        }
    };

    init();

    return videoPlayer;
};