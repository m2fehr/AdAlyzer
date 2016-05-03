

function parse() {
	console.log("parsing...");
	var rawFile = new XMLHttpRequest();
	var link = "https://easylist-downloads.adblockplus.org/easylist.txt";
	rawFile.open("GET", link, true);
	rawFile.onreadystatechange = function ()
	{
		if(rawFile.readyState === 4)
		{
			if(rawFile.status === 200 || rawFile.status == 0)
			{
				var allText = rawFile.responseText;
				alert(allText);
				console.log("parsing finished");
				console.log(allText.length);
			}
		}
	}
	rawFile.send();

};

function match(url) {
	console.log("matching url: " + url);
};


/*
Zum Teste:
chasch i de konsole vo de hintergrundsite eifach die funktione ufrüefe
z.B: "match("http://google.com");" oder "parse("sampleText");"

Wennds mit de easylist wetsch versueche, gisch id konsole "getEasyList();" ih,
den rüefts der d parse function mit de easylist als parameter uf.

*/