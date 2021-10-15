let SearchWidget = function(root) {

    let openBtn = root.querySelector(".search-widget__open-btn");
    let searchBar = root.querySelector(".search-widget__search-bar");
    let searchBarInput = root.querySelector(".search-widget__search-bar-input");
    let resultList = root.querySelector(".search-widget__result-list");
    let maxResults = 15;
    let maxResultChars = 150;
    let searchData, index, searchTimeout;

    let init = function() {
        fetch("searchData.json")
            .then(function(res) { return res.json() })
            .then(function(data) { initSearchFunctionality(data) });
    };

    let initSearchFunctionality = function(data) {
        searchData = data;
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
        if(searchBarInput.value.trim().length != 0) {
            searchTimeout = setTimeout(querySearchBarInput, 250);
        } else {
            clearResultsList();
            resultList.classList.add("search-widget__result-list--hidden");
            searchBar.classList.remove("search-widget__search-bar--results-showing");
        }
    };

    let querySearchBarInput = function() {
        let queryTokens = lunr.tokenizer(searchBarInput.value);
        resultData = index.query(function(query) {
            query.term(queryTokens);
            query.term(queryTokens, { wildcard: lunr.Query.wildcard.TRAILING });
            query.term(queryTokens, { editDistance: 1 });
        });

        if(resultData.length > 1) displayResults(resultData);
    };

    let displayResults = function(resultData) {
        let resultsNum = (resultData.length < maxResults) ? resultData.length : maxResults;
        clearResultsList();
        for(let i = 0; i < resultsNum; i++) {
            let formattedResultEls = getFormattedResultEls(resultData[i], searchData[resultData[i].ref]);
            let resultEntryEl = createResultEntryElement(formattedResultEls, searchData[resultData[i].ref]);
            let resultEntrySeparatorEl = document.createElement("div");
            resultEntrySeparatorEl.classList.add("search-widget__result-separator");
            resultList.appendChild(resultEntryEl);
            if(i != resultsNum - 1) resultList.appendChild(resultEntrySeparatorEl);
        }
        resultList.classList.remove("search-widget__result-list--hidden");
        searchBar.classList.add("search-widget__search-bar--results-showing");
    };

    let clearResultsList = function() {
        while(resultList.firstChild) resultList.removeChild(resultList.firstChild);
    };

    let getFormattedResultEls = function(resultData, sourceDoc) {
        let formattedHighlightData = getFormattedHighlightData(resultData.matchData.metadata);
        let formattedResultEls = {};
        for(field in sourceDoc) {
            if(formattedHighlightData[field]) {
                let truncatedResources = getTruncatedResources(formattedHighlightData[field], sourceDoc[field]);
                formattedResultEls[field] = getFormattedHTML(truncatedResources.highlightData, truncatedResources.sourceContent);
            } else {
                let truncatedSourceContent = (sourceDoc[field].length > maxResultChars) ? `${sourceDoc[field].substring(0, maxResultChars)}...` : sourceDoc[field];
                let resultEl = document.createElement("span");
                let sourceContentTextNode = document.createTextNode(truncatedSourceContent);
                resultEl.appendChild(sourceContentTextNode);
                formattedResultEls[field] = resultEl;
            }
        }
        if(formattedResultEls.title && sourceDoc.titlePrefix) formattedResultEls.title.prepend( document.createTextNode(`${sourceDoc.titlePrefix} `) );
        return formattedResultEls;
    };

    let getFormattedHighlightData = function(tokenPositionData) {
        let highlightData = {};
        for(let token in tokenPositionData) {
            let positionData = tokenPositionData[token];
            for(let field in positionData) {
                if(highlightData[field]) {
                    highlightData[field] = highlightData[field].concat(positionData[field].position);
                } else {
                    highlightData[field] = [].concat(positionData[field].position);
                }
            }
        }
        for(field in highlightData) highlightData[field].sort(function(a, b) { return a[0] - b[0] });
        return highlightData;
    };

    let getTruncatedResources = function(highlightData, sourceContent) {
        if(sourceContent.length <= maxResultChars) return { highlightData, sourceContent };
        let highlightStart = highlightData[0][0];
        let highlightStartLength = highlightData[0][1];
        let surroundingCharCount = Math.floor((maxResultChars - highlightStartLength) / 2);
        let truncatedHighlightData, truncatedSourceString;
        if(highlightStart < surroundingCharCount) {
            // highlighted word should not have beggining truncated
            truncatedSourceString = `${sourceContent.substring(0, maxResultChars)}...`;
            truncatedHighlightData = highlightData.filter(function(highlightDatum) { 
                return (highlightDatum[0] + highlightDatum[1]) < maxResultChars;
            });
        } else if(highlightStart > sourceContent.length - surroundingCharCount) {
            // highlihgted word should not have end truncated
            let truncatedStart = sourceContent.length - maxResultChars;
            truncatedSourceString = `...${sourceContent.substring(truncatedStart)}`;
            truncatedHighlightData = highlightData.filter(function(highlightDatum) { 
                return highlightDatum[0] > truncatedStart;
            }).map(function(highlightDatum) {
                return [(highlightDatum[0] - truncatedStart) + 3, highlightDatum[1]];
            });
        } else {
            // highlighted word should be truncated on both sides
            let truncatedStart = highlightStart - surroundingCharCount;
            let truncatedEnd = highlightStart + highlightStartLength + surroundingCharCount;
            truncatedSourceString = `...${sourceContent.substring(truncatedStart, truncatedEnd)}...`;
            truncatedHighlightData = highlightData.filter(function(highlightDatum) { 
                return highlightDatum[0] > truncatedStart && (highlightDatum[0] + highlightDatum[1]) < truncatedEnd;
            }).map(function(highlightDatum) {
                return [(highlightDatum[0] - truncatedStart) + 3, highlightDatum[1]];
            });
        }
        return { highlightData: truncatedHighlightData, sourceContent: truncatedSourceString };
    };

    let getFormattedHTML = function(highlightData, sourceContent) {
        let outerEl = document.createElement("span");
        for(let i = 0; i < highlightData.length; i++) {
            let prevData = highlightData[i - 1];
            let startPos = (prevData) ? prevData[0] + prevData[1] : 0;
            let highlightStartPos = highlightData[i][0];
            let highlightEndPos = highlightStartPos + highlightData[i][1];
            let preText = sourceContent.substring(startPos, highlightStartPos);
            let preTextNode = document.createTextNode(preText);
            let highlightText =  sourceContent.substring(highlightStartPos, highlightEndPos);
            let highlightTextNode = document.createTextNode(highlightText);
            let highlightedSpan = document.createElement("span");
            highlightedSpan.classList.add("search-widget__result-highlight");
            highlightedSpan.appendChild(highlightTextNode);
            outerEl.appendChild(preTextNode);
            outerEl.appendChild(highlightedSpan);
            if(i == highlightData.length - 1) {
                let trailingText = sourceContent.substring(highlightEndPos);
                let trailingTextNode = document.createTextNode(trailingText)
                outerEl.appendChild(trailingTextNode);
            }
        }
        return outerEl;
    };

    let createResultEntryElement = function(formattedResultEls, sourceDoc) {
        let entryElement = document.createElement("li");
        let linkEl = document.createElement("a");
        let contentEl = document.createElement("p");
        entryElement.classList.add("search-widget__result-entry");
        linkEl.classList.add("search-widget__result-link");
        linkEl.setAttribute("href", sourceDoc.id);
        linkEl.appendChild(formattedResultEls.title);
        entryElement.appendChild(linkEl);
        contentEl.classList.add("search-widget__result-content");
        contentEl.appendChild(formattedResultEls.content);

        if(formattedResultEls.species || formattedResultEls.collector || formattedResultEls.structure) {
            let metadataContainerEl = document.createElement("div");
            metadataContainerEl.classList.add("search-widget__result-metadata-container");
            if(formattedResultEls.species) metadataContainerEl.appendChild( createMetadataEntryEl("Species: ", formattedResultEls.species) );
            if(formattedResultEls.collector) metadataContainerEl.appendChild( createMetadataEntryEl("Collector: ", formattedResultEls.collector) );
            if(formattedResultEls.structure) metadataContainerEl.appendChild( createMetadataEntryEl("Structure: ", formattedResultEls.structure) );
            entryElement.appendChild(metadataContainerEl);
        }

        entryElement.appendChild(contentEl);
        return entryElement;
    };

    let createMetadataEntryEl = function(preText, metadataEl) {
        let metadataEntryEl = document.createElement("span");
        let preTextNode = document.createTextNode(preText);
        metadataEntryEl.classList.add("search-widget__metadata-entry");
        metadataEntryEl.appendChild(preTextNode);
        metadataEntryEl.appendChild(metadataEl);
        return metadataEntryEl;
    };

    let handleOpenBtnClick = function(event) {
        openSearchBar();
    };

    let autoCloseSearchWidget = function(event) {
        if(!root.contains(event.target)) closeSearchWidget();
    };

    let openSearchBar = function() {
        openBtn.classList.add("search-widget__open-btn--hidden");
        searchBar.classList.remove("search-widget__search-bar--hidden");
        openBtn.setAttribute("aria-expanded", "true");
        window.addEventListener("click", autoCloseSearchWidget);
        searchBarInput.disabled = false;
    };

    let closeSearchWidget = function() {
        searchBarInput.disabled = true;
        resultList.classList.add("search-widget__result-list--hidden");
        searchBar.classList.remove("search-widget__search-bar--results-showing");
        openBtn.classList.remove("search-widget__open-btn--hidden");
        searchBar.classList.add("search-widget__search-bar--hidden");
        openBtn.setAttribute("aria-expanded", "false");
        window.removeEventListener("click", autoCloseSearchWidget);
    };

    let handleSearchBarInputFocus = function() {
        if(searchBarInput.value.trim().length != 0) {
            resultList.classList.remove("search-widget__result-list--hidden");
            searchBar.classList.add("search-widget__search-bar--results-showing");
        }
    };

    if(openBtn) openBtn.addEventListener("click", handleOpenBtnClick);
    searchBarInput.addEventListener("focus", handleSearchBarInputFocus);

    return {
        root,
        openBtn,
        searchBarInput,
        init
    }

};