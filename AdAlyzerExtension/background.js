

//Every Tab gets such a object in the tabs-Map
tabEntry = function () {
    return {
        reqMap: new Map(),
        plt: {dom: 0, load: 0},
        elements: {ads: 0, tracker: 0, content: 0},
       	originUrl: '',
       	adFrames: []
    }
};

function resetTabEntry(entry) {
	if (entry) {
		entry.reqMap.clear();
		entry.plt.dom = 0;
		entry.plt.load = 0;
		entry.elements.ads = 0;
		entry.elements.tracker = 0;
		entry.elements.content = 0;
		entry.originUrl = '';
		entry.adFrames = [];
	}
};


var tabs = new Map();

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
   	tabs.delete(tabId);
});

chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
   	tabs.delete(removedTabId);
});

function getReqEntry(tabId, requestId) {
	if(tabId && tabId !== -1) {	//check if tabId is valid
  		var entry = tabs.get(tabId);
		if(typeof entry !== "undefined") {	//check if an entry exists for this tab
			var reqEntry = entry.reqMap.get(requestId);
			if(typeof reqEntry !== "undefined") {	//check if requestId is already used
				return reqEntry;
			}
		}
	}
	return -1;
}

function incrementTypeCount(tabId, entry, type) {
	switch (type) {
		case "content":
			entry.elements.content = entry.elements.content + 1;
			break;
		case "ad":
			entry.elements.ads = entry.elements.ads + 1;
			chrome.browserAction.setBadgeText({text: entry.elements.ads.toString(), tabId: tabId});
			break;
		case "tracker":
			entry.elements.tracker = entry.elements.tracker + 1;
			break;
		default: 
			console.log("incrementTypeCount: default case, type:" + type);
	}
}

function decrementTypeCount(tabId, entry, type) {
	switch (type) {
		case "content":
			entry.elements.content = entry.elements.content - 1;
			break;
		case "ad":
			entry.elements.ads = entry.elements.ads - 1;
			chrome.browserAction.setBadgeText({text: entry.elements.ads ? entry.elements.ads.toString() : '', tabId: tabId});
			break;
		case "tracker":
			entry.elements.tracker = entry.elements.tracker - 1;
			break;
		default: 
			console.log("decrementTypeCount: default case, type:" + type);
	}
}

chrome.webRequest.onBeforeRequest.addListener(function(details) {
    	var tabId = details.tabId;
    	var requestId = details.requestId;

      	if(tabId && tabId !== -1) {	//check if tabId is valid

      		var entry = tabs.get(tabId);

			if(typeof entry === "undefined") {	//check if an entry exists for this tab
				entry = tabEntry();
				tabs.set(tabId, entry);
			} else {
				if (details.type === 'main_frame') {
					resetTabEntry(tabs.get(tabId));	//new site
				}
			}
			
			if(details.type === "main_frame") {
				entry.originUrl = details.url;
			}

			var reqEntry = entry.reqMap.get(requestId);

			if(typeof reqEntry === "undefined") {	//check if requestId is already used

				var type = match({tabId: tabId, requestId: requestId, resourceType: details.type, url: details.url, originUrl: entry.originUrl});
				incrementTypeCount(tabId, entry, type);
				entry.reqMap.set(requestId, {url: details.url, requestSent: 0, responseReceived: 0, completed: 0, finished: false, contentType: type, resourceType: details.type, frameId: details.frameId});
				var requestingFrameId = (details.type === 'sub_frame' ? details.parentFrameId : details.frameId);
				if((type === "ad") && (entry.adFrames.indexOf(requestingFrameId) === -1)) {
					entry.adFrames.push(requestingFrameId);
				}
			}
			else {
				var oldType = reqEntry.contentType;
				var newType = match({tabId: tabId, requestId: requestId, resourceType: details.type, url: details.url, originUrl: entry.originUrl});
				if (oldType !== newType) {
					//console.log("RequestId: " + requestId + " changed Type from " + oldType + " to " + newType);
					reqEntry.contentType = newType;
					decrementTypeCount(tabId, entry, oldType);
					incrementTypeCount(tabId, entry, newType);
				}
			}
		}
    },
    {urls: ["<all_urls>"]},
    []
);

chrome.webRequest.onCompleted.addListener(function (details) {
		var reqEntry = getReqEntry(details.tabId, details.requestId);
		if (reqEntry !== -1) {
			reqEntry.completed = details.timeStamp;
			reqEntry.finished = true;
		}
	},
	{urls: ["<all_urls>"]}
);

chrome.webRequest.onSendHeaders.addListener(function (details) {
		var reqEntry = getReqEntry(details.tabId, details.requestId);
		if (reqEntry !== -1 && reqEntry.requestSent === 0) {
			reqEntry.requestSent = details.timeStamp;
		}
	},
	{urls: ["<all_urls>"]}
);

chrome.webRequest.onResponseStarted.addListener(function (details) {
		var reqEntry = getReqEntry(details.tabId, details.requestId);
		if (reqEntry !== -1) {
			reqEntry.responseReceived = details.timeStamp;
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
		  default:
		    console.log("Unknown Message received");
		}
		
    }
);


//This method is called when the Extension is activated
window.addEventListener('load', getEasyList);

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

