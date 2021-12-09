(function() {

    let onDocumentKeydown = function(event) {
        if((event.key != "ArrowLeft" && event.key != "ArrowRight") || event.target.tagName == "INPUT") return;
        let page = (event.key == "ArrowLeft") ? "prev" : "next";
        let link = document.querySelector(`.nav-arrow[data-page='${page}']`);
        if(link) window.location.assign(link.getAttribute("href"));
    };

    document.addEventListener("keydown", onDocumentKeydown);

})();