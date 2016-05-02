// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
    // Cache a reference to the status display SPAN
    var reqsSpan = document.getElementById('reqsTotal');
    var adsSpan = document.getElementById('adsTotal');
    var backgroundWindow = chrome.extension.getBackgroundPage();
    var query = { active: true, currentWindow: true };

    chrome.tabs.query(query, function(tabs) {
        var currentTab = tabs[0];

        if (backgroundWindow.tabs.has(currentTab.id))
            reqsSpan.innerHTML = backgroundWindow.tabs.get(currentTab.id).size;
        else
            reqsSpan.innerHTML = "reload the page";
        

        if (backgroundWindow.ads.has(currentTab.id))
            adsSpan.innerHTML = backgroundWindow.ads.get(currentTab.id);
        else
            adsSpan.innerHTML = "0";
        });
    
});

