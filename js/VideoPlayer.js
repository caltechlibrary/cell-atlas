let VideoPlayer = function(root) {
    
    let video = root.querySelector(".video-player__video");
    let videoSrc = video.querySelector("source");
    let doi = root.getAttribute("data-doi");
    let vidFile = root.getAttribute("data-vid-file");

    let init = function() {
        if(doi) {
            fetch(`https://api.datacite.org/dois/${doi}/media`)
                .then(res => res.json())
                .then(function(data){ loadSrc(data.data[0].attributes.url) });
        } else {
            loadSrc(`https://www.cellstructureatlas.org/videos/${vidFile}`);
        }
    };

    let loadSrc = function(source) {
        videoSrc.setAttribute("src", source);
        video.load();
    }

    init();

}