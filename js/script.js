// Script to perform functions that aren't tied to any page but are applicable to pretty much all pages

// Turn animations back on once page is loaded
window.addEventListener('load', (event) => {
    document.getElementsByTagName("body")[0].classList.remove("preload")
});