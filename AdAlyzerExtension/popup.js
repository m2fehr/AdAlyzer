/*function test() {
	
	var backgroundWindow = chrome.extension.getBackgroundPage();
	var imgCount = backgroundWindow.imgCount;
	var textSpan = document.getElementById('GDWC_wordsTotal');
	textSpan.innerHTML = imgCount;
	
	
}();*/


// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
    var imgCount;
    // Cache a reference to the status display SPAN
    var textSpan = document.getElementById('GDWC_wordsTotal');
    // Handle the bookmark form submit event with our addBookmark function
    var backgroundWindow = chrome.extension.getBackgroundPage();
    if (backgroundWindow)
	   imgCount = backgroundWindow.imgCount;
    else
        imgCount = "no bgWindow";
    // Get the event page
    //chrome.runtime.getBackgroundPage(function(eventPage) {
        // Call the getPageInfo function in the event page, passing in 
        // our onPageDetailsReceived function as the callback. This injects 
        // content.js into the current tab's HTML
      //  eventPage.getPageDetails(onPageDetailsReceived);
    //});
	document.getElementById('GDWC_wordsTotal').innerHTML = imgCount;
});

