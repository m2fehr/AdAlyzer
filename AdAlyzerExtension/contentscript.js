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
    function(reqDetails, sender, matches) {
        var contentType = "match";
        for(var i = 0; i < matches.length; i++){
            var selector = matches[i];
            if(document.querySelector(selector.Matchrule)){
                contentType = "ad";
                break;
            }
        }
        chrome.runtime.sendMessage('match', contentType, sender);
    }
);