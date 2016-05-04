$(function() {
    $( "#tabs" ).tabs();
});

// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
    // Cache a reference to the status display SPAN
    var reqsSpan = document.getElementById('reqsTotal');
    var adsSpan = document.getElementById('adsTotal');
    var tableBody = document.getElementById("reqTableBody");
    var backgroundWindow = chrome.extension.getBackgroundPage();
    var query = { active: true, currentWindow: true };

    chrome.tabs.query(query, function(tabs) {
        var currentTab = tabs[0];
        var reqMap = backgroundWindow.tabs.get(currentTab.id);

        if (backgroundWindow.tabs.has(currentTab.id))
            reqsSpan.innerHTML = reqMap.size;
        else
            reqsSpan.innerHTML = "reload the page";
        

        if (backgroundWindow.ads.has(currentTab.id))
            adsSpan.innerHTML = backgroundWindow.ads.get(currentTab.id);
        else
            adsSpan.innerHTML = "0";
        
            
        reqMap.forEach(function(value, key, map) {
            if (value.finished) {
                row=document.createElement("tr");
                cell1 = document.createElement("td");
                cell2 = document.createElement("td");
                cell3 = document.createElement("td");
                cell1.innerHTML = key;
                cell2.innerHTML = (value.responseReceived - value.requestSent).toFixed(3);
                cell3.innerHTML = (value.completed - value.responseReceived).toFixed(3);
                row.appendChild(cell1);
                row.appendChild(cell2);
                row.appendChild(cell3);
                row.setAttribute("title", value.url);
                tableBody.appendChild(row);
            }
        }); 
        
        //sorttable.makeSortable(document.getElementById("reqTable"));

    


        });
    
});

