let Header = function(root) {

    let openSearchBtn = root.querySelector(".header__open-search-btn");
    let searchWidget = root.querySelector(".header__search-widget");
    let searchBarInput = root.querySelector(".header__search-bar-input");
    let searchResultList = root.querySelector(".header__result-list")

    let openSearchWidget = function() {
        openSearchBtn.classList.add("header__open-search-btn--hidden");
        searchWidget.classList.remove("header__search-widget--hidden");
        openSearchBtn.setAttribute("aria-expanded", "true");
        window.addEventListener("click", autoCloseSearchWidget);
    };

    let autoCloseSearchWidget = function(event) {
        if(!root.contains(event.target)) closeSearchWidget();
    };

    let closeSearchWidget = function() {
        window.removeEventListener("click", autoCloseSearchWidget);
        openSearchBtn.setAttribute("aria-expanded", "false");
        searchResultList.classList.add("header__result-list--hidden");
        searchWidget.classList.remove("header__search-widget--active");
        searchWidget.classList.add("header__search-widget--hidden");
        openSearchBtn.classList.remove("header__open-search-btn--hidden");
    };

    let onSearchInputFocus = function() {
        searchWidget.classList.add("header__search-widget--active");
        searchResultList.classList.remove("header__result-list--hidden");
    };

    openSearchBtn.addEventListener("click", openSearchWidget);
    searchBarInput.addEventListener("focus", onSearchInputFocus);

    return {
        root
    }
};