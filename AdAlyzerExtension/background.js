
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
	entry.rating.total = '';
	entry.rating.plt = '';
	entry.rating.ads = '';
	entry.rating.tracking = '';
};


var tabs = new Map();

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
   	tabs.delete(tabId);
});

chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
   	tabs.delete(removedTabId);
});

//Reset the Counter when new url is loaded
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.status === "loading") {
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

				//Differentiat between Content Type the example way
				//-------------------------------------------------
				var type = 'Content';
				if(details.url.indexOf('ad') !== -1) {
					type = 'Ads';
					entry.elements.ads = entry.elements.ads + 1;
					chrome.browserAction.setBadgeText({text: entry.elements.ads.toString(), tabId: tabId});
				}
				else {
					if((details.url.indexOf('track') !== -1) || (details.url.indexOf('analy') !== -1)) {
						type = 'Tracking';
						entry.elements.tracker = entry.elements.tracker + 1;
					}
					else {
						entry.elements.content = entry.elements.content + 1;
					}
				}
				//-------------------------------------------------

				//Differentiat between Content Type the right way
				/*
				var type = match({tabId: tabId, requestId: requestId, resourceType: details.type, url: details.url});
				switch (type) {
					case 'content':
						entry.elements.content = entry.elements.content + 1;
						break;
					case 'ad':
						entry.elements.ads = entry.elements.ads + 1;
						chrome.browserAction.setBadgeText({text: entry.elements.ads.toString(), tabId: tabId});
						break;
					case 'tracker':
						entry.elements.tracker = entry.elements.tracker + 1;
						break;
					case '-':
						break;
					default:
						type = '-';
				}
				*/

				//check for https
				/*
				if(details.url.startsWith('https')) {
					type = type + '(s)';
				}
				*/
				entry.reqMap.set(requestId, {url: details.url, requestSent: 0, responseReceived: 0, completed: 0, finished: false, contentType: type});
			}
			else {
				console.log("onBeforeRequest: requestId already in map");
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

/*
Unterscheiden nach msgType
*/
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
  		switch (request.msgType) {
		  case 'plt':
		  	var entry = tabs.get(sender.tab.id);
	        if(typeof entry !== "undefined") {
	        	entry.plt.dom = request.DOMTime;
	        	entry.plt.load = request.loadTime;
	        }
		    break;
		  case 'match':
		  	//ToDo: implement correct logic
		  	console.log("bg.js: Match message received, type = " + request.contentType);
		    break;
		  default:
		    console.log("Unknown Message received");
		}
		
    }
);

function getEasyList() {
	console.log("getEasyList function called");

	//get easylist

	//parameter, damit parser weiss, dass es sich um easylist handelt. (auslesen aus speicher).
	var listname = "easyList";

	var rawFile = new XMLHttpRequest();
	var link = "https://easylist-downloads.adblockplus.org/easylist.txt";
	var easyListAsArray;

	//löschen des Speichers, damit keine konflikte mit alten Listen passieren.
	chrome.storage.local.clear();
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
				easyListAsArray = easyListTxt.split('\n');

				//aufrufen der parse-funktion.
				parse(listname, easyListAsArray);
	        }
	    }
	};
	rawFile.send();
	console.log("bearbeitung EasyList beendet");

	//get EasyPrivacy

	//parameter, damit parser erkennt dass es sich um easyPrivacy handelt (auslesen aus speicher).
	var filename = "easyPrivacy";

	var file = new XMLHttpRequest();
	var filelink = "https://easylist-downloads.adblockplus.org/easyprivacy.txt";
	var easyPrivacyAsArray;
	file.open("GET", filelink, true);
	file.onreadystatechange = function ()
	{
		if(file.readyState === 4)
		{
			if(file.status === 200 || file.status == 0)
			{
				var easyPrivacyTxt = file.responseText;
				//alert(allText);
				console.log("easyPrivacy downloaded");
				easyPrivacyAsArray = easyPrivacyTxt.split('\n');

				//aufruf der parse-funktion.
				parse(filename, easyPrivacyAsArray);
			}
		}
	};
	console.log("bearbeitung easyprivacy beendet");

	file.send();

}

