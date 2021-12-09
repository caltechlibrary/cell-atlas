(function() {

    let onDocumentKeydown = function(event) {
        console.log(event.target);
        if((event.key != "ArrowLeft" && event.key != "ArrowRight") || event.target.tagName == "INPUT") return;
        let page = (event.key == "ArrowLeft") ? "prev" : "next";
        let link = document.querySelector(`.nav-arrow[data-nav='${page}']`);
        if(link) window.location.assign(link.getAttribute("href"));
    };

    document.addEventListener("keydown", onDocumentKeydown);

})();