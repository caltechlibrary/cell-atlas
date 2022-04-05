let Header = function(root) {

    let openSearchBtn = root.querySelector(".header__open-search-btn");
    let searchWidgetContainer = root.querySelector(".header__search-widget-container");
    let searchBarInput = root.querySelector(".header__search-bar-input");
    let searchResultList = root.querySelector(".header__result-list")

    let openSearchWidgetContainer = function() {
        openSearchBtn.classList.add("header__open-search-btn--hidden");
        searchWidgetContainer.classList.remove("header__search-widget-container--hidden");
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
        searchWidgetContainer.classList.add("header__search-widget-container--hidden");
        openSearchBtn.classList.remove("header__open-search-btn--hidden");
    };

    let showSearchResults = function() {
        searchResultList.classList.remove("header__result-list--hidden");
    };

    openSearchBtn.addEventListener("click", openSearchWidgetContainer);
    searchBarInput.addEventListener("focus", showSearchResults);

    return {
        root
    }
};