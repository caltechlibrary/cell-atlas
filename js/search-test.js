(function() {
    fetch("searchDict.json")
        .then(function(res) { return res.json() })
        .then(function(data) { initLunrSearch(data) });
})();

function initLunrSearch(sourceData) {

    let searchInput = document.getElementById("search-input");
    let indexStemToggle = document.getElementById("toggle-index-stem");
    let searchStemToggle = document.getElementById("toggle-search-stem");
    let wildcardToggle = document.getElementById("toggle-wildcard");
    let fuzzyInput = document.getElementById("fuzzy-input");
    let maxResultsInput = document.getElementById("max-results-input");
    let initTimeLabel =  document.getElementById("init-time-label");
    let resultCountLabel = document.getElementById("result-count-label");
    let queryTimeLabel = document.getElementById("query-time-label");
    let displayTimeLabel = document.getElementById("display-time-label");
    let resultsContainer = document.getElementById("results-list");
    let index, searchTimeout;

    let init = function() {
        let startTime, endTime;
        startTime = Date.now();
        index = lunr(function() {
            this.ref("id");
            this.field("title");
            this.field("species");
            this.field("collector");
            this.field("structure");
            this.field("content");
            this.metadataWhitelist = ['position'];
            if(!indexStemToggle.checked) this.pipeline.remove(lunr.stemmer);
            if(!searchStemToggle.checked) this.searchPipeline.remove(lunr.stemmer);
            for(let doc in sourceData) this.add(sourceData[doc]);
        });
        endTime = Date.now();
        initTimeLabel.innerText = `${(endTime - startTime)}ms`;
    };

    let onStemSettingChange = function() {
        init();
        onSettingChange();
    };

    let onSettingChange = function() {
        if(searchInput.value != "") queryInput();
    };

    let onSearchInput = function(event) {
        clearTimeout(searchTimeout);
        if(searchInput.value != "") {
            searchTimeout = setTimeout(queryInput, 250);
        } else {
            clearResultsList();
        }
    };

    let clearResultsList = function() {
        while(resultsContainer.firstChild) resultsContainer.removeChild(resultsContainer.firstChild);
    };

    let queryInput = function(event) {
        let queryTokens = lunr.tokenizer(searchInput.value);
        let startTime, endTime, resultData;
        startTime = Date.now();
        resultData = index.query(function(query) {
            query.term(queryTokens);
            if(wildcardToggle.checked) query.term(queryTokens, { wildcard: lunr.Query.wildcard.TRAILING });
            if(fuzzyInput.value > 0) query.term(queryTokens, { editDistance: fuzzyInput.value });
        });
        endTime = Date.now();
        queryTimeLabel.innerText = `${(endTime - startTime)}ms`;
        displayResults(resultData);
    };

    let displayResults = function(resultData) {
        let resultsNumber = (resultData.length < maxResultsInput.value) ? resultData.length : maxResultsInput.value;
        let resultsFragment = document.createDocumentFragment();
        let startTime, endTime;
        resultCountLabel.innerText = `${resultsNumber}`;
        startTime = Date.now();
        clearResultsList();
        for(let i = 0; i < resultsNumber; i++) {
            let formattedResult = getFormattedResult(resultData[i], sourceData[resultData[i].ref]);
            let resultDiv = createResultElement(formattedResult);
            resultsFragment.appendChild(resultDiv);
        }
        resultsContainer.appendChild(resultsFragment);
        endTime = Date.now();
        displayTimeLabel.innerText = `${(endTime - startTime)}ms`;
    };

    let getFormattedResult = function(resultData, sourceDoc) {
        let highlightData = parseHighlightData(resultData.matchData.metadata);
        let highlightedSourceHTML = {};
        for(field in sourceDoc) {
            if(highlightData[field]) {
                highlightedSourceHTML[field] = getHighlightedHTML(highlightData[field], sourceDoc[field]);
            } else {
                highlightedSourceHTML[field] = createCompositElement("span", [ document.createTextNode(sourceDoc[field]) ]);
            }
        }
        if(highlightedSourceHTML.title && sourceDoc.titlePrefix) highlightedSourceHTML.title.prepend( document.createTextNode(`${sourceDoc.titlePrefix} `) );
        return highlightedSourceHTML;
    };

    let parseHighlightData = function(tokenPositionData) {
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

    let getHighlightedHTML = function(highlightData, sourceContent) {
        let resultEl = document.createElement("span");
        for(let i = 0; i < highlightData.length; i++) {
            let prevData = highlightData[i - 1];
            let startPos = (prevData) ? prevData[0] + prevData[1] : 0;
            let highlightStartPos = highlightData[i][0];
            let highlightEndPos = highlightData[i][0] + highlightData[i][1];
            let preText = sourceContent.substring(startPos, highlightStartPos);
            let highlightText =  sourceContent.substring(highlightStartPos, highlightEndPos);
            let highlightSpan = createCompositElement("span", [ document.createTextNode(highlightText) ]);
            highlightSpan.classList.add("highlighted-text");
            resultEl.appendChild(document.createTextNode(preText));
            resultEl.appendChild(highlightSpan);
            if(i == highlightData.length - 1) {
                let trailingText = sourceContent.substring(highlightEndPos);
                resultEl.appendChild(document.createTextNode(trailingText));
            }
        }
        return resultEl;
    };

    let createResultElement = function(resultHTML) {
        let resultChildrenEls;
        if(resultHTML.species || resultHTML.collector || resultHTML.structure) {
            let metadataDiv = document.createElement("div");
            if(resultHTML.species) metadataDiv.appendChild( createCompositElement("span", [document.createTextNode("Species: "), resultHTML.species]) );
            if(resultHTML.collector) metadataDiv.appendChild( createCompositElement("span", [document.createTextNode("Collector: "), resultHTML.collector]) );
            if(resultHTML.structure) metadataDiv.appendChild( createCompositElement("span", [document.createTextNode("Structure: "), resultHTML.structure]) );
            for(let child of metadataDiv.children) child.classList.add("metadata-entry");
            resultChildrenEls = [ 
                createCompositElement("h2", [resultHTML.title]), 
                metadataDiv, 
                createCompositElement("p", [resultHTML.content]) 
            ];
        } else {
            resultChildrenEls = [ 
                createCompositElement("h2", [resultHTML.title]), 
                createCompositElement("p", [resultHTML.content]) 
            ];
        }
        return createCompositElement("li", resultChildrenEls);
    };

    let createCompositElement = function(type, children) {
        let el = document.createElement(type);
        for(let child of children) {
            if(child != undefined) el.appendChild(child);
        }
        return el;
    };

    init();
    searchInput.addEventListener("input", onSearchInput);
    indexStemToggle.addEventListener("input", onStemSettingChange);
    searchStemToggle.addEventListener("input", onStemSettingChange);
    wildcardToggle.addEventListener("input", onSettingChange);
    fuzzyInput.addEventListener("input", onSettingChange);
    maxResultsInput.addEventListener("input", onSettingChange);

}