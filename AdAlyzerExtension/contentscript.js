


	var imageCount = 0;
	
	imageCount = document.getElementsByTagName('img').length;
	console.log("image count = " + imageCount);
	chrome.runtime.sendMessage( {'imgCount': imageCount});