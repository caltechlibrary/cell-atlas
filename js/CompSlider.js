let CompSlider = function(root) {
    
    let afterImgContainer = root.querySelector(".comp-slider__after-img-container");
    let slider = root.querySelector(".comp-slider__slider");
    let sliderInput = root.querySelector(".comp-slider__input");

    let initImgSliding = function(event) {
        event.preventDefault();
        window.addEventListener("mousemove", onSlide);
        window.addEventListener("touchmove", onSlide);
        window.addEventListener("mouseup", endImgSliding);
        window.addEventListener("touchend", endImgSliding);
    };

    let onSliderManualInput = function(event) {
        setCompImgPercentage(sliderInput.value);
    };

    let onSlide = function(event) {
        let boundingRect = root.getBoundingClientRect();
        let pageX = ("pageX" in event) ? event.pageX : event.changedTouches[0].pageX;
        let compSliderPosX, compSliderPercentageX;
        if(pageX < boundingRect.left) {
            compSliderPosX = 0;
        } else if(pageX > boundingRect.right) {
            compSliderPosX = root.offsetWidth;
        } else {
            compSliderPosX = pageX - boundingRect.left;
        }
        compSliderPercentageX = (compSliderPosX / root.offsetWidth) * 100;
        sliderInput.value = compSliderPercentageX;
        setCompImgPercentage(compSliderPercentageX);
    };

    let setCompImgPercentage = function(percentage) {
        slider.style.left = `${percentage}%`;
        afterImgContainer.style.width = `${percentage}%`;
    };

    let endImgSliding = function(event) {
        window.removeEventListener("mousemove", onSlide);
        window.removeEventListener("touchmove", onSlide);
        window.removeEventListener("mouseup", endImgSliding);
        window.removeEventListener("touchend", endImgSliding);
    };

    slider.addEventListener("mousedown", initImgSliding);
    slider.addEventListener("touchstart", initImgSliding);
    sliderInput.addEventListener("input", onSliderManualInput);

}