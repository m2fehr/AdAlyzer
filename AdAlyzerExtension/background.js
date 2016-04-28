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

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
    	var tabId = details.tabId;
      	if(tabId && tabId !== -1) {
			var reqCount = reqs.get(tabId);
			if(reqCount) {
				reqs.set(tabId, reqCount + 1);
			}
			else {
				reqs.set(tabId, 1);
				console.log("new Tab was added to Map, Id: " + tabId);
			}
			if(details.url.indexOf('ad') !== -1) {
				var adsCount = ads.get(tabId);
				if(adsCount) {
					ads.set(tabId, adsCount + 1);
				}
				else {
					ads.set(tabId, 1);
				}
			} 
		}
    },
    {urls: ["<all_urls>"]},
    []
);

