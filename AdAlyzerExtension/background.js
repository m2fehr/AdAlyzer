
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
    		console.log("reqId[" + key + "] = " + value.url);
	});	
});

*/

var tabs = new Map();
var ads = new Map();

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
   	tabs.delete(tabId);
   	ads.delete(tabId);
   	console.log("tabID: " + tabId + "closed, length now: " + tabs.size);
   	tabs.forEach(function(value, key, map) {
    	console.log("tabs[" + key + "] = " + value.size);
	});
});

chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
   	tabs.delete(removedTabId);
   	ads.delete(tabId);
   	console.log("tabID: " + removedTabId + "replaced, length now: " + tabs.size);
});

//Reset the Counter when new url is loaded
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.status === "loading") {
		
		//tabs.set(tabId, 0);
		var reqs = tabs.get(tabId);
		if(typeof reqs !== "undefined") {
			reqs.clear();
			console.log("reseted counter for tab " + tabId);
		}
		ads.set(tabId, 0);
	}
});

chrome.webRequest.onBeforeRequest.addListener(function(details) {
    	var tabId = details.tabId;
    	var requestId = details.requestId;

      	if(tabId && tabId !== -1) {	//check if tabId is valid

      		var tabEntry = tabs.get(tabId);

			if(typeof tabEntry === "undefined") {	//check if an entry exists for this tab
				var reqMap = new Map();
				reqMap.set(requestId, {url: details.url});
				tabs.set(tabId, reqMap);
			}
			
			else {
				var reqEntry = tabEntry.get(requestId);

				if(typeof reqEntry === "undefined") {	//check if requestId is already used
					tabEntry.set(requestId, {url: details.url});
				}
				else {
					console.log("onBeforeRequest: requestId already in map");
				}
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
			if(details.url.indexOf('ad') !== -1) {	//ToDo: Check for Ads
				var adsCount = ads.get(tabId);
				if(typeof adsCount !== "undefined") {
					adsCount = adsCount + 1;
					ads.set(tabId, adsCount);
				}
				else {
					adsCount = 1;
					ads.set(tabId, 1);
				}
				chrome.browserAction.setBadgeText({text: adsCount.toString(), tabId: tabId});
			} 

		}
    },
    {urls: ["<all_urls>"]},
    []
);

chrome.webRequest.onCompleted.addListener(function (details) {
		var tabId = details.tabId;
		var requestId = details.requestId;
		if(tabId && tabId !== -1) {	//check if tabId is valid
	  		var tabEntry = tabs.get(tabId);
			if(typeof tabEntry !== "undefined") {	//check if an entry exists for this tab
				var reqEntry = tabEntry.get(requestId);
				if(typeof reqEntry !== "undefined") {	//check if requestId is already used
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

