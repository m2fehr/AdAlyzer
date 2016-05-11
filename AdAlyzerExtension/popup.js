$(function() {
    $( "#tabs" ).tabs();
});

// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
    // Cache a reference to the status display SPAN
    var reqsTotal = document.getElementById('reqsTotal');
    var adsTotal = document.getElementById('adsTotal');
    var trackerTotal = document.getElementById('trackerTotal');
    var contentTotal = document.getElementById('contentTotal');
    var DOMTime = document.getElementById('DOMTime');
    var LoadTime = document.getElementById('LoadTime');


    var tableBody = document.getElementById("reqTableBody");


    var backgroundWindow = chrome.extension.getBackgroundPage();
    var query = { active: true, currentWindow: true };

    chrome.tabs.query(query, function(tabs) {
        var currentTab = tabs[0];
        var currentTabEntry = backgroundWindow.tabs.get(currentTab.id);
        var reqMap = currentTabEntry.reqMap;

        //if (backgroundWindow.tabs.has(currentTab.id)) { //nötig????
            reqsTotal.innerHTML = reqMap.size;
            adsTotal.innerHTML = currentTabEntry.elements.ads;
            trackerTotal.innerHTML = currentTabEntry.elements.tracker;
            contentTotal.innerHTML = currentTabEntry.elements.content;
            DOMTime.innerHTML = currentTabEntry.plt.dom + "ms";
            LoadTime.innerHTML = currentTabEntry.plt.load + "ms";
        //}
        
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }
        
        reqMap.forEach(function(value, key, map) {
            if (value.finished) {
                row=document.createElement("tr");
                cell1 = document.createElement("td");
                cell2 = document.createElement("td");
                cell3 = document.createElement("td");
                cell1.innerHTML = value.contentType;
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

