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
    let initTimeLabel =  document.getElementById("init-time-label");
    let queryTimeLabel = document.getElementById("query-time-label");
    let resultsContainer = document.getElementById("results-list");
    let settings = {
        indexStemming: true,
        searchStemming: true,
        wildCards: false,
        fuzzyDistance: 0
    }
    let index;

    let init = function() {
        let startTime, endTime;
        startTime = Date.now();
        index = createIndex();
        endTime = Date.now();
        initTimeLabel.innerText = `Init time: ${(endTime - startTime)}ms`;
    };

    let createIndex = function() {
        return lunr(function() {
            this.ref("id");
            this.field("title");
            this.field("species");
            this.field("collector");
            this.field("structure");
            this.field("content");
            if(!settings.indexStemming) this.pipeline.remove(lunr.stemmer);
            if(!settings.searchStemming) this.searchPipeline.remove(lunr.stemmer);
            this.metadataWhitelist = ['position'];
            for(let doc in documentDict) this.add(documentDict[doc]);
        });
    };

    let queryInput = function(event) {
        let query = event.target.value;
        if(query != "") {
            query = processInput(query);
            let startTime, endTime, results;
            startTime = Date.now();
            results = index.search(query);
            endTime = Date.now();
            queryTimeLabel.innerText = `Query Time: ${(endTime - startTime)}ms`;
            displayResults(results, data);
        }
    };

    let processInput = function(query) {
        if(settings.wildCards) {
            let tokens = query.match(/[^ ]+/g);
            for(let i = 0; i < tokens.length; i++) tokens[i] = `${tokens[i]}*`;
            query = tokens.join(" ");
        }
        if(settings.fuzzyDistance > 0) {
            let tokens = query.match(/[^ ]+/g);
            for(let i = 0; i < tokens.length; i++) tokens[i] = `${tokens[i]}~${settings.fuzzyDistance}`;
            query = tokens.join(" ");
        }
        return query;
    }

    let displayResults = function(results, data) {
        resultsContainer.innerHTML = "";
        for(let resultData of results) {
            let resultDiv = document.createElement("div");
            let titleEl = document.createElement("h2");
            let metadataDiv = document.createElement("div");
            let speciesEl = document.createElement("span");
            let collectorEl = document.createElement("span");
            let structureEl = document.createElement("span")
            let contentDiv = document.createElement("p");
            formattedResult = getFormattedResultLunr(resultData, data[resultData.ref]);
            contentDiv.innerHTML = formattedResult.content;
            titleEl.innerHTML = `Title: ${data[resultData.ref].titlePrefix} ${formattedResult.title}`;
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

    let toggleIndexStemming = function(event) {
        settings.indexStemming = event.target.checked;
        init();
        resetSearch();
    };

    let toggleSearchStemming = function(event) {
        settings.searchStemming = event.target.checked;
        init();
        resetSearch();
    };

    let toggleWildCards = function(event) {
        settings.wildCards = event.target.checked;
        resetSearch();
    };

    let toggleFuzzy = function(event) {
        settings.fuzzyDistance = event.target.value;
        resetSearch();
    };

    let resetSearch = function() {
        searchInput.value = "";
        resultsContainer.innerHTML = "";
        queryTimeLabel.innerText = "";
    };

    init();
    searchInput.addEventListener("input", queryInput);
    indexStemToggle.addEventListener("input", toggleIndexStemming);
    searchStemToggle.addEventListener("input", toggleSearchStemming);
    wildcardToggle.addEventListener("input", toggleWildCards);
    fuzzyToggle.addEventListener("input", toggleFuzzy);

}