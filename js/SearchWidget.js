let SearchWidget = function(root) {

    let openBtn = root.querySelector(".search-widget__open-btn");
    let searchBar = root.querySelector(".search-widget__search-bar");

    let handleOpenBtnClick = function(event) {
        openSearchBar();
    };

    let autoCloseSearchWidget = function(event) {
        if(!root.contains(event.target)) closeSearchBar();
    };

    let openSearchBar = function() {
        openBtn.classList.add("search-widget__open-btn--hidden");
        searchBar.classList.remove("search-widget__search-bar--hidden-desktop");
        openBtn.setAttribute("aria-expanded", "true");
        window.addEventListener("click", autoCloseSearchWidget);
    };

    let closeSearchBar = function() {
        openBtn.classList.remove("search-widget__open-btn--hidden");
        searchBar.classList.add("search-widget__search-bar--hidden-desktop");
        openBtn.setAttribute("aria-expanded", "false");
        window.removeEventListener("click", autoCloseSearchWidget);
    };

    openBtn.addEventListener("click", handleOpenBtnClick);

};