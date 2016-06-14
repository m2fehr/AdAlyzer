$(function() {
    $( "#tabs" ).tabs();
});

//Returns color from green to red according to value (0 - 1)
function getColor(value){
    //value from 0 to 1
    var hue=((1-value)*120).toString(10);
    return ["hsl(",hue,",100%,50%)"].join("");
}

//Returns string sehr tief/tief/mittel/hoch/sehr hoch according to value (0 - 1)
function getClassificationText(value, tief, hoch){
    //value from 0 to 1
    if (value < 0.2) {
        return "sehr " + tief;
    } 
    else {
        if (value < 0.4)
            return tief;
        else {
            if (value < 0.6)
                return "mittel";
            else {
                if (value < 0.8)
                    return hoch;
                else 
                    return "sehr " + hoch;
            }
        }
    }
}

function exportToCsv() {
    var backgroundWindow = chrome.extension.getBackgroundPage();
    var query = { active: true, currentWindow: true };
    chrome.tabs.query(query, function(tabs) {
        var myCsv = "Type;Waiting[ms];Downloading[ms];Scheme;Resource;URL\n";
        var currentTab = tabs[0];
        var currentTabEntry = backgroundWindow.tabs.get(currentTab.id);
        var reqMap = currentTabEntry.reqMap;
        reqMap.forEach(function(value, key, map) {
            if (value.finished) {
                myCsv = myCsv + value.contentType + ";";
                myCsv = myCsv + (value.responseReceived - value.requestSent).toFixed(0) + ";";
                myCsv = myCsv + (value.completed - value.responseReceived).toFixed(0) + ";";
                myCsv = myCsv + value.url.split(':', 1)[0] + ";";
                myCsv = myCsv + value.resourceType + ";";
                myCsv = myCsv + value.url + "\n";
            }
        });
        window.open('data:text/csv;charset=utf-8,' + escape(myCsv));
    });
}

// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
    // First Tab
    var reqsTotal = document.getElementById('reqsTotal');
    var adsTotal = document.getElementById('adsTotal');
    var trackerTotal = document.getElementById('trackerTotal');
    var contentTotal = document.getElementById('contentTotal');
    var adsPercent = document.getElementById('adsPercent');
    var trackerPercent = document.getElementById('trackerPercent');
    var contentPercent = document.getElementById('contentPercent');
    //var adsRealTotal = document.getElementById('adsRealTotal');
    var DOMTime = document.getElementById('DOMTime');
    var loadTime = document.getElementById('loadTime');
    var pageRating = document.getElementById('pageRating');
    // Second Tab
    var adsRating = document.getElementById('adsRating');
    var trackerRating = document.getElementById('trackerRating');
    var PLTRating = document.getElementById('PLTRating');
    var totalRating = document.getElementById('totalRating');
    // Third Tab
    var tableBody = document.getElementById("reqTableBody");
    var exportBtn = document.getElementById('exportBtn');
    exportBtn.addEventListener('click', exportToCsv);

    var backgroundWindow = chrome.extension.getBackgroundPage();
    var query = { active: true, currentWindow: true };

    chrome.tabs.query(query, function(tabs) {
        var currentTab = tabs[0];
        var currentTabEntry = backgroundWindow.tabs.get(currentTab.id);
        var reqMap = currentTabEntry.reqMap;


        // Second Tab
        var value1 = currentTabEntry.elements.ads / reqMap.size * 4;
        value1 = value1 > 1.0 ? 1.0 : value1;
        adsRating.textContent = getClassificationText(value1, "tief", "hoch");
        adsRating.style.backgroundColor = getColor(value1);

        var value2 = currentTabEntry.elements.tracker / reqMap.size * 7;
        value2 = value2 > 1.0 ? 1.0 : value2;
        trackerRating.textContent = getClassificationText(value2, "tief", "hoch");
        trackerRating.style.backgroundColor = getColor(value2);

        var value3 = currentTabEntry.plt.load / 4;
        value3 = value3 > 1.0 ? 1.0 : value3;
        PLTRating.textContent = getClassificationText(value3, "tief", "hoch");
        PLTRating.style.backgroundColor = getColor(value3);

        var value4 = (value1 + value2 + value3) / 3;
        totalRating.textContent = getClassificationText(value4, "gut", "schlecht");
        totalRating.style.backgroundColor = getColor(value4);

        // First Tab
        var reqMapSize = reqMap.size;
        reqsTotal.innerHTML = reqMapSize;
        adsTotal.innerHTML = currentTabEntry.elements.ads;
        trackerTotal.innerHTML = currentTabEntry.elements.tracker;
        contentTotal.innerHTML = currentTabEntry.elements.content;
        adsPercent.innerHTML = ((100 / reqMapSize) * currentTabEntry.elements.ads).toFixed(0) + "%";
        trackerPercent.innerHTML = ((100 / reqMapSize) * currentTabEntry.elements.tracker).toFixed(0) + "%";
        contentPercent.innerHTML = ((100 / reqMapSize) * currentTabEntry.elements.content).toFixed(0) + "%";
        DOMTime.innerHTML = currentTabEntry.plt.dom + "s";
        loadTime.innerHTML = currentTabEntry.plt.load + "s";
        pageRating.innerHTML = totalRating.textContent;
        //adsRealTotal.innerHTML = currentTabEntry.adFrames.length;

        // Third Tab
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }
        
        reqMap.forEach(function(value, key, map) {
            row=document.createElement("tr");
            //Add Eventlistener for doubleclicked rows -> copy URL to clipboard
            row.addEventListener('dblclick', function (event) {
                console.log("row doubleclicked, url: " + this.getAttribute("title"));
                var copyFrom = document.createElement("textarea");
                copyFrom.textContent = this.getAttribute("title");
                var body = document.getElementsByTagName('body')[0];
                copyFrom.style.boxSizing="border-box"
                copyFrom.style.height = "0px";
                copyFrom.style.width = "0px";
                copyFrom.style.margin = "0px";
                body.appendChild(copyFrom);
                copyFrom.select();
                document.execCommand('copy');
                body.removeChild(copyFrom);
            });
            cell1 = document.createElement("td");
            cell2 = document.createElement("td");
            cell3 = document.createElement("td");
            cell4 = document.createElement("td");
            cell5 = document.createElement("td");
            var contentType = value.contentType;
            contentType = contentType.charAt(0).toUpperCase() + contentType.slice(1);
            cell1.innerHTML = contentType;
            if (value.responseReceived && value.requestSent) {
                cell2.innerHTML = (value.responseReceived - value.requestSent).toFixed(0);
                if (value.completed) {
                    cell3.innerHTML = (value.completed - value.responseReceived).toFixed(0);
                }
                else {
                    cell3.innerHTML = '';
                }
            } else {
                cell2.innerHTML = '';
                cell3.innerHTML = '';
            }
            
            
            //cell4.innerHTML = value.url.split(':', 1)[0];
            //cell5.innerHTML = value.resourceType + '(' + value.frameId + ')';
            //cell2.style.textAlign = 'right';
            //cell3.style.textAlign = 'right';
            row.appendChild(cell1);
            row.appendChild(cell2);
            row.appendChild(cell3);
            row.appendChild(cell4);
            row.appendChild(cell5);
            row.setAttribute("title", value.url);
            tableBody.appendChild(row);
        }); 
    });
    
});

