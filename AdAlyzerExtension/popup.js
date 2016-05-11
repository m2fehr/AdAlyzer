$(function() {
    $( "#tabs" ).tabs();
});

//Returns color from green to red according to value (0 - 1)
function getColor(value){
    //value from 0 to 1
    if (value < 0.0) {
        value = 0.0;
    } 
    else {
        if (value > 1.0)
            value = 1.0;
    }
    var hue=((1-value)*120).toString(10);
    return ["hsl(",hue,",100%,50%)"].join("");
}

//Returns string sehr tief/tief/mittel/hoch/sehr hoch according to value (0 - 1)
function getClassificationText(value){
    //value from 0 to 1
    if (value < 0.2) {
        return "sehr tief";
    } 
    else {
        if (value < 0.4)
            return "tief";
        else {
            if (value < 0.6)
                return "mittel";
            else {
                if (value < 0.8)
                    return "hoch";
                else 
                    return "sehr hoch";
            }
        }
    }
}

// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
    // First Tab
    var reqsTotal = document.getElementById('reqsTotal');
    var adsTotal = document.getElementById('adsTotal');
    var trackerTotal = document.getElementById('trackerTotal');
    var contentTotal = document.getElementById('contentTotal');
    var DOMTime = document.getElementById('DOMTime');
    var LoadTime = document.getElementById('LoadTime');
    // Second Tab
    var adsRating = document.getElementById('adsRating');
    var trackerRating = document.getElementById('trackerRating');
    var PLTRating = document.getElementById('PLTRating');
    var totalRating = document.getElementById('totalRating');
    // Third Tab
    var tableBody = document.getElementById("reqTableBody");


    var backgroundWindow = chrome.extension.getBackgroundPage();
    var query = { active: true, currentWindow: true };

    chrome.tabs.query(query, function(tabs) {
        var currentTab = tabs[0];
        var currentTabEntry = backgroundWindow.tabs.get(currentTab.id);
        var reqMap = currentTabEntry.reqMap;

        // First Tab
        reqsTotal.innerHTML = reqMap.size;
        adsTotal.innerHTML = currentTabEntry.elements.ads;
        trackerTotal.innerHTML = currentTabEntry.elements.tracker;
        contentTotal.innerHTML = currentTabEntry.elements.content;
        DOMTime.innerHTML = currentTabEntry.plt.dom + "ms";
        LoadTime.innerHTML = currentTabEntry.plt.load + "ms";

        // Second Tab
        var value1 = currentTabEntry.elements.ads / reqMap.size * 4;
        adsRating.textContent = getClassificationText(value1);
        adsRating.style.backgroundColor = getColor(value1);

        var value2 = currentTabEntry.elements.tracker / reqMap.size * 7;
        trackerRating.textContent = getClassificationText(value2);
        trackerRating.style.backgroundColor = getColor(value2);

        var value3 = currentTabEntry.plt.load / 4;
        //if (value3 > 1.0)
        //    value3 = 1.0;
        PLTRating.textContent = getClassificationText(value3);
        PLTRating.style.backgroundColor = getColor(value3);

        var value4 = (value1 + value2 + value3) / 3;
        totalRating.textContent = getClassificationText(value4);
        totalRating.style.backgroundColor = getColor(value4);
        
        // Third Tab
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
    });
    
});


/* Set Color from red to green
function getColor(value){
    //value from 0 to 1
    var hue=((1-value)*120).toString(10);
    return ["hsl(",hue,",100%,50%)"].join("");
}
var len=20;
for(var i=0; i<=len; i++){
    var value=i/len;
    var d=document.createElement('div');
    d.textContent="value="+value;
    d.style.backgroundColor=getColor(value);
    document.body.appendChild(d);
}
*/

