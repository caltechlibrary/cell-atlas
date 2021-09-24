(function() {
    fetch("searchDict.json")
        .then(function(res) { return res.json() })
        .then(function(data) { initLunrSearch(data) });
})();

function initLunrSearch(data) {

    let documentDict = data;
    let searchInput = document.getElementById("search-input");
    let indexStemToggle = document.getElementById("toggle-index-stem");
    let searchStemToggle = document.getElementById("toggle-search-stem");
    let wildcardToggle = document.getElementById("toggle-wildcard");
    let fuzzyToggle = document.getElementById("toggle-fuzzy");
    let maxResultsInput = document.getElementById("max-results-input");
    let initTimeLabel =  document.getElementById("init-time-label");
    let queryTimeLabel = document.getElementById("query-time-label");
    let resultsContainer = document.getElementById("results-list");
    let resultCountHeader = document.getElementById("result-count-header");
    let index, searchTimeout;

    let init = function() {
        let startTime, endTime;
        resetSearch();
        startTime = Date.now();
        index = createIndex();
        endTime = Date.now();
        initTimeLabel.innerText = `${(endTime - startTime)}ms`;
    };

    let resetSearch = function() {
        searchInput.value = "";
        resultsContainer.innerHTML = "";
        queryTimeLabel.innerText = "";
    };

    let createIndex = function() {
        return lunr(function() {
            this.ref("id");
            this.field("title");
            this.field("species");
            this.field("collector");
            this.field("structure");
            this.field("content");
            if(!indexStemToggle.checked) this.pipeline.remove(lunr.stemmer);
            if(!searchStemToggle.checked) this.searchPipeline.remove(lunr.stemmer);
            this.metadataWhitelist = ['position'];
            for(let doc in documentDict) this.add(documentDict[doc]);
        });
    };

    let onSearchInput = function(event) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(queryInput, 250);
    };

    let queryInput = function(event) {
        let searchText = searchInput.value;
        if(searchText != "") {
            let startTime, endTime, results;
            startTime = Date.now();
            results = index.query(function(query) {
                query.term(lunr.tokenizer(searchText));
                if(wildcardToggle.checked) {
                    query.term(lunr.tokenizer(searchText), { wildcard: lunr.Query.wildcard.TRAILING });
                }
                if(fuzzyToggle.value > 0) {
                    query.term(lunr.tokenizer(searchText), { editDistance: fuzzyToggle.value });
                }
            });
            endTime = Date.now();
            queryTimeLabel.innerText = `${(endTime - startTime)}ms`;
            displayResults(results, data);
        }
    };

    let displayResults = function(results, data) {
        let resultsNumber = (results.length < maxResultsInput.value) ? results.length: maxResultsInput.value;
        resultCountHeader.innerText = `${resultsNumber}`;
        resultsContainer.innerHTML = "";
        for(let i = 0; i < resultsNumber; i++) {
            let resultData = results[i];
            let resultDiv = document.createElement("div");
            let titleEl = document.createElement("h2");
            let metadataDiv = document.createElement("div");
            let speciesEl = document.createElement("span");
            let collectorEl = document.createElement("span");
            let structureEl = document.createElement("span")
            let contentDiv = document.createElement("p");
            formattedResult = getFormattedResultLunr(resultData, data[resultData.ref]);
            contentDiv.innerHTML = formattedResult.content;
            if(data[resultData.ref].titlePrefix) {
                titleEl.innerHTML = `Title: ${data[resultData.ref].titlePrefix} ${formattedResult.title}`;
            } else {
                titleEl.innerHTML = `Title: ${formattedResult.title}`;
            }
            speciesEl.innerHTML = `Species: ${formattedResult.species}`;
            collectorEl.innerHTML = `Collector: ${formattedResult.collector}`;
            structureEl.innerHTML = `Structure: ${formattedResult.structure}`;
            metadataDiv.appendChild(speciesEl);
            metadataDiv.appendChild(collectorEl);
            metadataDiv.appendChild(structureEl);
            resultDiv.appendChild(titleEl);
            resultDiv.appendChild(metadataDiv);
            resultDiv.appendChild(contentDiv);
            resultsContainer.appendChild(resultDiv);
        }
    };

    let getFormattedResultLunr = function(resultMetadata, resultDoc) {
        let formattedResult = {};
        let fieldPositionData = {};
        for(let field in resultDoc) formattedResult[field] = resultDoc[field];
        for(let token in resultMetadata.matchData.metadata) {
            let tokenData = resultMetadata.matchData.metadata[token];
            for(let field in tokenData) {
                if(field in fieldPositionData) {
                    fieldPositionData[field] = fieldPositionData[field].concat(tokenData[field].position);
                } else {
                    fieldPositionData[field] = tokenData[field].position;
                }
            }
        }
        for(let field in fieldPositionData) {
            fieldPositionData[field].sort(function(a, b) { return b[0] - a[0] });
            for(position of fieldPositionData[field]) {
                let resultPreText = formattedResult[field].substring(0, position[0] - 1);
                let resultMatchedString = formattedResult[field].substring(position[0], position[0] + position[1]);
                let resultPostText = formattedResult[field].substring(position[0] + position[1]);
                formattedResult[field] = `${resultPreText} <b>${resultMatchedString}</b> ${resultPostText}`;
            }
        }
        return formattedResult;
    };

    init();
    searchInput.addEventListener("input", onSearchInput);
    indexStemToggle.addEventListener("input", init);
    searchStemToggle.addEventListener("input", init);
    wildcardToggle.addEventListener("input", resetSearch);
    fuzzyToggle.addEventListener("input", resetSearch);
    maxResultsInput.addEventListener("input", resetSearch);

}