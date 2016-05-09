

function parse() {
	/*
	Lesen des Codes auf eigene Gefahr.
	 */
	console.log("parsing...");
	var rawFile = new XMLHttpRequest();
	var link = "https://easylist-downloads.adblockplus.org/easylist.txt";

	//Hier wird die easyList als Array gespeichert.
	var easyListAsArray;

	/*
	 In diesem Array wird die geparste EasyList gespeichert.
	 Dabei stellt jedes Element des Arrays einen Eintrag der EasyList dar.
	 */
	var rule_List = [];

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
					//ExceptionRule zeigt an, dass es sich um eine Ausnahmeregel (beginnt mit @@ ODER enthält ein @ bei einer HidingRule) handelt und somit keine Werbung ist wenn es matcht. Eine Ausnahmeregelung auf einer Whitelist wird wie Werbung behandelt.
					//HidingRule zeigt an, ob es sich um eine Regel zum Verstecken eines Elementes handelt (###, ##, #@#, #@##)
					//Options zeigt an, ob es Optionen (nach dem $ Zeichen) gibt, welche berücksichtigt werden müssen
					//URLStart zeigt an, ob die matchrule am Anfang der URL stehen muss (| am Anfang).
					//URLEnd zeigt an, ob die matchrule am Ende der URL stehen muss (| am Ende).
					//URLWithSubdomain zeigt an, ob der matchrule http, https, subdomain vorangehen kann (|| am Anfang)
					//HidingOption gibt an, wie das Element mittels der in "Matchrule" angegebenen Bezeichnung gefunden wird. (id, class, html-tag (div, a, table, tb,...))
					//Matchrule enthält den mit der URL zu vergleichenden String ODER bei einer HidingRule der Name des Elements.
					//OptionList enthält die für diese Matchrule geltenden Regeln.
					//DomainList enthält ENTWEDER die URLs, welche in der Option domain=... definiert wurden, ODER bei einer HidingRule, welche nicht generell gilt, die entsprechenden URL's.
					var rule = {ExceptionRule: 0, HidingRule: 0, Options: 0, URLStart: 0, URLEnd: 0, URLWithSubdomain: 0, HidingOption: "", Matchrule: "", OptionList: [], DomainList: []};

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
							temp.slice(2);
						}else{
							//Ist Whitelist. Ist Werbung, welche jedoch nicht blockiert wird.
							//Entfernen der @@ und weiterfahren wie mit normaler Regel.
							temp.slice(2);
						}
					}

					/*TODO:
					Behandeln der zu versteckenden Elemente (###, ##., ##)

					--> Beachten ob Whitelist (ebenfalls werbung)
					--> Ausnahmeregeln (#@#, #@##) hier regeln oder bei matchrule?
					 */

					var hpos = temp.indexOf("#");

					//Testen, ob # in der Regel vorkommt. Wenn nicht, kann es sich nicht um eine HideRule handeln und muss hier nicht weiter bearbeitet werden.
					if(hpos != -1){
						//Testen, ob # am Anfang der Regel steht.
						if(hpos == 1){
							//Testen, ob ### (id)
							if(temp.indexOf("###" != -1)){
								rule.HidingRule = 1;
								rule.HidingOption = "id";

								//Löschen der ###
								temp.slice(3);
								/*
								TODO: Test auf > und + nach ID
								Es gibt bei ### zwei zusätzliche Optionen, welche getestet werden müssen.
								1. (Beispiel: ###advert > .link) advert stellt dabei die ID dar, link eine Class. In diesem Fall soll die Regel auf Elemente mit der angegebenen Klasse (hier "link") matchen, welche von Elementen mit der angegebenen ID (hier advert) umgeben sind.
								2. (Beispiel: ###advert + .link) advert ist wieder die ID, link eine Klasse. Die Regel soll auf Elemente der angegebenen Klasse (hier "link") matchen, welchen unmittelbar ein Element mit der angegebenen ID (hier advert) vorangeht.
								 Aktuell werden diese spezialregeln ignoriert und wie normale ids unbehandelt hinzugefügt.
								 */

								//id als Matchrule zu rule hinzufügen.
								rule.Matchrule = temp;

								//verarbeitung des Elementes abgeschlossen.
								continue;
							}
							//test ob ##. (class)
							else if(temp.indexOf("##.") != -1){
								rule.HidingRule = 1;
								rule.HidingOption = "class";

								//Löschen von ##.
								temp.slice(3);

								//class als matchrule zu rule hinzufügen.
								rule.Matchrule = temp;

								//verarbeitung des Elementes abgeschlossen.
								continue;
							}

							//testen ob ##
							else if(temp.indexOf("##") != -1){
								rule.HidingRule = 1;
								rule.HidingOption = "html-tag";

								//Löschen von ##
								temp.slice(2);

								//Element als matchrule zu rule hinzufügen.
								rule.Matchrule = temp;

								/*
								TODO:
								temp enthält (nach entfernen der ##) noch den html-tag sowie Klammern und allenfalls Sonderzeichen (Bsp: div[id^="div-adtech-ad-"]) muss bereinigt bzw. zu regex umgeformt werden.
								allenfalls kann der html-tag auch als HidingOption hinzugefügt werden.
								 */

								//verarbeitung des Elementes abgeschlossen.
								continue;
							}

							else{
								alert("unknown rule option: " + temp);
							}
						}

						//# steht nicht am Anfang der Regel.
						//Test ob ###.
						else if(temp.indexOf("###") != -1){
							//ID, welche auf bestimmte Domains beschränkt ist.
							//search.safefinder.com,search.snap.do,search.snapdo.com###ATopD

							//setzen der Parameter auf der rule.
							rule.HidingOption = "id";
							rule.HidingRule = 1;

							//unterteilen des strings in domains und matchrule.
							var position = temp.indexOf("###");
							var substrng = temp.slice(0, position);
							temp = temp.slice(position + 3);

							//erstellen eines Arrays mit den domains und hinzufügen zur domainlist.
							substrng = substrng.split(",");
							for(var ii = 0; ii<substrng.length; ii++){
								rule.DomainList.push(substrng[ii]);
							}

							//id als matchrule speichern.
							rule.Matchrule = temp;

							continue;
						}

						else if(temp.indexOf("##.") != -1 && temp.indexOf("@#") == -1){
							//#@#. ist eine Ausnahmeregel welche ausgeschlossen werden muss.
							//class, welche auf bestimmte Domains beschränkt ist.
							//irna.ir,journalofaccountancy.com,newvision.co.ug##.Advertisement

							//setzen der Parameter auf der rule
							rule.HidingOption = "class";
							rule.HidingRule = 1;

							//unterteilen von temp in domains und matchrule
							var positionx = temp.indexOf("##.");
							var substrngx = temp.slice(0, positionx);
							temp = temp.slice(positionx + 3);

							//erstellen des arrays mit den domains und hinzufügen zur domainlist
							substrngx = substrngx.split(",");
							for(var iix = 0; iix<substrngx.length; iix++){
								rule.DomainList.push(substrngx[iix]);
							}

							//class als matchrule speichern
							rule.Matchrule = temp;

							continue;
						}

						else if(temp.indexOf("##") != -1 && temp.indexOf("@#") == -1){
							//html-tag. #@#, #@## sind valide ExceptionRules und müssen hier daher ausgeschlossen werden.
							//4chan.org,crackdump.com##[width="468"]

							//setzen der Parameter auf der rule
							rule.HidingOption = "html-tag";
							rule.HidingRule = 1;

							//unterteilen von temp in domains und matchrule
							var positiony = temp.indexOf("##");
							var substrngy = temp.slice(0, positiony);
							temp = temp.slice(positiony + 2);

							//erstellen des arrays mit den domains und hinzufügen zur domainlist
							substrngy = substrngy.split(",");
							for(var iiq = 0; iiq<substrngy.length; iiq++){
								rule.DomainList.push(substrngy[iiq]);
							}

							//html-tag info als matchrule speichern
							rule.Matchrule = temp;

							/*
							 TODO:
							 temp enthält (nach entfernen der ##) noch den html-tag (falls einer vorhanden) sowie Klammern und allenfalls Sonderzeichen (Bsp: div[id^="div-adtech-ad-"]) muss bereinigt bzw. zu regex umgeformt werden.
							 allenfalls kann der html-tag auch als HidingOption hinzugefügt werden.
							 */

							continue;
						}

						//Behandeln der Ausnahmeregeln #@## (ID), #@#.(class)
						//Beides sind jeweils Ausnahmeregeln für Werbungen, welche jedoch zugelassen werden (Whitelist) müssen also dennoch als Werbung gezählt werden.
						else if(temp.indexOf("#@##") != -1){
							//3dmark.com,yougamers.com#@##takeover_ad

							//setzten der Parameter der rule
							rule.HidingOption = "id";
							rule.HidingRule = 1;

							//unterteilen in domains und matchrule
							var positionexep = temp.indexOf("#@##");
							var substrngexep = temp.slice(positionexep + 4);
							temp = temp.slice(0, positionexep + 4);

							//erstellen des arrays mit den domains und hinzufügen zur domainlist
							substrngexep = substrngexep.split(",");
							for(var countx = 0; countx<substrngexep.length; countx++){
								rule.DomainList.push(substrngexep[countx]);
							}

							//id als matchrule speichern
							rule.Matchrule = temp;

							continue;
						}

						else if(temp.indexOf("#@#.") != -1){
							//bash.fm,tbns.com.au#@#.ad-block

							//setzten der Parameter der rule
							rule.HidingOption = "class";
							rule.HidingRule = 1;

							//unterteilen in domains und matchrule
							var positionexep2 = temp.indexOf("#@#.");
							var substrngexep2 = temp.slice(positionexep2 + 4);
							temp = temp.slice(0, positionexep2 + 4);

							//erstellen des arrays mit den domains und hinzufügen zur domainlist
							substrngexep2 = substrngexep2.split(",");
							for(var county = 0; county<substrngexep2.length; county++){
								rule.DomainList.push(substrngexep2[county]);
							}

							//id als matchrule speichern
							rule.Matchrule = temp;

							continue;
						}

						else{
							//allenfalls unbekannte regel.
							//# könnte auch teil der URL etc. sein.
							//alert("unbekannte regel: "+temp);
						}

						/*
						 TODO:
						 Auch hier scheint es Spezialregeln mit CSS selektoren zu geben (infowars.com##.entry-content > div + div + * + [class]) Auf der Seite von AdBlockPlus wird dies jedoch nicht klar erwähnt...
						 */
					}



					//Testen ob es Optionen gibt.
					var pos = temp.indexOf("$");
					if(pos != -1) {
						//Setzen des Flags.
						rule.Options = 1;

						//Extrahieren der Optionen aus temp und speichern in OptionList.
						var rules = temp.substring(pos + 1);
						temp = temp.substring(0, pos);

						//Speichern der Regeln
						rules = rules.split(',');
						for (var k = 0; k < rules.length; k++) {
							var str = rules[k];

							//Fall "Domain="-Regel, speichern aller spezifizierten Domains in der DomainList.
							if(str.indexOf("domain") != -1){
								var temppos = str.indexOf("=");
								var temprules = str.slice(temppos+1);
								str=str.slice(0, temppos);
								temprules = temprules.split('|');
								for(var z = 0; z<temprules.length; z++){
									rule.DomainList.push(temprules[z]);
								}
							}
							rule.OptionList.push(str);
						}

					}


					/*
					 TODO:
					 URLStart (Zeichen | am anfang der regel
					 URLEnd (Zeichen | am ende der regel) ACHTUNG: Nicht immer nur ein | am ende. Testen wie korrekt. | wird auch zum Aufzählen von Domains verwendet.
					 URLWithSubdomain (Zeichen || am anfang der regel)
					 */

					/*
					 TODO:
					 temp zu matchrule hinzufügen. ersetzen der Zeichen durch regex (*,^,|,||,...)
					 */

					/*
					TODO: Important!!!
					bei den continue's werden die rules zwar korrekt erstellt, jedoch nicht zur rulelist hinzugefügt da die for-loop vorher verlassen wird. Wie regeln? verschieben des rule_List.push, aufruf vor continue oder ohne continue?
					 */
					rule_List.push(rule);
				}

				console.log(matching_rules);
				console.log("parsing finished");

			}
		}
	};
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