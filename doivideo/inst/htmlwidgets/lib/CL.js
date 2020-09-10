/**
 * CL-core.js provides browser side JavaScript access to
 * Caltech Library resources (e.g. feeds.library.caltech.edu).
 * It also provides common functions and objects used in various
 * Caltech Library projects.
 *
 * @author R. S. Doiel
 *
Copyright (c) 2019, Caltech
All rights not granted herein are expressly reserved by Caltech.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* jshint esversion: 6 */
(function (document, window) {
    "use strict";
    /* CL is our root object */
    let CL = {},
        Version = 'v0.1.12';


    if (window.CL === undefined) {
        window.CL = CL;
    } else {
        CL = Object.assign(CL, window.CL);
    }
    CL.Version = Version;

    /**
     * CL.pipeline() takes a data, error and list of functions as
     * parameters.  It then creates a clone of the current state
     * adds adds the list of functions passed to .pipelineFns as
     * well as a .nextCalbackFn() method that is will take the
     * data and error parameters after shifting the first function
     * in .pipelineFns and envoking it with the data and error
     * parameters. The shifted out callback can then envoke
     * this.nextCallbackFn(data, err) as needed to continue the
     * pipe line.
     *
     * @params data (any valid JavaScript type)
     * @params err (string) holds an error message from calling function
     * @params ...pipelineFns (split of functions), functions to run the pipeline with.
     */
    CL.pipeline = function(data, err, ...pipelineFns) {
        let self = this;
        if (pipelineFns.length < 1) {
            console.log("ERORR: empty pipeline");
            return;
        }
        self.pipelineFns = pipelineFns;
        self.nextCallbackFn = function (data, err) {
            let obj = Object.assign({}, self);
            obj.callbackFn = self.pipelineFns.shift();
            if (obj.callbackFn === undefined) {
                return;
            }
            obj.callbackFn(data, err);
        };
        if (self.pipelineFns.length > 0) {
            self.nextCallbackFn(data, err);
        }
    };

    /**
     * setAttribute is used to populate a collection of attributes
     * used by various functions (e.g. recentN and viewer). It is
     * a simple map of function name to JavaScript value.
     *
     * @param name the name of the attribute (e.g. recentN, viewer)
     * @param value the value to associate with the name
     */
    CL.setAttribute = function (name, value) {
        let self = this;
        if (self._attributes === undefined) {
            self._attributes = new Map();
        }
        self._attributes.set(name, value);
    };

    /**
     * CL.getAttribute() returns the value if the attribute or undefined
     * if not found.
     *
     * @param name the name of the attribute to retrieve
     * @return the value of attribute or undefined if not found.
     */
    CL.getAttribute = function(name) {
        let self = this;
        if (self._attributes !== undefined &&
            self._attributes.has(name)) {
            return self._attributes.get(name);
        }
    };

    /**
     * CL.hasAttribute() returns true if attribute exists, false otherwise
     *
     * @param name the name of the attribute to check
     * @return true if found, false otherwise
     */
    CL.hasAttribute = function(name) {
        let self = this;
        if (self._attributes !== undefined) {
            return self._attributes.has(name);
        }
        return false;
    };


    /**
     * CL.httpGet() - makes an HTTP get request and returns the results
     * via callbackFn.
     *
     * @param url (a URL object) the assembled URL (including any GET args)
     * @param contentType - string of indicating mime type
     *        (e.g. text/html, text/plain, application/json)
     * @param callbackFn - an function to handle the callback,
     *        function takes two args data (an object) and
     *        error (a string)
     */
    CL.httpGet = function (url, contentType, callbackFn) {
        let self = this,
            xhr = new XMLHttpRequest(),
            page_url = new URL(window.location.href);
        xhr.onreadystatechange = function () {
            // process response
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status == 200) {
                    let data = xhr.responseText;
                    if (contentType === "application/json" && data !== "") {
                        data = JSON.parse(xhr.responseText);
                    }
                    callbackFn(data, "");
                } else {
                    callbackFn("", xhr.status);
                }
            }
        };

        /* NOTE: Check to see if we should turn a string version of URL
         * into a URL object. Handle case of applying a BaseURL prefix
         * if protocol/host is missing */
        if (typeof url === "string") {
            if (url.startsWith("/") && self.BaseURL !== undefined) {
                /* NOTE: combined our BaseURL string with url as
                 * root relative pathname, then re-cast to URL object */
                url = new URL(self.BaseURL + url);
            } else {
                url = new URL(url);
            }
        }
        if (page_url.username !== undefined && url.username === undefined) {
            url.username = page_url.username;
        }
        if (page_url.password !== undefined && url.password == undefined) {
            url.password = page_url.password;
        }

        /* we always want JSON data */
        xhr.open('GET', url, true);
        if (url.pathname.includes(".json.gz") || url.pathname.includes(".js.gz")) {
            xhr.setRequestHeader('Content-Encoding', 'gzip');
        }
        if (contentType !== "" ) {
            xhr.setRequestHeader('Content-Type', contentType);
        }
        if (self.hasAttribute("progress_bar")) {
            let progress_bar = self.getAttribute("progress_bar");
            xhr.onprogress = function(pe) {
                if (pe.lengthComputable) {
                    progress_bar.max = pe.total;
                    progress_bar.value = pe.loaded;
                }
            };
            xhr.onloadend = function(pe) {
                progress_bar.value = pe.loaded;
            };
        }
        xhr.send();
    };

    /**
     * CL.httpPost() - makes an HTTP POST request and returns the results
     * via callbackFn.
     *
     * @param url (string) the assembled URL (including any GET args)
     * @param contentType - string of indicating mime type
     *        (e.g. text/html, text/plain, application/json)
     * @param payload - the text you want to POST
     * @param callbackFn - an function to handle the callback,
     *        function takes two args data (an object) and
     *        error (a string)
     */
    CL.httpPost = function (url, contentType, payload, callbackFn) {
        let self = this,
            xhr = new XMLHttpRequest(),
            page_url = new URL(window.location.href);
        xhr.onreadystatechange = function () {
            // process response
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status == 200) {
                    let data = xhr.responseText;
                    if (contentType === "application/json" && data !== "") {
                        data = JSON.parse(xhr.responseText);
                    }
                    callbackFn(data, "");
                } else {
                    callbackFn("", xhr.status);
                }
            }
        };

        /* NOTE: Check to see if we should turn a string version of URL
         * into a URL object. Handle case of applying a BaseURL prefix
         * if protocol/host is missing */
        if (typeof url == "string") {
            if ( url.startsWith("/") && self.BaseURL !== undefined) {
                url = new URL(self.BaseURL + url);
            } else {
                url = new URL(url);
            }
        }
        if (page_url.username !== undefined && url.username === undefined) {
            url.username = page_url.username;
        }
        if (page_url.password !== undefined && url.password == undefined) {
            url.password = page_url.password;
        }

        /* we always want JSON data */
        xhr.open('POST', url, true);
        if (contentType !== "" ) {
            xhr.setRequestHeader('Content-Type', contentType);
        }
        if (self.hasAttribute("progress_bar")) {
            let progress_bar = self.getAttribute("progress_bar");
            xhr.onprogress = function(pe) {
                if (pe.lengthComputable) {
                    progress_bar.max = pe.total;
                    progress_bar.value = pe.loaded;
                }
            };
            xhr.onloadend = function(pe) {
                progress_bar.value = pe.loaded;
            };
        }
        xhr.send(payload);
    };

    window.CL = Object.assign(window.CL, CL);
}(document, window));
/**
 * CL-ui.js provides browser side JavaScript form building
 * functions for Caltech Library resources (e.g. feeds.library.caltech.edu).
 *
 * @author R. S. Doiel
 *
Copyright (c) 2019, Caltech
All rights not granted herein are expressly reserved by Caltech.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* jshint esversion: 6 */
(function(document, window) {
    "use strict";
    let CL = {};
    if (window.CL === undefined) {
        window.CL = {};
    } else {
        CL = Object.assign({}, window.CL);
    }

    /**
     * __template processes a Python-like template string,
     * containing object attribute names with
     * prefixes of `{{` and suffixes of `}}` and replaces
     * them with the attributes's value. The processed string
     * is then returned by the function.
     */
    function __template(tmpl, obj, sep = "") {
        let out = tmpl;
        for (let key in obj) {
            let re = new RegExp('{{' + key + '}}', 'g');
            if (obj[key] === undefined) {
                console.log(`ERROR: you have assigned 'undefined' to object attribute, ${key} -> ${obj[key]}`);
            } else if (Array.isArray(obj[key])) {
                let a = [];
                for (let i in obj[key]) {
                    if (obj[key][i].html !== undefined) {
                        a.push(obj[key][i].html())
                    }
                }
                out = out.replace(re, a.join(sep));
            } else if (obj[key].html !== undefined) {
                out = out.replace(re, obj[key].html())
            } else {
                out = out.replace(re, obj[key])
            }
        }
        return out;
    }

    /**
     * field takes a default_attributes object, a template
     * string and an optional init function. It returns
     * an object that has the following functions - init(), get(), set(),
     * html(), and json().
     *
     * Example:
     *
     *      creator = CL.field({
     *          last_name: "Jones",
     *          first_name: "Henry",
     *          birth_date: "July 1, 1899"
     *          },
     *          '<div>' +
     *          '   <label>Last Name:</label>' +
     *          '   <input name="last_name" value="{{last_name}}">' +
     *          '</div>' +
     *          '<div>' +
     *          '  <label>First Name:</label>' +
     *          '  <input name="first_name" value="{{first_name}}">' +
     *          '</div>' +
     *          '<div>' +
     *          '  <label>Birth Date:</label>' +
     *          '  <input name="birth_date" value="{{birth_date}}">' +
     *          '</div>',
     *          function(obj) {
     *             // Normalize date before rendering form.
     *             if (('birth_date' in obj) && obj.birth_date !== "") {
     *                dt = new Date(obj.birth_date);
     *                obj.birth_date = dt.toDateString()
     *             }
     *          });
     *
     *     // Render as HTML
     *     element.innerHTML = creator.html();
     */
    CL.field = function(attributes, template_string, init_function = undefined, sep = "") {
        let obj = new Object();
        // Shallow copy of object attributes
        for (let key in attributes) {
            obj[key] = attributes[key];
        }
        // Attach our init function
        if (init_function === undefined) {
            //NOTE: Our default init function always succeeds.
            obj.init = function () { return true };
        } else {
            //NOTE: User supplied init_function should return
            // true on success, false otherwise.
            obj.init = init_function;
        }
        // Add our get(), set(), html(), and json functions()
        obj.get = function(key, error_value) {
            let self = this;

            if (key in self) {
                return self[key];
            }
            if (error_value == undefined) {
                return null;
            }
            return error_value;
        }
        obj.set = function(key, value){
            let self = this;
            obj[key] = value;
        }
        obj.html = function() {
            let obj = this;
            return __template(template_string, obj, sep);
        }
        obj.json = function() {
            let self = this;
            return JSON.stringify(self);
        }
        return obj;
    }

    /**
     * assembleFields takes a DOM element and appends new
     * DOM elements from the html() rendering of the individual
     * fields passed to CL.assembleFields().
     *
     * Example:
     *
     *     let book = {},
     *         books = [],
     *         creators = [],
     *         steinbeck = {
     *            last_name: "Steinbeck",
     *            first_name: "John"
     *         },
     *         pratchett = {
     *            last_name: "Pratchett",
     *            first_name: "Terry"
     *         },
     *         gaiman = {
     *            last_name: "Gaiman",
     *            first_name: "Neil",
     *         };
     *
     *     steinbeck = CL.field(steinbeck,
     *         '<span class="last_name">{{last_name}}</span>, ' +
     *         '<span class="first_name">{{first_name}}</span>');
     *
     *     creators = CL.field({"creators": [ steinbeck ]},
     *         '<div class="creators">By {{creators}}</div>',
     *         sep = '; ');
     *
     *     book = CL.field({
     *          "title": "Short Reign of Pippen IV"
     *          "description": "A novella length satire set in post-war Paris",
     *          "creators": creators
     *         },
     *         '<div class="book">' +
     *         '   <div class="title">{{title}}</div>' +
     *         '   <div class="creators">By {{creators}}</div>' +
     *         '   <div class="description">{{description}}</div>' +
     *         '</div>'
     *         undefined, '; ');
     *     books.push(book);
     *
     *     pratchett = CL.field(pratchett,
     *         '<span class="last_name">{{last_name}}</span>, ' +
     *         '<span class="first_name">{{first_name}}</span>');
     *
     *     gaimen = CL.field(gaimen,
     *         '<span class="last_name">{{last_name}}</span>, ' +
     *         '<span class="first_name">{{first_name}}</span>');
     *
     *     creators = CL.field({"creators": [ pratchett, gaimen ]},
     *         '<div class="creators">By {{creators}}</div>',
     *         sep = '; ');
     *
     *     // NOTE: We attach normalizeBookData for the init function
     *     // which is called by assembleFields initializing the
     *     // data before rendering.
     *     book = CL.field({
     *          "title": "Good Omens"
     *          "description": "A book about angels and demons set in London for the most part",
     *          "creators": creators
     *         },
     *         '<div class="book">' +
     *         '   <div class="title">{{title}}</div>' +
     *         '   <div class="creators">By {{creators}}</div>' +
     *         '   <div class="description">{{description}}</div>' +
     *         '</div>'
     *         normalizeBook, '; ');
     *     books.push(book);
     *
     *     let element = CL.assembleFields(
     *          document.getElementById("featured-book"), ...books);
     *
     */
    CL.assembleFields = function(element, ...field_list) {
        let fields = field_list;

        element.innerHTML = "";
        if (Array.isArray(fields)) {
            for (let key in fields) {
                if (fields[key].init !== undefined &&
                        fields[key].html !== undefined) {
                    fields[key].init();
                    element.innerHTML += fields[key].html();
                }
            }
        } else if (fields.html !== undefined) {
            element.innerHTML += fields.html();
        }
        return element;
    }

    /*
     * NOTE: we need to update the global CL after
     * adding our methods
     */
    if (window.CL === undefined) {
        window.CL = {};
    }
    window.CL = Object.assign(window.CL, CL);
}(document, window));
/**
 * CL-core.js provides browser side JavaScript access to
 * feeds.library.caltech.edu and other Caltech Library resources.
 *
 * @author R. S. Doiel
 *
Copyright (c) 2019, Caltech
All rights not granted herein are expressly reserved by Caltech.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* jshint esversion: 6 */
(function (document, window) {
    "use strict";
    /* CL is our root object */
    let CL = {};

    if (window.CL === undefined) {
        window.CL = CL;
    } else {
        CL = Object.assign(CL, window.CL);
    }

    /********************
     * FeedsBaseURL: this normally should be
     *
     *        https://feeds.library.caltech.edu
     *
     * It maybe changed to support testing and development
     * versions of feeds content.
     ********************/
    CL.FeedsBaseURL = 'https://feeds.library.caltech.edu';

    /**
     * getFeed allows you to fetch the raw feed as plain text.
     * You can use this to form your own custom queries or as
     * a debug tool.
     *
     * @param feedURL (string, required) the URL to fetch
     * @param callbackFn (function, required) the callback function
     *        to process the results the callaback function has two
     *        parameters data and err where err is a string holding
     *        an error message if something went wrong or an empty
     *        string if everything was successful. data will hold any
     *        data returned
     */
    CL.getFeed = function (feedURL, callbackFn) {
        this.httpGet(feedURL, "text/plain", callbackFn);
    };

    /**
     * CL.getPeopleList() fetches the group list as an array of group objects.
     *
     * @param callbackFn (function, required) is the function that processes the list.
     */
    CL.getPeopleList = function (callbackFn) {
       let self = this,
            url = self.FeedsBaseURL + "/people/people_list.json";
       this.httpGet(url, "application/json", callbackFn);
    };

    /**
     * CL.getPeopleInfo() fetch the /people/[peopleID]/people.json
     * so you can build a list of available feed types (e.g. article, recent/article).
     * and other useful this.
     *
     * @param peopleID (string, required) e.g. Newman-D-K
     * @param callbackFn (function, required) is a function that has two parameters - data and error
     */
    CL.getPeopleInfo = function (peopleID, callbackFn) {
        let self = this,
            url = self.FeedsBaseURL + "/people/" + peopleID + "/people.json";
        this.httpGet(url, "application/json", callbackFn);
    };


    /**
     * CL.getPeopleInclude() fetches a people based HTML include feed
     * and envokes the callback function provided.
     *
     * @param personID - an internal Caltech Library Person identifier
     *          like the creator ID used in EPrints repository systems.
     * @param feedName string (e.g. combined, article, book, monograph)
     * @param callbackFn is a function that has two parameters - data and error
     */
    CL.getPeopleInclude = function(personID, feedName, callbackFn) {
        let self = this,
            url = self.FeedsBaseURL + '/people/' + personID +
                '/' + feedName.toLowerCase() + '.include';
        this.httpGet(url, "text/plain", callbackFn);
    };

    /**
     * CL.getPeopleJSON() fetches person based JSON feed and envokes
     * the callback function provided.
     *
     * @param personID - an internal Caltech Library Person identifier
     *          like the creator ID used in EPrints repository systems.
     * @param feedName string (e.g. combined, article, book, monograph)
     * @param callbackFn is a function that has two parameters - data and error
     */
    CL.getPeopleJSON = function (personID, feedName, callbackFn) {
        let self = this,
            url = self.FeedsBaseURL + '/people/' + personID +
            '/' + feedName.toLowerCase() + '.json';
        this.httpGet(url, "application/json", callbackFn);
    };

    /**
     * CL.getPeopleCustomJSON() fetchs the people based JSON feed and
     * filters against a list of ids before calling the callback function
     * provided.
     *
     * @param peopleID - a string identifying the people found in the people URL of feeds
     * @param feedName string (e.g. combined, article, book, monograph)
     * @param idList is a JavaScript list of ids to filter against
     * @param callbackFn is a function that has two parameters - data and error
     */
    CL.getPeopleCustomJSON = function (peopleID, feedName, idList, callbackFn) {
        let self = this,
            url = self.FeedsBaseURL + '/people/' + peopleID +
            '/' + feedName.toLowerCase() + '.json';
        this.httpGet(url, "application/json", function(object_list, err) {
            if (err != "") {
                callbackFn([], err);
                return;
            }
            let object_map = {},
                filtered_list = [];

            /* Build a map of id to item */
            object_list.forEach(function(obj) {
                let key = obj._Key;
                object_map[key] = obj;
            });
            /* Using our map, build our filtered list */
            idList.forEach(function (id) {
                let key = id.toString();
                if (key in object_map) {
                    filtered_list.push(object_map[key]);
                }
            });
            /* Now we're ready to pass to the callback function */
            callbackFn(filtered_list, "");
        });
    };

    /**
     * CL.getPeopleKeys() fetches a person based list of keys and
     * the callback function provided.
     *
     * @param personID - an internal Caltech Library Person identifier
     *          like the creator ID used in EPrints repository systems.
     * @param feedName string (e.g. combined, article, book, monograph)
     */
    CL.getPeopleKeys = function(personID, feedName, callbackFN) {
        let self = this,
            url = self.FeedsBaseURL + '/people/' + personID + '/' + feedName.toLowerCase() + '.keys';
        this.httpGet(url, "text/plain", function (data, err) {
            if (err) {
                callbackFn([], err);
                return;
            }
            callbackFn(data.split("\n"), err);
        });
    };

    /**
     * CL.getGroupsList() fetches the group list as an array of group objects.
     *
     * @param callbackFn is the function that processes the list.
     */
    CL.getGroupsList = function(callbackFn) {
       let self = this,
            url = self.FeedsBaseURL + "/groups/group_list.json";
       this.httpGet(url, "application/json", callbackFn);
    };

    /**
     * CL.getGroupInfo() fetch the /groups/GROUP_ID/group.json
     * so you can build a list of available feed types (e.g. article, recent/article).
     * and other useful this.
     *
     * @param groupID (string, required) e.g. GACIT, COSMOS, Caltech-Library
     * @param callbackFn is a function that has two parameters - data and error
     */
    CL.getGroupInfo = function (groupID, callbackFn) {
        let self = this,
            url = self.FeedsBaseURL + "/groups/" + groupID + "/group.json";
        this.httpGet(url, "application/json", callbackFn);
    };

    /**
     * CL.getGroupSummary() fetches the group summary data which
     * may include description, aprox_start, aprox_end as well as
     * alternative names.
     *
     * @param groupID - a string identifying the group like that found in the group URL of feeds
     * @param callbackFn is a function that has two parameters - data and error
     */
    CL.getGroupSummary = function(groupID, callbackFn) {
        let self = this,
            url = self.FeedsBaseURL + '/groups/' + groupID +
            '/group.json';
        this.httpGet(url, "application/json", function(data, err) {
            if (err) {
                callbackFn({}, err);
                return;
            }
            // Prune the object to a summary
            if ('_Key' in data) {
                delete data._Key;
            }
            if ('email' in data) {
                delete data.email;
            }
            if ('CaltechTHESIS' in data) {
                delete data.CaltechTHESIS;
            }
            if ('CaltechAUTHORS' in data) {
                delete data.CaltechAUTHORS;
            }
            if ('CaltechDATA' in data) {
                delete data.CaltechDATA;
            }
            callbackFn(data, err);
        });
    };

    /**
     * CL.getGroupInclude() fetches a group based HTML include feed
     * and envokes the callback function provided.
     *
     * @param groupID - a string identifying the group like that found in the group URL of feeds
     * @param feedName string (e.g. combined, article, book, monograph)
     * @param callbackFn is a function that has two parameters - data and error
     */
    CL.getGroupInclude = function(groupID, feedName, callbackFn) {
        let self = this,
            url = self.FeedsBaseURL + '/groups/' + groupID +
            '/' + feedName.toLowerCase() + '.include';
        this.httpGet(url, "text/plain", callbackFn);
    };

    /**
     * CL.getGroupJSON() fetches group based JSON feed and envokes
     * the callback function provided.
     *
     * @param groupID - a string identifying the group like that found in the group URL of feeds
     * @param feedName string (e.g. combined, article, book, monograph)
     * @param callbackFn is a function that has two parameters - data and error
     */
    CL.getGroupJSON = function (groupID, feedName, callbackFn) {
        let self = this,
            url = self.FeedsBaseURL + '/groups/' + groupID +
            '/' + feedName.toLowerCase() + '.json';
        this.httpGet(url, "application/json", callbackFn);
    };

    /**
     * CL.getGroupCustomJSON() fetchs the group based JSON feed and
     * filters against a list of ids before calling the callback function
     * provided.
     *
     * @param groupID - a string identifying the group like that found in the group URL of feeds
     * @param feedName string (e.g. combined, article, book, monograph)
     * @param idList is a JavaScript list of ids to filter against
     * @param callbackFn is a function that has two parameters - data and error
     */
    CL.getGroupCustomJSON = function (groupID, feedName, idList, callbackFn) {
        let self = this,
            url = self.FeedsBaseURL + '/groups/' + groupID +
            '/' + feedName.toLowerCase() + '.json';
        this.httpGet(url, "application/json", function(object_list, err) {
            if (err != "") {
                callbackFn([], err);
                return;
            }
            let object_map = {},
                filtered_list = [];

            /* Build a map of id to item */
            object_list.forEach(function(obj) {
                let key = obj._Key;
                object_map[key] = obj;
            });
            /* Using our map, build our filtered list */
            idList.forEach(function (id) {
                let key = id.toString();
                if (key in object_map) {
                    filtered_list.push(object_map[key]);
                }
            });
            /* Now we're ready to pass to the callback function */
            callbackFn(filtered_list, "");
        });
    };


    /**
     * CL.getGroupKeys() fetches group base key list and envokes
     * the callback function provided.
     *
     * @param groupID - a string identifying the group like that found in the group URL of feeds
     * @param feedName string (e.g. combined, article, book, monograph)
     * @param callbackFn is a function that has two parameters - data and error
     */
    CL.getGroupKeys = function(groupID, feedName, callbackFn) {
        let self = this,
            url = self.FeedsBaseURL + '/groups/' + groupID +
            '/' + feedName.toLowerCase() + '.keys';
        this.httpGet(url, "text/plain", function (data, err) {
            if (err) {
                callbackFn([], err);
                return;
            }
            callbackFn(data.split("\n"), err);
        });
    };


    /**
     * CL.getPersonInclude() fetches person based HTML feed and envokes
     * the callback function provided.
     *
     * @param orcid string representation of the ORCID
     * @param feedName string (e.g. combined, article, book, monograph)
     * @param callbackFn is a function that has two parameters - data and error
     */
    CL.getPersonInclude = function (orcid, feedName, callbackFn) {
        let self = this,
            url = self.FeedsBaseURL + '/person/' + orcid + '/' + feedName.toLowerCase() + '.include';
        this.httpGet(url, "text/plain", callbackFn);
    };

    /**
     * CL.getPersonJSON() fetches person based JSON feeds and envokes the callback function provided.
     *
     * @param orcid string representation of the ORCID
     * @param feedName string (e.g. combined, article, book, monograph)
     * @param callbackFn is a function that has two parameters - data and error
     */
    CL.getPersonJSON = function (orcid, feedName, callbackFn) {
        let self = this,
            url = self.FeedsBaseURL + '/person/' + orcid + '/' + feedName.toLowerCase() + '.json';
        this.httpGet(url, "application/json", callbackFn);
    };


    /* NOTE: we need to update the global CL after adding our methods */
    if (window.CL === undefined) {
        window.CL = {};
    }
    window.CL = Object.assign(window.CL, CL);
}(document, window));
/**
 * CL-feeds-ui.js builds on the CL object providing simple support
 * for constructing DOM based UI.
 *
 * @author R. S. Doiel
 *
Copyright (c) 2019, Caltech
All rights not granted herein are expressly reserved by Caltech.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/*jshint esversion: 6 */
(function(document, window) {
    "use strict";
    let CL = {};
    if (window.CL === undefined) {
        window.CL = {};
    } else {
        CL = Object.assign({}, window.CL);
    }

    /**
     * CL.createCompositElement() takes an element type (e.g.
     * div, span, h1, a) and append children based on an array
     * of type information, ids and CSS classes.
     *
     * @param element_type (string, required) string
     * @param child_element_types (array of string, required)
     * @param child_element_ids (array of string, optional)
     * @param child_element_classes (array of string, optional)
     * @return DOM element containing children
     */
    CL.createCompositElement = function(element_type, child_element_types, child_element_ids = [], child_element_classes = []) {
        let outer = document.createElement(element_type);
        child_element_types.forEach(function(child_element_type, i) {
            let inner = document.createElement(child_element_type);
            if (i < child_element_ids.length && child_element_ids[i] !== "") {
                inner.setAttribute("id", child_element_ids[i]);
            }
            if (i < child_element_classes.length && child_element_classes[i] !== "") {
                let css_classes = [];
                if (child_element_classes[i].indexOf(" ") > -1) {
                    css_classes = child_element_classes[i].split(" ");
                } else {
                    css.classes.push(child_element_classes[i]);
                }
                css_classes.forEach(function(css_class) {
                    inner.classList.add(css_class);
                });
            }
            outer.appendChild(inner);
        });
        return outer;
    };


    /* isEPrintsRecord is an interal function, not exported. */
    function isEPrintsRecord(record) {
        if (record.collection !== undefined &&
            (record.collection === "CaltechAUTHORS" ||
                record.collection === "CaltechTHESIS")) {
            return true;
        }
        if (record.id !== undefined && typeof record.id === "string" &&
            record.id.indexOf("eprint") > -1) {
            return true;
        }
        return false;
    }

    /**
     * normalize_view is a function to use with a CL.pipeline. It expects
     * data and error parameters and will envoke `this.nextCallbackFn(data, err)`
     * before existing. The purpose of normalize_view is to extract titles, links,
     * pub_date, creator and description from both Invenion and EPrints style JSON
     * lists.
     */
    CL.normalize_view = function(data, err) {
        let self = this,
            normal_view = [];

        for (let i in data) {
            let record = data[i],
                view = {
                    "href": "",
                    "title": "",
                    "creators": [],
                    "description": "",
                    "pub_date": "",
                    "collection": "",
                    "doi": "",
                    "citation_info": {},
                    "resource_type": ""
                };
            /* Normalize our view between EPrint and Invenio style records */
            /*NOTE: maybe creating the view should be its own filter function? */
            if (isEPrintsRecord(record) === true) {
                view.collection = record.collection;
                view.title = record.title;
                if (record.type !== undefined && record.type !== "") {
                    view.resource_type = record.type;
                }
                if (record.book_title !== undefined && record.book_title !== "") {
                    view.book_title = record.book_title;
                }
                /* NOTE: we should prefer the DOI if available */
                view.href = record.official_url;
                if (record.doi !== undefined && record.doi !== "") {
                    view.doi = record.doi;
                    if (record.doi.indexOf("://") > -1) {
                        view.href = record.doi;
                    } else {
                        view.href = "https://doi.org/" + record.doi;
                    }
                }
                /* NOTE: we accumulate the possible citation fields
                 * before adding them to the view */
                let citation_info = {};
                if (record.volume !== undefined && record.volume !== "") {
                    citation_info.volume = record.volume;
                }
                /* number is issue number in Journals, Magazines */
                if (record.number !== undefined && record.number !== "") {
                    citation_info.number = record.number;
                }
                if (record.series !== undefined && record.series !== "") {
                    citation_info.series = record.series;
                }
                if (record.pages !== undefined && record.pages !== "") {
                    citation_info.pages = record.pages;
                }
                if (record.pagerange !== undefined && record.pagerange !== "") {
                    citation_info.page_range = record.pagerange;
                }
                if (record.publication !== undefined && record.publication !== "") {
                    citation_info.publication = record.publication;
                }
                if (record.publisher !== undefined && record.publisher !== "") {
                    citation_info.publisher = record.publisher;
                }
                if (record.issn !== undefined && record.issn !== "") {
                    citation_info.issn = record.issn;
                }
                if (record.isbn !== undefined && record.isbn !== "") {
                    citation_info.isbn = record.isbn;
                }
                if (record.edition !== undefined && record.edition !== "") {
                    citation_info.edition = record.edition;
                }
                if (record.event_title !== undefined && record.event_title !== "") {
                    citation_info.event_title = record.event_title;
                }
                if (record.event_dates !== undefined && record.event_dates !== "") {
                    citation_info.event_dates = record.event_dates;
                }
                if (record.event_location !== undefined && record.event_location !== "") {
                    citation_info.event_location = record.event_location;
                }
                if (record.series !== undefined && record.series !== "") {
                    citation_info.series = record.series;
                }
                if (record.ispublished !== undefined && record.ispublished !== "") {
                    if (record.ispublished === "inpress") {
                        citation_info.ispublished = "(In Press)";
                    }
                    if (record.ispublished === "submitted") {
                        citation_info.ispublished = "(Submitted)";
                    }
                }
                //FIXME: we had this field wrongly labeled in our EPrint
                // output, it was called .pmc_id rather than .pmcid we
                // can simplify this if/else when that has propagated
                // throughout our collections.
                if (record.pmcid !== undefined && record.pmcid !== "") {
                    citation_info.pmcid = record.pmcid;
                } else if (record.pmc_id !== undefined && record.pmc_id !== "") {
                    citation_info.pmcid = record.pmc_id;
                }
                if (Object.keys(citation_info).length > 0) {
                    view.citation_info = citation_info;
                }
                // NOTE: Some records have no publication date because
                // there is no date in the material provided
                // when it was digitized and added to the repository.
                view.pub_date = '';
                if (record.date_type !== undefined &&
                    (record.date_type === 'completed' ||
                        record.date_type === 'published' ||
                        record.date_type === 'inpress' ||
                        record.date_type === 'submitted' ||
                        record.date_type === 'degree')) {
                    view.pub_date = '(' + record.date.substring(0, 4) + ')';
                } else if (record.type !== undefined && record.date !== undefined &
                    (record.type === 'conference_item' || record.type === 'teaching_resource') && record.date !== '') {
                    view.pub_date = '(' + record.date.substring(0, 4) + ')';
                }
                if (record.creators !== undefined && record.creators.items !== undefined) {
                    view.creators = [];
                    record.creators.items.forEach(function(creator, i) {
                        let display_name = "",
                            orcid = "",
                            id = "";

                        if (creator.name.given !== undefined && creator.name.family !== undefined) {
                            display_name = creator.name.family + ", " + creator.name.given;
                        } else if (creator.name.family !== undefined) {
                            display_name = creator.name.family;
                        }
                        if (creator.id !== undefined) {
                            id = creator.id;
                        }
                        if (creator.orcid !== undefined) {
                            orcid = creator.orcid;
                        }
                        view.creators.push({
                            "id": id,
                            "display_name": display_name,
                            "orcid": orcid,
                            "pos": i
                        });
                    });
                    /* DR-135, add additional fields for conference items. */
                    if (record.type !== undefined && record.type === 'conference_item') {
                        view.event_title = record.event_title;
                        view.event_dates = record.event_dates;
                        view.event_location = record.event_location;
                    }
                }
                view.description = record.abstract;
            } else {
                view.collection = "CaltechDATA";
                view.title = record.titles[0].title;
                if (record.resourceType !== undefined && record.resourceType.resourceTypeGeneral !== undefined && record.resourceType.resourceTypeGeneral !== "") {
                    view.resource_type = record.resourceType.resourceTypeGeneral;
                }
                /* NOTE: we should prefer the DOI if available */
                if (record.identifier !== undefined &&
                    (record.identifier.identifierType === "DOI")) {
                    view.href = "https://doi.org/" + record.identifier.identifier;
                } else {
                    view.href = "";
                }
                view.pub_date = record.publicationYear;
                if (record.creators !== undefined) {
                    view.creators = [];
                    record.creators.forEach(function(creator, i) {
                        let display_name = "",
                            orcid = "";

                        if (creator.creatorName !== undefined) {
                            display_name = creator.creatorName;
                        }
                        if (creator.nameIdenitifiers !== undefined) {
                            creator.nameIdentifiers.forEach(function(identifier) {
                                if (identifier.nameIdentifierScheme === "ORCID") {
                                    orcid = identifier.nameIdentifier;
                                }
                            });
                        }
                        view.creators.push({
                            "display_name": display_name,
                            "orcid": orcid,
                            "pos": i
                        });
                    });
                }
                view.description = record.descriptions.join("<p>");
            }
            normal_view.push(view);
        }
        self.nextCallbackFn(normal_view, "");
    };

    /**
     * recentN is a function to use with CL.pipeline. It expects data and error parameters and will
     * envoke `this.nextCallbackFn(data, error)` before exiting.
     *
     * @param data (a JS data type, required) this is usually a list to iterate filter for N items.
     * @param err (string, required) is an error string which is empty of no errors present.
     */
    CL.recentN = function(data, err) {
        let self = this,
            N = 0;

        if (err !== "") {
            self.nextCallbackFn(data, err);
            return;
        }
        N = self.getAttribute("recentN");
        if (N === undefined || Number.isInteger(N) === false || N < 1) {
            self.nextCallbackFn(data, "recentN attribute not set properly, an integer greater than zero required");
            return;
        }
        if (Array.isArray(data) === true) {
            self.nextCallbackFn(data.slice(0, N), err);
        }
        self.nextCallbackFn(data, "data was not an array, can't take N of them");
    };

    /**
     * titleCase is a naive title case function. Splits in spaces,
     * capitalizes each first let, lower casing the rest of the string and
     * finally joins the array of strings with spaces.
     */
    function titleCase(s) {
        return s.split(" ").map(function(word) {
            if (word.endsWith(".")) {
                return word;
            }
            if (word in ["of", "the", "a", "and", "or"]) {
                return word.toLowerCase();
            }
            return word[0].toUpperCase() + word.substr(1).toLowerCase();
        }).join(" ");
    }


    /**
     * viewer is a callback suitible to be used by functions like getPeopleJSON() and getGroupJSON().
     * it takes a configuration from the attribute "viewer" and will apply a filter pipeline if provided.
     * If no configuration provided then viewer will display unlinked titles.
     *
     * @param data (object, required) the data received from the calling function
     * @param err (string, required) holds any existing error message passed to it by calling function.
     */
    CL.viewer = function(data, err) {
        let self = this,
            filters = [],
            show_feed_count = false,
            show_year_headings = false,
            show_creators = false,
            show_pub_date = false,
            show_title_linked = false,
            show_citation = false,
            show_issn = false,
            show_isbn = false,
            show_pmcid = false,
            show_doi = false,
            show_description = false,
            show_search_box = false,
            config = {},
            parent_element,
            __display;
        config = self.getAttribute("viewer");
        /* To be cautious we want to validate our configuration object */
        if (config.show_search_box !== undefined && config.show_search_box === true) {
            show_search_box = true;
        }
        if (config.filters !== undefined && Array.isArray(config.filters)) {
            filters = config.filters;
        }
        if (config.feed_count !== undefined && config.feed_count === true) {
            show_feed_count = true;
        }
        if (config.show_year_headings !== undefined && config.show_year_headings === true) {
            show_year_headings = true;
        }
        if (config.creators !== undefined && config.creators === true) {
            show_creators = true;
        }
        if (config.pub_date !== undefined && config.pub_date === true) {
            show_pub_date = true;
        }
        if (config.title_link !== undefined && config.title_link === true) {
            show_title_linked = true;
        }
        if (config.citation_details !== undefined && config.citation_details === true) {
            show_citation = true;
        }
        if (config.issn_or_isbn !== undefined && config.issn_or_isbn === true) {
            show_issn = true;
            show_isbn = true;
        }
        if (config.pmcid !== undefined && config.pmcid === true) {
            show_pmcid = true;
        }
        if (config.doi !== undefined && config.doi === true) {
            show_doi = true;
        }
        if (config.description !== undefined && config.description === true) {
            show_description = true;
        }
        /* FIXME: add the following toggled fields
         * + show_citaition_fields
         *     + page_number
         *     + chapter
         *     + vol no
         *     + issue no
         *     + version number
         * + show_doi
         * + show_issn
         * + show_isbn
         */
        if (config.parent_element !== undefined && config.parent_element) {
            parent_element = config.parent_element;
        } else if (self.element !== undefined) {
            parent_element = self.element;
        } else {
            /* Worst case append a section element to body with a class CL-Library-Feed */
            let body = document.querySelector("body");
            parent_element = document.createElement("section");
            parent_element.classList.add("CL-library-Feed");
            body.appendChild(parent_element);
        }


        __display = function(records, err) {
            if (err != "") {
                parent_element.classList.addClass("error");
                parent_element.innerHTML = err;
                return;
            }
            let ul = document.createElement("ul"),
                feed_count = document.createElement("div"),
                year_jump_list = document.createElement("div"),
                year_heading = "";
            /* Clear the inner content of our element. */
            parent_element.innerHTML = "";
            /* Handle Managing Year Jump List */
            if (show_year_headings === true) {
                year_heading = "";
                parent_element.append(year_jump_list);
            }
            /* Handle feed count */
            if (show_feed_count === true) {
                feed_count.innerHTML = "(" + records.length + " items)";
                parent_element.append(feed_count);
            }
            /* NOTE: If we're not showing headings we're ready to attach our UL list
             * which will be populated record by record, otherwise we need a
             * alternate with divs and uls for each grouping */
            if (show_year_headings === false) {
                parent_element.appendChild(ul);
            }
            records.forEach(function(record) {
                let view = {},
                    current_year = "",
                    li = document.createElement("li"),
                    a,
                    span,
                    div,
                    creators,
                    pub_year,
                    pub_date,
                    book_title,
                    title,
                    link,
                    description,
                    css_prefix = record.collection;
                if (record.pub_date !== undefined && record.pub_date !== "") {
                    current_year = record.pub_date.substring(1, 5).trim();
                } else {
                    current_year = "unknown year";
                }
                if (show_year_headings === true && current_year != "" && year_heading !== current_year) {
                    if (year_heading === "") {
                        parent_element.classList.add(css_prefix);
                        year_jump_list.classList.add("jump-list");
                    }
                    /* Add link to jump list */
                    year_heading = current_year;
                    a = document.createElement("a");
                    a.classList.add("jump-list-label");
                    if (current_year === "unknown year") {
                        a.classList.add("unknown-year");
                    }
                    a.setAttribute("href", "#" + year_heading);
                    a.setAttribute("title", "Jump to year " + year_heading);
                    a.innerHTML = year_heading;
                    year_jump_list.append(a);

                    /* Add local year element to parent */
                    div = document.createElement("div");
                    div.setAttribute("id", year_heading);
                    div.classList.add("year-heading");
                    if (current_year === "unknown year") {
                        div.classList.add("unknown-year");
                    }
                    div.innerHTML = year_heading;
                    /* Add a new UL list after heading */
                    parent_element.appendChild(div);
                    ul = document.createElement("ul");
                    parent_element.appendChild(ul);
                }
                /* Create our DOM elements, add classes and populate from our common view */
                if (show_creators === true && record.creators.length > 0) {
                    creators = document.createElement("span");
                    creators.classList.add("creator");
                    record.creators.slice(0, 2).forEach(function(creator, i) {
                        if (creator.display_name !== undefined && creator.display_name !== "") {
                            let span = document.createElement("span");
                            if (i > 0) {
                                span.innerHTML = ";";
                                creators.appendChild(span);
                                span = document.createElement("span");
                            }
                            span.classList.add("creator-name");
                            if (creator.orcid !== undefined) {
                                span.setAttribute("title", "orcid: " + creator.orcid);
                            }
                            span.innerHTML = creator.display_name;
                            creators.appendChild(span);
                        }
                    });
                    if (record.creators.length > 2) {
                        creators.append(" et al.");
                    }
                    li.appendChild(creators);
                }
                if (show_pub_date === true && record.pub_date !== undefined && record.pub_date !== "") {
                    pub_date = document.createElement("span");
                    pub_date.classList.add("pub-date");
                    pub_date.innerHTML = " " + record.pub_date + " ";
                    li.appendChild(pub_date);
                }

                title = document.createElement("span");
                title.classList.add("title");
                link = document.createElement("a");
                link.classList.add("link");
                link.setAttribute("href", record.href);
                link.setAttribute("title", "linked to " + record.collection);
                if (show_title_linked === true) {
                    link.innerHTML = record.title;
                    title.appendChild(link);
                    li.appendChild(title);
                } else {
                    title.innerHTML = '<em>' + record.title + '</em>';
                    li.appendChild(title);
                }
                if (record.book_title !== undefined && record.book_title !== "") {
                    book_title = document.createElement("span");
                    book_title.classList.add("book-title");
                    book_title.innerHTML = 'In: <em>' + record.book_title + '</em>';
                    li.appendChild(book_title);
                }
                if (show_citation === true && Object.keys(record.citation_info).length > 0) {
                    [
                        "publication", "series", "volume", "number",
                        /* removed DR-135,
                        "page_range", "pages", */
                        "issn", "isbn", "pmcid",
                        "event_title", "event_dates", "event_location",
                        "ispublished"
                    ].forEach(function(key) {
                        if (record.citation_info[key] !== undefined &&
                            record.citation_info[key] !== "") {
                            let span = document.createElement("span"),
                                val = record.citation_info[key],
                                label = "";
                            span.classList.add(key);
                            switch (key) {
                                case "ispublished":
                                    span.innerHTML = val;
                                    break;
                                case "publication":
                                    span.innerHTML = val;
                                    break;
                                case "volume":
                                    span.innerHTML = "; Vol. " + val;
                                    break;
                                case "series":
                                    if (record.citation_info["number"] !== undefined && record.citation_info["number"] !== "") {
                                        span.innerHTML = "Series " + val + ", " +
                                            record.citation_info["number"] + ".";
                                    } else {
                                        span.innerHTML = "Series " + val + ".";
                                    }
                                    break;
                                case "number":
                                    if (record.citation_info['series'] === undefined || record.citation_info['series'] === "") {
                                      span.innerHTML = "; No. " + val + "";
                                    }
                                    break;
                                /* DR-135 remove pages,
                                case "page_range":
                                    span.innerHTML = "page range: " + val;
                                    break;
                                case "pages":
                                    span.innerHTML = "no. pg. " + val;
                                    break;  */
                                case "issn":
                                    if (show_issn === true) {
                                        span.innerHTML = "ISSN " + val;
                                    }
                                    break;
                                case "isbn":
                                    if (show_isbn === true) {
                                        span.innerHTML = "ISBN " + val;
                                    }
                                    break;
                                case "pmcid":
                                    if (show_pmcid === true) {
                                        span.innerHTML = "PMCID " + val;
                                    }
                                    break;
                                case "event_title":
                                    span.innerHTML = "In: " + val;
                                    break;
                                case "event_dates":
                                    span.innerHTML = ", " + val;
                                    break;
                                case "event_location":
                                    span.innerHTML = ", " + val;
                                    break;
                                default:
                                    label = titleCase(key.replace("_", " "));
                                    span.innerHTML = label + " " + val;
                                    break;
                            }
                            /* only add the span if we have content */
                            if (span.innerHTML !== "") {
                                li.appendChild(span);
                            }
                        }
                    });
                } else if (show_citation === false && Object.keys(record.citation_info).length > 0) {
                    ["issn", "isbn", "pmcid"].forEach(function(key) {
                        if (record.citation_info[key] !== undefined &&
                            record.citation_info[key] !== "") {
                            let span = document.createElement("span"),
                                val = record.citation_info[key],
                                label = "";
                            span.classList.add(key);
                            switch (key) {
                                case "issn":
                                    if (show_issn === true) {
                                        span.innerHTML = "ISSN " + val;
                                    }
                                    break;
                                case "isbn":
                                    if (show_isbn === true) {
                                        span.innerHTML = "ISBN " + val;
                                    }
                                    break;
                                case "pmcid":
                                    if (show_pmcid === true) {
                                        span.innerHTML = "PMCID " + val;
                                    }
                                    break;
                            }
                            /* only add the span if we have content */
                            if (span.innerHTML !== "") {
                                li.appendChild(span);
                            }
                        }
                    });
                }


                if (show_doi === true && record.doi !== undefined && record.doi !== "") {
                    span = document.createElement("span");
                    span.classList.add("doi");
                    span.innerHTML = record.doi;
                    li.appendChild(span);
                }
                if (show_title_linked === false) {
                    link.innerHTML = record.href;
                    li.appendChild(link);
                }
                if (show_description === true && record.description !== undefined && record.description !== "") {
                    description = document.createElement("div");
                    description.classList.add("description");
                    description.innerHTML = record.description;
                    li.appendChild(description);
                }
                /* Now add our li to the list */
                ul.appendChild(li);
            });
        };
        /* Add it as our final display element in the pipeline */
        filters.push(__display);
        /* Now run our pipeline */
        self.pipeline(data, err, ...filters);
    };

    /* NOTE: we need to update the global CL after adding our methods */
    if (window.CL === undefined) {
        window.CL = {};
    }
    window.CL = Object.assign(window.CL, CL);
}(document, window));
/**
 * CL-doi-media.js adds an embedded video player generated from
 * DOI media metadata.
 *
 * @author R. S. Doiel
 *
Copyright (c) 2019, Caltech
All rights not granted herein are expressly reserved by Caltech.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/*jshint esversion: 6 */
(function(document, window) {
    'use strict';

    let CL = {};
    if (window.CL === undefined) {
        window.CL = {};
    } else {
        CL = Object.assign({}, window.CL);
    }

    function getDoiMediaType(obj) {
        if ('attributes' in obj && 'mediaType' in obj.attributes) {
            return obj.attributes.mediaType;
        }
        return '';
    }

    function getDoiMediaURL(obj) {
        if ('attributes' in obj && 'url' in obj.attributes) {
            return obj.attributes.url;
        }
        return '';
    }


    CL.doi_media = function (doi, item_no, fnRenderCallback) {
        let self = this,
            doi_url = 'https://api.datacite.org/dois/' + doi + '/media';
        self.httpGet(doi_url, "application/json", function(data, err) {
            if (err) {
                return fnRenderCallback({}, err);
            }
            if ('data' in data && Array.isArray(data.data) && data.data.length > item_no) {
                let media_url = getDoiMediaURL(data.data[item_no]),
                    media_type = getDoiMediaType(data.data[item_no]),
                    err = '';
                if (media_url === '') {
                    err += ' missing url';
                }
                if (media_type === '') {
                    err += ' missing media type';
                }
                return fnRenderCallback({"media_url": media_url, "media_type": media_type}, err);
            }
            return fnRenderCallback({}, 'No media found for ' + doi);
        });
    };

    CL.doi_video_player = function(elem, doi, item_no, width = 640, height = 480) {
        let self = this;
        if (item_no === undefined) {
            item_no = 0;
        }
        self.doi_media(doi, item_no, function(obj, err) {
            if (err) {
                elem.innerHTML = `Could not render ${doi}, ${err}`;
                return;
            }
            elem.innerHTML = `<link href="https://vjs.zencdn.net/7.5.5/video-js.css" rel="stylesheet">
<script src="https://vjs.zencdn.net/7.5.5/video.js"></script>
<!-- If you'd like to support IE8 -->
<script src="https://vjs.zencdn.net/ie8/1.1.2/videojs-ie8.min.js"></script>

<video class="video-js" controls preload="auto" width="${width}" height="${height}" data-setup="{}">
    <source src="${obj.media_url}" type='${obj.media_type}'>
    <p class="vjs-no-js">
      To view this video please enable JavaScript, and consider upgrading to a web browser that
      <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
    </p>
</video>`;
        });
    };

    /* NOTE: we need to update the global CL after adding our methods */
    if (window.CL === undefined) {
        window.CL = {};
    }
    window.CL = Object.assign(window.CL, CL);
}(document, window));
