

function parse() {
	console.log("parsing...");
	var rawFile = new XMLHttpRequest();
	var link = "https://easylist-downloads.adblockplus.org/easylist.txt";
	var easyListAsArray;
	var matching_rules = [];
	rawFile.open("GET", link, true);
	rawFile.onreadystatechange = function ()
	{
		if(rawFile.readyState === 4)
		{
			if(rawFile.status === 200 || rawFile.status == 0)
			{
				var allText = rawFile.responseText;
				console.log(allText.length);
				//alert(allText);
				easyListAsArray = allText.split('\n');
				//alert(easyListAsArray);
				console.log(easyListAsArray);
				var whitelist = 0;

				for(var i = 1; i < easyListAsArray.length; i++){
					console.log("Start der for-loop");
					//das erste Element der EasyList kann ignoriert werden, daher i = 1.
					//temp ist das aktuell behandelte Element aus der EasyList.
					var temp = easyListAsArray[i];

					//rule ist die Variable, in welches temp nach dem Parsen gespeichert wird.
					//0 = nein, 1 = ja
					//ExceptionRule zeigt an, dass es sich um eine Ausnahmeregel (beginnt mit @@) handelt und somit keine Werbung ist wenn es matcht.
					//Options zeigt an, ob es Optionen (nach dem $ Zeichen) gibt, welche berücksichtigt werden müssen
					//URLStart zeigt an, ob die matchrule am Anfang der URL stehen muss (| am Anfang).
					//URLEnd zeigt an, ob die matchrule am Ende der URL stehen muss (| am Ende).
					//URLWithSubdomain zeigt an, ob der matchrule http, https, subdomain vorangehen kann (|| am Anfang)
					//Matchrule enthält den mit der URL zu vergleichenden String.
					//OptionList enthält die für diese Matchrule geltenden Regeln.
					var rule = {ExceptionRule: 0, Options: 0, URLStart: 0, URLEnd: 0, URLWithSubdomain: 0, Matchrule: "", OptionList: []};

					console.log(temp);
					console.log(rule);

					//Ignorieren falls Kommentar (regel beginnt mit !)
					if(temp.charAt(0) == '!'){
						//Analysieren, ob Beginn der Whitelist.
						if(temp.indexOf("***") != -1 && temp.indexOf("easylist:easylist") != -1 && temp.indexOf("whitelist") != -1){

							//Whitelist beginnt hier
							whitelist = 1;

						//Analysieren, ob Ende der Whitelist.
						}else if (temp.indexOf("***") != -1 && temp.indexOf("easylist:easylist") != -1 && temp.indexOf("whitelist") == -1){

							//Whitelist endet hier
							whitelist = 0;
						}
						continue;
					}

					//testen ob Ausnahmeregel (String beginnt mit @@).
					if(temp.indexOf("@@") == 0){

						//Testen ob Whitelist
						if(whitelist == 0) {
							//Ist nicht Whitelist. Ist Ausnahmeregel und keine Werbung.
							rule.ExceptionRule = 1;
						}else{
							//Ist Whitelist. Ist Werbung, welche jedoch nicht blockiert wird.
							//Entfernen der @@ und weiterfahren wie mit normaler Regel.
							temp.slice(2);
						}
					}




					matching_rules.push(rule);
				}

				console.log(matching_rules);

				console.log("parsing finished");

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