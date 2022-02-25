(function() {
    window.addEventListener('load', () => document.querySelector("body").classList.remove("preload"));

    let originUrl = new URL(window.location.href);
    let links = document.querySelectorAll("a");
    for(let link of links) {
        if(link.hasAttribute("href")) {
            let linkUrl = new URL(link.href);
            if(!link.hasAttribute("download") && linkUrl.origin != originUrl.origin) {
                link.setAttribute("target", "_blank");
                link.setAttribute("rel", "noopener");
            }
        }
    }
})();