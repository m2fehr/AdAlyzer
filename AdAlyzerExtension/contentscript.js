

/*
	var imageCount = 0;
	
	imageCount = document.getElementsByTagName('img').length;
	console.log("image count = " + imageCount);
	chrome.runtime.sendMessage( {'imgCount': imageCount});
*/

(function() {
    if (document.readyState == "complete") {
        measure();
    } else {
        window.addEventListener("load", measure);
    }
    
    function measure() {
        setTimeout(function() {
            var t = performance.timing;
            var start = t.redirectStart == 0 ? t.fetchStart : t.redirectStart;
            if (t.loadEventEnd > 0) {
                // we have only 4 chars in our disposal including decimal point
                var DOMTime = String(((t.domContentLoadedEventEnd  - start) / 1000).toPrecision(4)).substring(0, 5);
                var loadTime = String(((t.loadEventEnd - start) / 1000).toPrecision(4)).substring(0, 5);
                //var roe = chrome.runtime && chrome.runtime.sendMessage ? 'runtime' : 'extension';


                chrome.runtime.sendMessage({DOMTime: DOMTime, loadTime: loadTime});
            }
        }, 0);
    }
})();