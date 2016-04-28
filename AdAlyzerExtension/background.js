var m = new Map();

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) { 
		console.log("bg message received, tabID: " + sender.tab.id + " img: " + message.imgCount);
		m.set(sender.tab.id, message.imgCount);
		
	 });

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
   console.log("tabID: " + tabId + "closed");
   m.delete(tabId);
});

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