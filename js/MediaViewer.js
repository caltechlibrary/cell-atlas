/**
 * Creates a media viewer used to display various media components. 
 * Returns a media viewer object.
 *
 * @param root The dom element being registered as a media viewer.
 * @param onRequestFullscreenChangeCallback Callback fired when full 
 * screen button is clicked.
 * @param resizeCallback Callback fired when the media viewer is resized.
 * @param mediaSwitchCallback Callback fired when displayed media 
 * component is switched.
 */
let MediaViewer = function(root, onRequestFullscreenChangeCallback = function(){}, resizeCallback = function(){}, mediaSwitchCallback = function(){}) {
    
    // Create references to frequently used dom elements.
    let tabContainer = root.querySelector(".media-viewer__tab-container");
    let tabBtns = root.querySelectorAll(".media-viewer__tab-btn");
    let mediaContainer = root.querySelector(".media-viewer__media-container");
    let mediaComponents = root.querySelectorAll(".media-viewer__media-component");
    let fullscreenBtn = root.querySelector(".media-viewer__fullscreen-btn");

    /**
     * Called on root fullscreenchange. Fires resizeCallback.
     */
    let handleRootFullscreenChange = function() {
        // Send root to callback so it has access to this media viewer.
        resizeCallback(root);
    };

    /**
     * Called on tabBtn click. Initiates the switching of 
     * displayed media type.
     * 
     * @param event click event that initiated this function.
     */
    let handleTabBtnClick = function(event) {
        let tabBtn = event.currentTarget;
        let currSelectedBtn = tabContainer.querySelector(".media-viewer__tab-btn-vid--selected");
        let mediaType = tabBtn.getAttribute("value");

        // If the requested media type is already selected, do nothing.
        if(tabBtn == currSelectedBtn) return;

        // Highlight correct tab btn and display correct media type.
        currSelectedBtn.classList.remove("media-viewer__tab-btn-vid--selected");
        tabBtn.classList.add("media-viewer__tab-btn-vid--selected");
        displayMediaType(mediaType);
    };

    /**
     * Displays a given media type. Exported as method on returned 
     * media viewer object.
     * 
     * @param mediaType type of media to display.
     */
    let displayMediaType = function(mediaType) {
        // Hide all media components and show desired media component type.
        let targetMediaComponent = root.querySelector(`.media-viewer__media-component[data-media-type='${mediaType}']`);
        for(let mediaComponent of mediaComponents) mediaComponent.classList.add("media-viewer__media-component--hidden");
        targetMediaComponent.classList.remove("media-viewer__media-component--hidden");

        // Video players have their own full screen button. Hide/show media viewer full screen btn if type is vid.
        if(mediaType == "vid") {
            fullscreenBtn.classList.add("media-viewer__fullscreen-btn--hidden");
        } else {
            fullscreenBtn.classList.remove("media-viewer__fullscreen-btn--hidden");
        }

        // Call media switch callback with root and media type.
        mediaSwitchCallback(root, mediaType);
    };

    /**
     * Called on fullscreenBtn click. Initiates change of display of
     * media viewer enlarged/minimized mode. 
     * 
     * Leaves actual decision of display to onRequestFullscreenChangeCallback, 
     * as external circumstances determine to display in actual full screen, 
     * modal like enlargement, or something else. onRequestFullscreenChangeCallback 
     * can use exported functions like toggleFullscreen or toggleFixedEnlarged 
     * once the desired "enlarged" display is determined externally.
     * 
     * @param event click event that initiated this function.
     */
    let handleFullscreenBtnClick = function(event) {
        // Change full screen button state.
        let ariaLabel = fullscreenBtn.getAttribute("aria-label");
        if(ariaLabel == "Enter full screen") {
            setFullscreenBtnState("expanded");
        } else {
            setFullscreenBtnState("minimized");
        }

        // Call full screen change callback with media viewer id. Might be more consistent to send root instead of it's id.
        onRequestFullscreenChangeCallback(root.id);
    };

    /**
     * Sets labels/icons of media viewer full screen button. Exported as 
     * method on returned media viewer object.
     * 
     * @param state state to set full screen button to.
     */
    let setFullscreenBtnState = function(state) {
        let enterFsIcon = fullscreenBtn.querySelector(".media-viewer__enter-fs-icon");
        let exitFsIcon = fullscreenBtn.querySelector(".media-viewer__exit-fs-icon");
        let labelString;

        /**
         * Display correct icons and set correct btn labels for accessibility.
         * 
         * Display of icons might be better handled through a parent class selector in css. As a hypothetical: 
         * ".media-viewer--enlarged .media-viewer__exit-fs-icon". That could remove need to manage with js.
         */
        if(state == "expanded") {
            labelString = "Exit full screen";
            enterFsIcon.classList.add("media-viewer__fullscreen-btn-icon--hidden");
            exitFsIcon.classList.remove("media-viewer__fullscreen-btn-icon--hidden");
        } else if(state == "minimized") {
            exitFsIcon.classList.add("media-viewer__fullscreen-btn-icon--hidden");
            enterFsIcon.classList.remove("media-viewer__fullscreen-btn-icon--hidden");
            labelString = "Enter full screen";
        }
        fullscreenBtn.setAttribute("aria-label", labelString);
        fullscreenBtn.setAttribute("title", labelString);
    };

    /**
     * Toggles full screen of media viewer. "Full screen" as in 
     * actual full window full screen. Exported as method on returned 
     * media viewer object.
     */
    let toggleFullscreen = function() {
        if(!root.classList.contains("media-viewer--fullscreen")) {
            displayFullscreen();
        } else {
            exitFullscreen();
        }
    };

    /**
     * Enters the media viewer into full screen.
     */
    let displayFullscreen = function() {
        root.classList.add("media-viewer--fullscreen");

        // iOS on iPhone does not support the fullscreen api. Need to polyfill if so.
        if(root.requestFullscreen) {
            root.requestFullscreen();
        } else {
            // Add polyfill class that will appear as if media viewer as full screen.
            root.classList.add("media-viewer--fullscreen-polyfill");
            // Make media viewer behave as a modal in attempt to replicate native full screen behavior.
            makeRootModal();
            // Manually call resize callback. For native full screen the resize callback is fired within handleRootFullscreenChange 
            // event listener.
            resizeCallback(root);
        }
    };

    /**
     * Exits the media viewer out of full screen.
     */
    let exitFullscreen = function() {
        root.classList.remove("media-viewer--fullscreen");

        // iOS on iPhone does not support the fullscreen api. Need to polyfill if so.
        if(root.requestFullscreen) {
            document.exitFullscreen();
        } else {
            // Remove polyfill class that will appear as if media viewer as full screen.
            root.classList.remove("media-viewer--fullscreen-polyfill");
            // Remove media viewer modal behavior.
            revertRootModal();
            // Manually call resize callback. For native full screen the resize callback is fired within handleRootFullscreenChange 
            // event listener.
            resizeCallback(root);
        }
    };

    /**
     * Toggles modal-like display of media viewer. Exported as 
     * method on returned media viewer object.
     */
    let toggleFixedEnlarged = function() {
        if(!root.classList.contains("media-viewer--fixed-enlarged")) {
            displayFixedEnlarged();
        } else {
            minimizeFixedEnlarged();
        }
    };

    /**
     * Enters the media viewer into modal-like display.
     */
    let displayFixedEnlarged = function() {
        root.classList.add("media-viewer--fixed-enlarged");
        // Call resize callback as media viewer size has changed.
        resizeCallback(root);
        // Add modal-like functionality to media viewer.
        makeRootModal();
    };

    /**
     * Exits the media viewer from modal-like display.
     */
    let minimizeFixedEnlarged = function() {
        root.classList.remove("media-viewer--fixed-enlarged");
        // Call resize callback as media viewer size has changed.
        resizeCallback(root);
        // Remove modal-like functionality to media viewer.
        revertRootModal();
    };

    /**
     * Adds modal-like functionality to media-viewer.
     */
    let makeRootModal = function() {
        // Add attributes that make media viewer behave like a modal semantically. 
        root.setAttribute("role", "dialog");
        root.setAttribute("aria-label", "Media container");
        root.setAttribute("aria-modal", "true");

        // Add event listener to trap keyboard focus in media viewer.
        window.addEventListener("keydown", onRootModalKeydown);
    };

    /**
     * Called on window keydown. Traps keyabord focus within media viewer.
     * 
     * @param event keydown event that initiated this function.
     */
    let onRootModalKeydown = function(event) {
        // Set focusable els to whatever is in currently displayed media component.
        let visibleMediaComponent = mediaContainer.querySelector(".media-viewer__media-component:not(.media-viewer__media-component--hidden)");
        let focusableEls = visibleMediaComponent.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
        
        // If tab key is pressed, manage keyboard focus.
        if(event.key == "Tab") {
            // Checking if media container contains target seems unecessary, since we check shift-tabbing/tabbing out anyways.
            if(!mediaContainer.contains(event.target) || focusableEls.length == 0 || (event.target == focusableEls[0] && event.shiftKey)) {
                // If shift tabbing out or no focusable elements in media component.
                fullscreenBtn.focus();
                event.preventDefault();
            } else if(event.target == fullscreenBtn && !event.shiftKey) {
                // If tabbing out and not shift tabbing inside media component.
                focusableEls[0].focus();
                event.preventDefault();
            }
        }
    };

    /**
     * Removes modal-like functionality to media-viewer.
     */
    let revertRootModal = function() {
        root.removeAttribute("role");
        root.removeAttribute("aria-label");
        root.removeAttribute("aria-modal");
        window.removeEventListener("keydown", onRootModalKeydown);
    };

    // Add neccessary event listeners to dom elements.
    root.addEventListener("fullscreenchange", handleRootFullscreenChange);
    for(let tabBtn of tabBtns) tabBtn.addEventListener("click", handleTabBtnClick);
    fullscreenBtn.addEventListener("click", handleFullscreenBtnClick);

    // Return media viewer object.
    return {
        root,
        displayMediaType,
        setFullscreenBtnState,
        toggleFullscreen,
        toggleFixedEnlarged
    }
};