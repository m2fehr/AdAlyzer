/*
var m = new Map();

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) { 
		console.log("bg message received, tabID: " + sender.tab.id + " img: " + message.imgCount);
		m.set(sender.tab.id, message.imgCount);
		
	 });

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
   console.log("tabID: " + tabId + "closed");
   m.delete(tabId);
});
*/

//Map Overview
/*
var m = new Map();
var key1 = 'key1';
var key2 = {};
var key3 = {};

m.set(key1, 'value1');
m.set(key2, 'value2');

console.assert(m.has(key2), "m should contain key2.");
console.assert(!m.has(key3), "m should not contain key3.");
*/

var reqs = new Map();
var ads = new Map();

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
   	reqs.delete(tabId);
   	ads.delete(tabId);
   	console.log("tabID: " + tabId + "closed, length now: " + reqs.size);
   	reqs.forEach(function(value, key, map) {
    	console.log("reqs[" + key + "] = " + value);
});
});

chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
   	reqs.delete(removedTabId);
   	ads.delete(tabId);
   	console.log("tabID: " + removedTabId + "replaced, length now: " + reqs.size);
});

//Reset the Counter when new url is loaded
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.status === "loading") {
		console.log("reseted counter for tab " + tabId);
		reqs.set(tabId, 0);
		ads.set(tabId, 0);
	}
});

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
    	var tabId = details.tabId;
      	if(tabId && tabId !== -1) {
			var reqCount = reqs.get(tabId);
			if(typeof reqCount !== "undefined") {
				reqs.set(tabId, reqCount + 1);
			}
			else {
				reqs.set(tabId, 1);
				console.log("new Tab was added to Map, Id: " + tabId);
			}
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

