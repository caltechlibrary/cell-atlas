/**
 * Turns a dom element into a search widget.
 *
 * @param root The dom element being registered as a search widget.
 */
let SearchWidget = function(root) {

    // Create frequently used variables and references to frequently used dom elements.
    let searchBarInput = root.querySelector(".search-widget__search-bar-input");
    let searchExitBtn = root.querySelector(".search-widget__exit-btn");
    let resultList = root.querySelector(".search-widget__result-list");
    let maxResults = 15;
    let maxResultChars = 150;
    let initialized = false;
    let searchData, index, searchTimeout;

    /**
     * Called on first searchBarInput focus. Initializes widget 
     * by fetching search data and creating the search index.
     */
    let init = function() {
        fetch("searchData.json")
            .then(function(res) { return res.json() })
            .then(createSearchData);
    };

    /**
     * Creates search index used by this widget from 
     * a search data object.
     * 
     * Uses [lunr](https://lunrjs.com/guides/getting_started.html) 
     * to create index.
     *
     * @param data search data object used for index creation.
     */
    let createSearchData = function(data) {
        // Source text is not returned in lunr search results. We store searchData to use in displaying search result snippets.
        searchData = data;

        /**
         * Example lunr index creation can be found at https://lunrjs.com/guides/getting_started.html and 
         * configuration docs can be found at https://lunrjs.com/docs/lunr.Builder.html
         */
        index = lunr(function() {
            // Set the search data property that will be used as search result identifier in index.
            this.ref("id");

            // Set searchable fields from our search data.
            this.field("title");
            this.field("species");
            this.field("collector");
            this.field("structure");
            this.field("content");

            // Opt in to enable lunr to return match position data in search results so we can highlight them in text for users.
            this.metadataWhitelist = ['position'];
            
            /**
             * Remove stemming from the indexed documents and while searching. More on stemming can be found here:
             * https://lunrjs.com/guides/core_concepts.html#stemming
             */
            this.pipeline.remove(lunr.stemmer);
            this.searchPipeline.remove(lunr.stemmer);

            // Finally, add the search data documents to the search index.
            for(let doc in data) this.add(data[doc]);
        });

        initialized = true;
    };

    /**
     * Called on searchBarInput input. Initializes search query.
     */
    let onSearchBarInput = function() {
        // Search functionality is dependent on search index being initialized.
        if(initialized) {
            // Clear possible prev search timeout since queries are fired after an input delay and old query is no longer relevant.
            clearTimeout(searchTimeout);

            if(searchBarInput.value.trim().length != 0) {
                // Start timeout to query input in 0.25s to avoid searching while user is still typing.
                searchTimeout = setTimeout(querySearchBarInput, 250);
            } else {
                // We want to remove the result list when there is no input.
                resetResultList();
            }
        }
    };

    /**
     * Query index with searchBarInput value and display 
     * results.
     */
    let querySearchBarInput = function() {
        // For docs on how to build lunr queries: https://lunrjs.com/docs/lunr.Query.html
        let queryTokens = lunr.tokenizer(searchBarInput.value);

        resultData = index.query(function(query) {
            // Search the tokens as is.
            query.term(queryTokens);
            // Search the tokens with trailing wildcards.
            query.term(queryTokens, { wildcard: lunr.Query.wildcard.TRAILING });
            // Search the tokens for results that have a 1 letter difference.
            query.term(queryTokens, { editDistance: 1 });
        });

        // Prevent display of empty results. This prevents empty list being displayed as well as persisting previous search results.
        if(resultData.length >= 1) displayResults(resultData);
    };

    /**
     * Displays results from index query to result 
     * list.
     * 
     * @param resultData results returned from lunr query. 
     */
    let displayResults = function(resultData) {
        let resultsNum = (resultData.length < maxResults) ? resultData.length : maxResults;

        clearResultsList();

        // Loop over each result and display it to resultList
        for(let i = 0; i < resultsNum; i++) {
            // Get object of result fields (title, content, etc) mapped to html fragments with matches highlighted in html.
            let formattedResultEls = getFormattedResultEls(resultData[i], searchData[resultData[i].ref]);
            // Use fragments to contruct result list entry "li" dom element.
            let resultEntryEl = createResultEntryElement(formattedResultEls, searchData[resultData[i].ref]);
            
            resultList.appendChild(resultEntryEl);

            // Append result list entry separator after each result (except the last one).
            if(i != resultsNum - 1) {
                let resultEntrySeparatorEl = document.createElement("div");
                resultEntrySeparatorEl.classList.add("search-widget__result-separator");
                resultList.appendChild(resultEntrySeparatorEl);
            }
        }

        /**
         * Show result list after appending all results. Perhaps this can be simplified by resultList list visibility being 
         * dependent on parent modifier class like "search-widget--showing-results".
         */
        resultList.classList.remove("search-widget__result-list--hidden");
        root.classList.add("search-widget--showing-results");
    };

    /**
     * Empties and hides widget result list.
     */
    let resetResultList = function() {
        clearResultsList();

        /**
         * Perhaps managing resultList visibility can be simplified by it being dependent on parent modifier class like 
         * "search-widget--showing-results".
         */
        resultList.classList.add("search-widget__result-list--hidden");
        root.classList.remove("search-widget--showing-results");
    };

    /**
     * Empties all entries in widget result list.
     */
    let clearResultsList = function() {
        while(resultList.firstChild) resultList.removeChild(resultList.firstChild);
    };

    /**
     * Returns object of source document fields mapped to 
     * html fragments with matched terms highlighted.
     * 
     * @param resultData Result object returned from lunr query.
     * @param sourceDoc Source document tied to lunr result.
     */
    let getFormattedResultEls = function(resultData, sourceDoc) {
        // Get object mapping source doc fields to positional matched term data.
        let formattedHighlightData = getFormattedHighlightData(resultData.matchData.metadata);

        let formattedResultEls = {};

        // Create html fragments for each field in source document.
        for(field in sourceDoc) {
            if(formattedHighlightData[field]) {
                // If field has matched terms, build html fragment with matched terms highlighted.
                // Get object of matched term data and source content transformed to only display max character count.
                let truncatedResources = getTruncatedResources(formattedHighlightData[field], sourceDoc[field]);
                formattedResultEls[field] = getFormattedHTML(truncatedResources.highlightData, truncatedResources.sourceContent);
            } else {
                // If field has no matched terms, build html fragment with plain text.
                let truncatedSourceContent = (sourceDoc[field].length > maxResultChars) ? `${sourceDoc[field].substring(0, maxResultChars)}...` : sourceDoc[field];
                let resultEl = document.createDocumentFragment();
                let sourceContentTextNode = document.createTextNode(truncatedSourceContent);
                resultEl.appendChild(sourceContentTextNode);
                formattedResultEls[field] = resultEl;
            }
        }

        // Some source docs have non-searchable title prefixes. Append those to html title fragment.
        if(formattedResultEls.title && sourceDoc.titlePrefix) formattedResultEls.title.prepend( document.createTextNode(`${sourceDoc.titlePrefix} `) );
        
        return formattedResultEls;
    };

    /**
     * Returns transformed lunr search result match data metadata 
     * object into object of source doc fields/matched term 
     * position data key/value pairs.
     * 
     * @param tokenPositionData lunr result match data metadata 
     * object.
     */
    let getFormattedHighlightData = function(tokenPositionData) {
        /**
         * Unfortunately, I could not find lunr docs containing result match data structure. We are 
         * basically transforming data like this:
         * 
         * {
        *   "match term": {
        *    "source doc field": [position data],
        *    "source doc field": [position data],
        *    ...
        *   }
        * }
        * 
        * to this:
        * 
        * {
        *  "source doc field": [matched terms position data]
        * }
         */

        let highlightData = {};

        // Loop through matched terms in given lunr result match data metadata object.
        for(let token in tokenPositionData) {
            let positionData = tokenPositionData[token];
            // Loop through fields that matched term was found in.
            for(let field in positionData) {
                if(highlightData[field]) {
                    // If we have data on this field already, add positional matched term data to that data.
                    highlightData[field] = highlightData[field].concat(positionData[field].position);
                } else {
                    // If we don't have data on this field, create new data with current matched term data.
                    highlightData[field] = [].concat(positionData[field].position);
                }
            }
        }

        // Sort each fields matched term positional data in ascending order.
        for(field in highlightData) highlightData[field].sort(function(a, b) { return a[0] - b[0] });

        return highlightData;
    };

    /**
     * Returns transformed source content and matched positional 
     * data to be within max character search result count.
     * 
     * @param highlightData Array of matched term positional 
     * data.
     * @param sourceContent String of source content with 
     * matched terms.
     */
    let getTruncatedResources = function(highlightData, sourceContent) {
        // If source content is already under max character count, resources are already truncated.
        if(sourceContent.length <= maxResultChars) return { highlightData, sourceContent };

        // Truncate resources so that 1st matched term in source content is in the middle.
        let highlightStart = highlightData[0][0];
        let highlightStartLength = highlightData[0][1];
        // Get amount of characters that will be before/after matched term.
        let surroundingCharCount = Math.floor((maxResultChars - highlightStartLength) / 2);
        let truncatedHighlightData, truncatedSourceString;
        if(highlightStart < surroundingCharCount) {
            // If 1st matched term is within half max characters away from the beggining, truncate the end.
            truncatedSourceString = `${sourceContent.substring(0, maxResultChars)}...`;
            // Remove matched term positional data that appears after truncated resource.
            truncatedHighlightData = highlightData.filter(function(highlightDatum) { 
                return (highlightDatum[0] + highlightDatum[1]) < maxResultChars;
            });
        } else if(highlightStart > sourceContent.length - surroundingCharCount) {
            // If 1st matched term is within half max characters away from the beggining, truncate beggining.
            let truncatedStart = sourceContent.length - maxResultChars;
            truncatedSourceString = `...${sourceContent.substring(truncatedStart)}`;
            /** 
             * Remove matched term positional data that appears before truncated resource and modify positional values to be 
             * relative to new truncated resource. 
            */
            truncatedHighlightData = highlightData.filter(function(highlightDatum) { 
                return highlightDatum[0] > truncatedStart;
            }).map(function(highlightDatum) {
                return [(highlightDatum[0] - truncatedStart) + 3, highlightDatum[1]];
            });
        } else {
            // If 1st matched term is not within half mac characters of the beggining or end, truncate on both sides.
            let truncatedStart = highlightStart - surroundingCharCount;
            let truncatedEnd = highlightStart + highlightStartLength + surroundingCharCount;
            truncatedSourceString = `...${sourceContent.substring(truncatedStart, truncatedEnd)}...`;
            /** 
             * Remove matched term positional data that appears before/after truncated resource and modify positional values to be 
             * relative to new truncated resource. 
            */
            truncatedHighlightData = highlightData.filter(function(highlightDatum) { 
                return highlightDatum[0] > truncatedStart && (highlightDatum[0] + highlightDatum[1]) < truncatedEnd;
            }).map(function(highlightDatum) {
                return [(highlightDatum[0] - truncatedStart) + 3, highlightDatum[1]];
            });
        }

        return { highlightData: truncatedHighlightData, sourceContent: truncatedSourceString };
    };

    /**
     * Returns html fragment of source content with 
     * matched terms highlighted.
     * 
     * @param highlightData Array of matched term positional 
     * data.
     * @param sourceContent String source content.
     */
    let getFormattedHTML = function(highlightData, sourceContent) {
        let formattedFragment = document.createDocumentFragment();
        /**
         * Build html fragment by looping through matched terms and appending text after last matched term and 
         * current highlighted term.
         */
        for(let i = 0; i < highlightData.length; i++) {
            // Get substring start position from the end of last matched term (or 0 if at the beggining).
            let prevData = highlightData[i - 1];
            let startPos = (prevData) ? prevData[0] + prevData[1] : 0;

            // Get substring positions of matched term.
            let highlightStartPos = highlightData[i][0];
            let highlightEndPos = highlightStartPos + highlightData[i][1];

            // Get text node of source text leading up to matched term.
            let preText = sourceContent.substring(startPos, highlightStartPos);
            let preTextNode = document.createTextNode(preText);

            // Create html span element for matched term that will have highlighted class.
            let highlightText =  sourceContent.substring(highlightStartPos, highlightEndPos);
            let highlightTextNode = document.createTextNode(highlightText);
            let highlightedSpan = document.createElement("span");
            highlightedSpan.classList.add("search-widget__result-highlight");
            highlightedSpan.appendChild(highlightTextNode);

            formattedFragment.appendChild(preTextNode);
            formattedFragment.appendChild(highlightedSpan);

            // If we are at last highlighted term, append trailing text to fragment as we will not loop over that.
            if(i == highlightData.length - 1) {
                let trailingText = sourceContent.substring(highlightEndPos);
                let trailingTextNode = document.createTextNode(trailingText)
                formattedFragment.appendChild(trailingTextNode);
            }
        }

        return formattedFragment;
    };

    /**
     * Returns search result list item from source 
     * doc html fragments.
     * 
     * @param formattedResultEls object of source doc 
     * fields/formatted html fragment key/value pairs.
     * @param sourceDoc source doc associated with 
     * this search result.
     */
    let createResultEntryElement = function(formattedResultEls, sourceDoc) {
        // entryElement is the parent result list item to be returned.
        let entryElement = document.createElement("li");
        let linkEl = document.createElement("a");
        let contentEl = document.createElement("p");

        entryElement.classList.add("search-widget__result-entry");
        linkEl.classList.add("search-widget__result-link");
        // The id of each search doc is the page it is located on.
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

        // Content element needs to be appended last so it can display under title and metadata.
        entryElement.appendChild(contentEl);

        return entryElement;
    };

    /**
     * Returns search result metadata element from 
     * metadata html fragment.
     * 
     * @param preText text label displayed in metadata 
     * field.
     * @param metadataEl html fragment
     */
    let createMetadataEntryEl = function(preText, metadataEl) {
        let metadataEntryEl = document.createElement("span");
        let preTextNode = document.createTextNode(preText);
        /**
         * Search result metadata elements are displayed differently in header and nav menu. This would be better handled through 
         * a parent modifier class (.search-widget--header .search-widget__metadata-entry) to prevent management in js.
         */
        if(root.classList.contains("search-widget--header")) {
            metadataEntryEl.classList.add("search-widget__metadata-entry--header");
        } else {
            metadataEntryEl.classList.add("search-widget__metadata-entry--nav-menu");
        }

        metadataEntryEl.appendChild(preTextNode);
        metadataEntryEl.appendChild(metadataEl);

        return metadataEntryEl;
    };

    /**
     * Called on searchBarInput focus. Shows search exit button.
     */
    let autoShowSearchExitBtn = function() {
        searchExitBtn.classList.remove("search-widget__exit-btn--hidden");
    };

    /**
     * Called on searchExitBtn click. Resets search 
     * widget to initial state.
     */
    let onSearchExitBtnClick = function() {
        resetResultList();
        searchExitBtn.classList.add("search-widget__exit-btn--hidden");
        searchBarInput.value = "";
    };

    // Add neccessary event listeners to dom elements.
    searchBarInput.addEventListener("focus", init, { once: true });
    searchBarInput.addEventListener("input", onSearchBarInput);
    searchBarInput.addEventListener("focus", autoShowSearchExitBtn);
    searchExitBtn.addEventListener("click", onSearchExitBtnClick);

};