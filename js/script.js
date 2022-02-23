// Script to perform functions that aren't tied to any page but are applicable to pretty much all pages

// Turn animations back on once page is loaded
window.addEventListener('load', (event) => {
    document.getElementsByTagName("body")[0].classList.remove("preload")
});

// Make all external links open in new window
// This is inefficient for now (since we can ignore nav links), but it will do
let { origin } = new URL(window.location.href); 
let allLinks = document.querySelectorAll("a");
for(let link of allLinks) {
    if(!link.href || typeof(link.href) == "object") continue;
    let currLink = new URL(link.href);
    if(currLink.origin != origin && !currLink.href.includes("https://data.caltech.edu/tindfiles/serve")) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener");
    }
}