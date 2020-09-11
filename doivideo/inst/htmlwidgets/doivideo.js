HTMLWidgets.widget({

  name: 'doivideo',

  type: 'output',

  factory: function(el, width, height) {

    return {

      renderValue: function(x) {
        CL.doi_media(x.doi, x.index, function(obj, err) {
            if (err) {
                el.innerHTML = `Could not render ${x.doi}, ${err}`;
                return;
            }
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
        <video class="video-js vjs-default-skin vjs-big-play-centered" width="${width}" height="${height}" poster="${x.screenshot}" controls preload="auto" responsive=true id="my-video" data-setup='{"fluid": true}'>
        <source src="${obj.media_url}" type='${obj.media_type}'>
        <p class="vjs-no-js">
          To view this video please enable JavaScript, and consider upgrading to a web browser that
          <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
        </p>
      </video>
      </div>`;
        });
      },

      //resize: function(width, height) {

      //  Don't think this is needed CL.doi_video_player(el,x.doi,x.index,width,height);

      //}

    };
  }
});
