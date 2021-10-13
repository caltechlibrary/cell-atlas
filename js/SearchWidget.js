let SearchWidget = function(root) {

    let openBtn = root.querySelector(".search-widget__open-btn");
    let searchBar = root.querySelector(".search-widget__search-bar");
    let searchBarInput = root.querySelector(".search-widget__search-bar-input");
    let index, searchTimeout;

    let init = function() {
        fetch("searchData.json")
            .then(function(res) { return res.json() })
            .then(function(data) { initSearchFunctionality(data) });
    };

    let initSearchFunctionality = function(data) {
        index = lunr(function() {
            this.ref("id");
            this.field("title");
            this.field("species");
            this.field("collector");
            this.field("structure");
            this.field("content");
            this.metadataWhitelist = ['position'];
            this.pipeline.remove(lunr.stemmer);
            this.searchPipeline.remove(lunr.stemmer);
            for(let doc in data) this.add(data[doc]);
        });

        searchBarInput.addEventListener("input", onSearchBarInput);
    };

    let onSearchBarInput = function() {
        clearTimeout(searchTimeout);
        if(searchBarInput.value.trim().length != 0) searchTimeout = setTimeout(querySearchBarInput, 250);
    };

    let querySearchBarInput = function() {
        let queryTokens = lunr.tokenizer(searchBarInput.value);
        resultData = index.query(function(query) {
            query.term(queryTokens);
            query.term(queryTokens, { wildcard: lunr.Query.wildcard.TRAILING });
            query.term(queryTokens, { editDistance: 1 });
        });

        console.log(resultData);
    };

    let handleOpenBtnClick = function(event) {
        openSearchBar();
    };

    let autoCloseSearchWidget = function(event) {
        if(!root.contains(event.target)) closeSearchBar();
    };

    let openSearchBar = function() {
        openBtn.classList.add("search-widget__open-btn--hidden");
        searchBar.classList.remove("search-widget__search-bar--hidden");
        openBtn.setAttribute("aria-expanded", "true");
        window.addEventListener("click", autoCloseSearchWidget);
    };

    let closeSearchBar = function() {
        openBtn.classList.remove("search-widget__open-btn--hidden");
        searchBar.classList.add("search-widget__search-bar--hidden");
        openBtn.setAttribute("aria-expanded", "false");
        window.removeEventListener("click", autoCloseSearchWidget);
    };

    if(openBtn) openBtn.addEventListener("click", handleOpenBtnClick);

    return {
        root,
        openBtn,
        searchBarInput,
        init
    }

};