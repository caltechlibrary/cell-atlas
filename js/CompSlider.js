/**
 * Creates an image comparison slider widget.
 *
 * @param root The dom element being registered as a comparison image slider.
 */
let CompSlider = function(root) {
    
    // Create variables for frequently used dom elements
    let afterImgContainer = root.querySelector(".comp-slider__after-img-container");
    let slider = root.querySelector(".comp-slider__slider");
    let sliderInput = root.querySelector(".comp-slider__input");

    /**
     * Add event listeners to enable image slider functionality.
     * Fired on slider mousedown/touchstart.
     *
     * @param event Event object created by mousedown/touchstart event.
     */
    let initImgSliding = function(event) {
        // Prevent default functionality on mousedown/touchstart event.
        // Have not tested if this is necessary.
        event.preventDefault();

        window.addEventListener("mousemove", onSlide);
        window.addEventListener("touchmove", onSlide);
        window.addEventListener("mouseup", endImgSliding);
        window.addEventListener("touchend", endImgSliding);
    };

    /**
     * Visually update comparison slider when input element is used.
     * Fired on sliderInput input.
     *
     * @param event Event object created by input event.
     */
    let onSliderManualInput = function(event) {
        setCompImgPercentage(sliderInput.value);
    };

    /**
     * Calculate before/after comparison percentage and slider position 
     * based on mousemove/touchmove event. Fired on mousemove/touchmove 
     * after sliding is initialized in initImgSliding().
     *
     * @param event Event object created by mousemove/touchmove event.
     */
    let onSlide = function(event) {
        let boundingRect = root.getBoundingClientRect();
        // Set correct pageX based on if mousemove/touchmove event is used
        let pageX = ("pageX" in event) ? event.pageX : event.changedTouches[0].pageX;
        let compSliderPosX, compSliderPercentageX;

        if(pageX < boundingRect.left) {
            // Set slider pos to 0 (left most) if pageX is to the left of root bounding rect
            compSliderPosX = 0;
        } else if(pageX > boundingRect.right) {
            // Set slider pos to root elem width (right most) if pageX is to the right of root bounding rect
            compSliderPosX = root.offsetWidth;
        } else {
            // Set slider pos to mouse/touch position offset if pageX is withing root bounding rect bounds
            compSliderPosX = pageX - boundingRect.left;
        }

        // Convert slider pos to percentage and update sliderInput elem and update comp slider
        compSliderPercentageX = (compSliderPosX / root.offsetWidth) * 100;
        sliderInput.value = compSliderPercentageX;
        setCompImgPercentage(compSliderPercentageX);
    };

    /**
     * Visually update comparison slider position and before/after
     * comparison percentage.
     *
     * @param percentage Whole number percentage of slider pos and before/after image comparison
     */
    let setCompImgPercentage = function(percentage) {
        slider.style.left = `${percentage}%`;
        afterImgContainer.style.width = `${percentage}%`;
    };

    /**
     * Remove event listeners to enable image slider functionality.
     * Fired on mouseup/touchend after sliding is initialized in 
     * initImgSliding().
     *
     * @param event Event object created by mouseup/touchend event.
     */
    let endImgSliding = function(event) {
        window.removeEventListener("mousemove", onSlide);
        window.removeEventListener("touchmove", onSlide);
        window.removeEventListener("mouseup", endImgSliding);
        window.removeEventListener("touchend", endImgSliding);
    };

    // Add necessary event listeners to dom elements.
    slider.addEventListener("mousedown", initImgSliding);
    slider.addEventListener("touchstart", initImgSliding);
    sliderInput.addEventListener("input", onSliderManualInput);

}