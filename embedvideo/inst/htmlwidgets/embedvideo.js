HTMLWidgets.widget({

  name: 'embedvideo',

  type: 'output',

  factory: function(el, width, height) {

    return {

      renderValue: function(x) {

        el.innerHTML = `
        <style>
        .video {
        position: relative;
        margin: 0 auto;
        }

        #my-video {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        }
        </style>
        <div class="video">
        <video class="video-js" width="${width}" height="${height}" controls preload="auto" responsive=true id="my-video" data-setup='{"fluid": true}'>
        <source src="${x.media_location}" type='video/mp4'>
        <p class="vjs-no-js">
          To view this video please enable JavaScript, and consider upgrading to a web browser that
          <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
        </p>
      </video>
      </div>`;

      },

      resize: function(width, height) {

        // Don't think this is needed CL.doi_video_player(el,x.doi,x.index,width,height);

      }

    };
  }
});
