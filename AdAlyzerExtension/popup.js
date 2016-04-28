// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
    // Cache a reference to the status display SPAN
    var textSpan = document.getElementById('GDWC_wordsTotal');
    var backgroundWindow = chrome.extension.getBackgroundPage();
    var query = { active: true, currentWindow: true };

    chrome.tabs.query(query, function(tabs) {
        var currentTab = tabs[0];
        console.log("currentTabID: " + currentTab.id);

        if (backgroundWindow.m.has(currentTab.id))
            textSpan.innerHTML = backgroundWindow.m.get(currentTab.id);
        else
            textSpan.innerHTML = "reload the page";
        });
    
});

