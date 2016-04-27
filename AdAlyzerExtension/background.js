var imgCount = 0;

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) { 
		console.log("bg message received");
		imgCount = message.imgCount;
		
	 });