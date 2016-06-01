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

                chrome.runtime.sendMessage({msgType: 'plt', DOMTime: DOMTime, loadTime: loadTime});
            }
        }, 0);
    }
})();

/*
Funktion, welche den Typ des content bestimmt
Resultat zurück geben: 
chrome.runtime.sendMessage({msgType, contentType, reqDetails}) mit msgType = 'match'
*/

//Called when this Contentscript receives a message
chrome.runtime.onMessage.addListener(
    function(msg, sender, sendResponse) {
        var contentType = "content";
        //console.log("content Script recived: " + msg.matches.length);
        for(var i = 0; i < msg.matches.length; i++){
            var selector = msg.matches[i];
            //console.log(selector.Matchrule);
            var x = document.querySelector(selector.Matchrule);
            if(x){
                contentType = "ad";
               // console.log("match in ContentScript");
               // console.log(selector.Matchrule + "         " + x);
                break;
            }
        }
        chrome.runtime.sendMessage({msgType: 'match', contentType: contentType, reqDetails: msg.reqDetails});
    }
);