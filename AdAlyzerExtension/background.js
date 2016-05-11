
/* //Just Samples for classes
class Request {
  constructor(reqId) {
    this.reqId = reqId;
  }
}

var req = function(reqId) {
  if (this instanceof req) {
    this.reqId = reqId;
  } else {
    return new req(reqId);
  }
}

//console command to put out all the entries
tabs.forEach(function(value, key, map) {
	console.log("tabs[" + key + "] = " + value.size);
	value.forEach(function(value, key, map) {
		if (value.finished)
    		console.log("reqId[" + key + "] waiting: " + (value.responseReceived - value.requestSent) + "ms, download: " + (value.completed - value.responseReceived) + "ms, url:" + value.url);
	});	
});

*/

//Every Tab gets such a object in the tabs-Map
tabEntry = function () {
    return {
        reqMap: new Map(),
        plt: {dom: 0, load: 0},
        elements: {ads: 0, tracker: 0, content: 0},
        rating: {total: '?', plt: '?', ads: '?', tracking: '?'}
    }
};

function resetTabEntry(entry) { //vlt effizienter gleich neues objekt zu erzeugen?
	entry.reqMap.clear();
	entry.plt.dom = 0;
	entry.plt.load = 0;
	entry.elements.ads = 0;
	entry.elements.tracker = 0;
	entry.elements.content = 0;
	entry.rating.total = '?';
	entry.rating.plt = '?';
	entry.rating.ads = '?';
	entry.rating.tracking = '?';
};


var tabs = new Map();
//var ads = new Map();

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
   	tabs.delete(tabId);
   	//ads.delete(tabId);
   	/*console.log("tabID: " + tabId + "closed, length now: " + tabs.size);
   	tabs.forEach(function(value, key, map) {
    	console.log("tabs[" + key + "] = " + value.size);
	});*/
});

chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
   	tabs.delete(removedTabId);
   	//ads.delete(removedTabId);
   	//console.log("tabID: " + removedTabId + "replaced, length now: " + tabs.size);
});

//Reset the Counter when new url is loaded
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.status === "loading") {
		
		//tabs.set(tabId, 0);
		/*var reqs = tabs.get(tabId);
		if(typeof reqs !== "undefined") {
			reqs.clear();
			console.log("reseted counter for tab " + tabId);
		}
		ads.set(tabId, 0);*/
		resetTabEntry(tabs.get(tabId));
	}
});

chrome.webRequest.onBeforeRequest.addListener(function(details) {
    	var tabId = details.tabId;
    	var requestId = details.requestId;

      	if(tabId && tabId !== -1) {	//check if tabId is valid

      		var entry = tabs.get(tabId);

			if(typeof entry === "undefined") {	//check if an entry exists for this tab
				entry = tabEntry();
				tabs.set(tabId, entry);
			}
			
			
			var reqEntry = entry.reqMap.get(requestId);

			if(typeof reqEntry === "undefined") {	//check if requestId is already used

				//Differentiat between Content Type
				var type = 'Content';
				if(details.url.indexOf('ad') !== -1) {
					type = 'Ads';
					entry.elements.ads = entry.elements.ads + 1;
					chrome.browserAction.setBadgeText({text: entry.elements.ads.toString(), tabId: tabId});
				}
				else {
					if((details.url.indexOf('track') !== -1) || (details.url.indexOf('analyt') !== -1)) {
						type = 'Tracking';
						entry.elements.tracker = entry.elements.tracker + 1;
					}
					else {
						entry.elements.content = entry.elements.content + 1;
					}
				}

				entry.reqMap.set(requestId, {url: details.url, requestSent: 0, responseReceived: 0, completed: 0, finished: false, contentType: type});
			}
			else {
				console.log("onBeforeRequest: requestId already in map");
			}
		
/*
      		//count requests
			var reqCount = tabs.get(tabId);
			if(typeof reqCount !== "undefined") {
				tabs.set(tabId, reqCount + 1);
			}
			else {
				tabs.set(tabId, 1);
				console.log("new Tab was added to Map, Id: " + tabId);
			}
*/
			//count ads and update badge
			/*if(details.url.indexOf('ad') !== -1) {	//ToDo: Check for Ads
				var adsCount = ads.get(tabId);
				if(typeof adsCount !== "undefined") {
					adsCount = adsCount + 1;
					ads.set(tabId, adsCount);
				}
				else {
					adsCount = 1;
					ads.set(tabId, 1);
				}
				entry.elements.ads = entry.elements.ads + 1;
				chrome.browserAction.setBadgeText({text: entry.elements.ads.toString(), tabId: tabId});
			} */

		}
    },
    {urls: ["<all_urls>"]},
    []
);

chrome.webRequest.onCompleted.addListener(function (details) {
		var tabId = details.tabId;
		var requestId = details.requestId;
		if(tabId && tabId !== -1) {	//check if tabId is valid
	  		var entry = tabs.get(tabId);
			if(typeof entry !== "undefined") {	//check if an entry exists for this tab
				var reqEntry = entry.reqMap.get(requestId);
				if(typeof reqEntry !== "undefined") {	//check if requestId is already used
					reqEntry.completed = details.timeStamp;
					reqEntry.finished = true;
				}
				else {
					console.log("onCompleted: requestId not in map");
				}
			}
		}
	},
	{urls: ["<all_urls>"]}
);

chrome.webRequest.onSendHeaders.addListener(function (details) {
		var tabId = details.tabId;
		var requestId = details.requestId;
		if(tabId && tabId !== -1) {	//check if tabId is valid
	  		var entry = tabs.get(tabId);
			if(typeof entry !== "undefined") {	//check if an entry exists for this tab
				var reqEntry = entry.reqMap.get(requestId);
				if(typeof reqEntry !== "undefined") {	//check if requestId is already used
					reqEntry.requestSent = details.timeStamp;
				}
				else {
					console.log("onSendHeaders: requestId not in map");
				}
			}
		}
	},
	{urls: ["<all_urls>"]}
);

chrome.webRequest.onResponseStarted.addListener(function (details) {
		var tabId = details.tabId;
		var requestId = details.requestId;
		if(tabId && tabId !== -1) {	//check if tabId is valid
	  		var entry = tabs.get(tabId);
			if(typeof entry !== "undefined") {	//check if an entry exists for this tab
				var reqEntry = entry.reqMap.get(requestId);
				if(typeof reqEntry !== "undefined") {	//check if requestId is already used
					reqEntry.responseReceived = details.timeStamp;
				}
				else {
					console.log("onResponseStarted: requestId not in map");
				}
			}
		}
	},
	{urls: ["<all_urls>"]}
);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // This cache stores page load time for each tab, so they don't interfere
        /*chrome.storage.local.get('cache', function(data) {
            if (!data.cache) data.cache = {};
            data.cache['tab' + sender.tab.id] = request.timing;
            chrome.storage.local.set(data);
        });
        chrome.browserAction.setBadgeText({text: request.time, tabId: sender.tab.id});*/
		var entry = tabs.get(sender.tab.id);
        if(typeof entry !== "undefined") {
        	entry.plt.dom = request.DOMTime;
        	entry.plt.load = request.loadTime;
        }
    }
);

function getEasyList() {
	console.log("getEasyList function called");
	//let parsedFilterData = {};
	/*
	var rawFile = new XMLHttpRequest();
	var link = "https://easylist-downloads.adblockplus.org/easylist.txt";
	rawFile.open("GET", link, true);
	rawFile.onreadystatechange = function ()
	{
	    if(rawFile.readyState === 4)
	    {
	        if(rawFile.status === 200 || rawFile.status == 0)
	        {
	            var easyListTxt = rawFile.responseText;
	            //alert(allText);

	            console.log("easyList downloaded");
	 */
	            parse();
	            console.log("easyList parsed");
	/*
	        }
	    }
	}

	rawFile.send();
	*/
};

