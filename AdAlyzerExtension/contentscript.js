

/*
	var imageCount = 0;
	
	imageCount = document.getElementsByTagName('img').length;
	console.log("image count = " + imageCount);
	chrome.runtime.sendMessage( {'imgCount': imageCount});


	var requestCount = 0;
	
	chrome.webRequest.onBeforeRequest.addListener(
        function(details) {
          requestCount = requestCount + 1;
          console.log("request from tab: " + details.tabId);
          chrome.runtime.sendMessage( {'tabId': details.tabId, 'messageType': 'request'});
        });*/