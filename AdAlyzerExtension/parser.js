var MAX_CACHE_SIZE = 200;

var EasyList;
var HidingList;
var PrivacyList;
var EasyListMatchCache = [];
var PrivacyListMatchCache = [];


function parse(listname, list) {
	/*
	Lesen des Codes auf eigene Gefahr.
	 */
	console.log("parsing...");

	var easyListAsArray = list;
	var name = listname;

	console.log("name der Liste: " + name);

		//In diesem Array werden die Blockierregeln der geparsten EasyList gespeichert. Dabei stellt jedes Element des Arrays einen Eintrag der EasyList dar.
		var parsedEasyList = [];

		// in diesem Array werden die Hiding Rules der geparsten EasyList gespeichert.
		var parsedHidingList = [];

				console.log(easyListAsArray.length);

				/*
				TODO: Entfernen, Teststring um Parser zu Testen!
				 */
				//var teststring = "&ad_box_, -ad-banner., /ad-iframe., /au2m8_preloader/*, /contentad|, ://affiliate.$third-party, -120-600., /adServe/*$popup, ###AD_CONTROL_13, ##.six-ads-wrapper, games.com#@##Adcode, " +
				//	"dormy.se,marthastewart.com#@##ad-background, earlyamerica.com,infojobs.net#@#.topads, ||4dsply.com^$third-party, ||62.27.51.163^$third-party,domain=~adlive.de.ip, ||d2ue9k1rhsumed.cloudfront.net^, " +
				//	"||ticketkai.com/banner/, ||tipico.*/affiliate/$third-party, @@||code.jquery.com^$script,third-party,domain=uplod.it, |http://$image,third-party,domain=tinypic.com, beemp3s.org,mnn.com,streamtuner.me###adv, " +
				//	"isup.me###container > .domain + p + br + center:last-child, localmoxie.com##.ads_tilte + .main_mid_ads, statistiks.co.uk,statistiks.com##.adz, mobilelikez.com##div > span:last-child > [id][class], " +
				//	"@@.com/banners, @@||ykhandler.com/adframe.js, @@.com/*.js|$domain=openload.co, @@/adcode.js$domain=cityam.com|techworld.com, ! Game Empire Enterprises, el33tonline.com###AdD";
				//easyListAsArray = teststring.split(', ');

				console.log(easyListAsArray);

				var whitelist = 0;

				console.log("beginne mit for-loop");
				for(var i = 1; i < easyListAsArray.length; i++){
					//console.log("Start der for-loop");
					//das erste Element der EasyList kann ignoriert werden, daher i = 1.

					//temp ist das aktuell behandelte Element aus der EasyList.
					var temp = easyListAsArray[i];

					//rule ist die Variable, in welches temp nach dem Parsen gespeichert wird.
					//0 = nein, 1 = ja
					//ExceptionRule zeigt an, dass es sich um eine Ausnahmeregel (beginnt mit @@ ODER enthält ein @ bei einer HidingRule) handelt und somit keine Werbung ist wenn es matcht. Eine Ausnahmeregelung auf einer Whitelist wird wie Werbung behandelt.
					//HidingRule zeigt an, ob es sich um eine Regel zum Verstecken eines Elementes handelt (###, ##, #@#, #@##)
					//Options zeigt an, ob es Optionen (nach dem $ Zeichen) gibt, welche berücksichtigt werden müssen
					//HidingOption gibt an, wie das Element mittels der in "Matchrule" angegebenen Bezeichnung gefunden wird. (id, class, html-tag (div, a, table, tb,...))
					//Matchrule enthält den mit der URL zu vergleichenden String ODER bei einer HidingRule der Name des Elements.
					//OptionList enthält die für diese Matchrule geltenden Regeln (Bsp: script, image, xmlhttprequest,...).
					//RuleList enthält die für diese Matchrule geltenden Regeleinschränkungen (Bsp: domain=, third-party,...).
					//DomainList enthält ENTWEDER die URLs, welche in der Option domain=... definiert wurden, ODER bei einer HidingRule, welche nicht generell gilt, die entsprechenden URL's.
					var rule = {ExceptionRule: 0, HidingRule: 0, Options: 0, HidingOption: "", Matchrule: "", OptionList: [], RuleList: [], DomainList: []};

					//console.log(temp);

					//gemäss Implementierung von AdBlocker Plus können Regeln fälschlicherweise mit " " oder \r beginnen bzw. enden. Muss behoben werden damit keine Fehler bei der weiteren Verarbeitung entstehen.
					temp = temp.replace(/\r$/, '').trim();

					//Ignorieren falls Kommentar (regel beginnt mit !)
					if(temp.charAt(0) == '!'){
						//Analysieren, ob Beginn der Whitelist.
						if(temp.indexOf("***") != -1 && temp.indexOf("easylist:") != -1 && temp.indexOf("whitelist") != -1){

							//Whitelist beginnt hier
							whitelist = 1;

							//Analysieren, ob Ende der Whitelist.
						}else if (temp.indexOf("***") != -1 && temp.indexOf("easylist:") != -1 && temp.indexOf("whitelist") == -1){

							//Whitelist endet hier
							whitelist = 0;
						}
						//ist kommentar, keine weitere bearbeitung dieser Zeile nötig.
						continue;
					}

					//testen ob Ausnahmeregel (String beginnt mit @@).
					if(temp.indexOf("@@") == 0){

						//Testen ob Whitelist
						if(whitelist == 0) {
							//Ist nicht Whitelist. Ist Ausnahmeregel und keine Werbung.
							rule.ExceptionRule = 1;
							temp = temp.slice(2);
						}else{
							//Ist Whitelist. Ist Werbung, welche jedoch nicht blockiert wird.
							//Entfernen der @@ und weiterfahren wie mit normaler Regel.
							temp = temp.slice(2);
						}
					}

					//Test auf Hiding-Rule (###, ##., ##, #@##, #@#., #@#)
					/*
					TODO:
					Aktuell wird das Content Script nicht verwendet. Daher werden alle Hiding Regeln in eine separate Liste gespeichert. Diese Liste wird aktuell nicht verwendet.
					Im Content Script ist eine mögliche Implementation bereits vorhanden jedoch Auskommentiert.
					WICHTIG:
					Je nach dem, wie im Content Script das html bzw. css durchsucht wird, müssen hier allenfalls die regeln unterschiedlich vorbereitet werden.
					Aktuell wierden sie so geparst, dass sie für "document.querySelector("regel")" geeignet sind.
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

								//id als Matchrule zu rule hinzufügen.
								rule.Matchrule = temp;

								//verarbeitung des Elementes abgeschlossen.
								parsedHidingList.push(rule);
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
								parsedHidingList.push(rule);
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
								parsedHidingList.push(rule);
								continue;
							}

							else{
								console.log("unknown rule option: " + temp);
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
							temp = temp.slice(position + 2);

							//erstellen eines Arrays mit den domains und hinzufügen zur domainlist.
							substrng = substrng.split(",");
							for(var ii = 0; ii<substrng.length; ii++){
								rule.DomainList.push(substrng[ii]);
							}

							//id als matchrule speichern.
							rule.Matchrule = temp;

							//verarbeitung des Elementes abgeschlossen.
							parsedHidingList.push(rule);
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
							temp = temp.slice(positionx + 2);

							//erstellen des arrays mit den domains und hinzufügen zur domainlist
							substrngx = substrngx.split(",");
							for(var iix = 0; iix<substrngx.length; iix++){
								rule.DomainList.push(substrngx[iix]);
							}

							//class als matchrule speichern
							rule.Matchrule = temp;

							//verarbeitung des Elementes abgeschlossen.
							parsedHidingList.push(rule);
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

							//verarbeitung des Elementes abgeschlossen.
							parsedHidingList.push(rule);
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
							var substrngexep = temp.slice(0, positionexep);
							temp = temp.slice(positionexep + 3);

							//erstellen des arrays mit den domains und hinzufügen zur domainlist
							substrngexep = substrngexep.split(",");
							for(var countx = 0; countx<substrngexep.length; countx++){
								rule.DomainList.push(substrngexep[countx]);
								//console.log("domain: " + substrngexep[countx]);
							}

							//id als matchrule speichern
							rule.Matchrule = temp;

							//verarbeitung des Elementes abgeschlossen.
							parsedHidingList.push(rule);
							//console.log("rule: " + rule.Matchrule);
							continue;
						}

						else if(temp.indexOf("#@#.") != -1){
							//bash.fm,tbns.com.au#@#.ad-block

							//setzten der Parameter der rule
							rule.HidingOption = "class";
							rule.HidingRule = 1;

							//unterteilen in domains und matchrule
							var positionexep2 = temp.indexOf("#@#.");
							var substrngexep2 = temp.slice(0, positionexep2);
							temp = temp.slice(positionexep2 + 3);

							//erstellen des arrays mit den domains und hinzufügen zur domainlist
							substrngexep2 = substrngexep2.split(",");
							for(var county = 0; county<substrngexep2.length; county++){
								rule.DomainList.push(substrngexep2[county]);
							}

							//id als matchrule speichern
							rule.Matchrule = temp;

							//verarbeitung des Elementes abgeschlossen.
							parsedHidingList.push(rule);
							continue;
						}

						else{
							//allenfalls unbekannte regel.
							//# könnte auch teil der URL etc. sein.
							//alert("unbekannte regel: "+temp);
						}
					}



					//Testen ob es Optionen gibt.
					var pos = temp.indexOf("$");
					if(pos != -1) {
						//Setzen des Flags.
						rule.Options = 1;

						//Extrahieren der Optionen aus temp und speichern.
						var rules = temp.substring(pos + 1);
						temp = temp.substring(0, pos);

						//Bugfix, auf der EasyPrivacy Liste gibt es regeln, welche das $ zur trennung der regeln brauchen. ersetzen weiterer $ durch ,.
						rules = rules.replace('$', ',');

						//Speichern der Regeln
						rules = rules.split(',');
						for (var k = 0; k < rules.length; k++) {
							//console.log('\n'+"regel: " + rules[k]);
							var str = {rule:"", inverted: 0};
							var tempstr = rules[k].trim();

							//falls die Regel invertiert ist (~), inverted auf 1 setzen und ~ löschen.
							if(tempstr.charAt(0) == '~'){
								str.inverted = 1;
								tempstr = tempstr.slice(1);
							}

							//Testen ob RuleList.
							if(tempstr.indexOf("domain") != -1 || tempstr.indexOf("third-party") != -1 || tempstr.indexOf("sitekey") != -1 || tempstr.indexOf("match-case") != -1 ||
								tempstr.indexOf("collapse") != -1 || tempstr.indexOf("donottrack") != -1 ){
								//console.log("rule-list: " + tempstr + '\n');

								//Fall "Domain="-Regel, speichern aller spezifizierten Domains in der DomainList.
								if(tempstr.indexOf("domain") != -1){
									var temppos = tempstr.indexOf("=");
									var temprules = tempstr.slice(temppos+1);
									tempstr=tempstr.slice(0, temppos);
									temprules = temprules.split('|');
									for(var z = 0; z<temprules.length; z++){
										var domainAsRegex = temprules[z].trim();
										//domainAsRegex = domainAsRegex.replace(/\./, '\\.');
										//rule.DomainList.push(new RegExp(domainAsRegex));
										rule.DomainList.push(domainAsRegex);
									}
								}

								str.rule=tempstr;
								rule.RuleList.push(str);

								//continue;
							}else {

								//es handelt sich nicht um eine Regeleinschränkung.
								//console.log("option-list: " + tempstr);
								str.rule = tempstr;
								rule.OptionList.push(str);
							}
						}
					}

					 //temp zu Regex umformen.
					 //URLStart (Zeichen | am anfang der regel
					 //URLEnd (Zeichen | am ende der regel) ACHTUNG: Nicht immer nur ein | am ende. Testen wie korrekt. | wird auch zum Aufzählen von Domains verwendet.
					 //URLWithSubdomain (Zeichen || am anfang der regel)

					//Testen ob Regel bereits Regex ist. Wenn ja: bearbeitung abschliessen.
					if(/^\/.+\/$/.test(temp)){
						rule.Matchrule = temp;
						parsedEasyList.push(rule);
						continue;
					}

					//Entfernen unnötiger Wildcardfolgen
					if(/\*\*+/.test(temp)) {
						temp.replace(/\*\*+/g, '*');
					}

					//Characters, welche im Regex eine besondere (ungewollte) Bedeutung haben könnten, escapen (ausser *,|,^ --> separat gehandelt).
					temp = temp.replace(/([^a-zA-Z0-9_\|\^\*])/g, '\\$1');

					//^ ist in der Adblock-Synthax ein Platzhalter für Separatoren (alles ausser Buchstaben, Zahlen, _, ., %)
					//WICHTIG: Bei Hiding-Rules kann ^ eine andere Bedeutung haben. Daher ist es wichig dass diese nicht mit den regeln hier behandelt werden.
					temp = temp.replace(/\^/g, '[^\\-\\.\\%a-zA-Z0-9_]');

					//* entspricht in .* --> ersetzen.
					temp = temp.replace(/\*/g, '.*');

					//Behandeln der Regeln | und ||.
					if(/\|/.test(temp)){

						//Test ob Regel mit || beginnt: nur (http(s):// und allenfalls Subdomains vor der Regel
						if(/^\|\|/.test(temp)){
							temp = temp.replace(/^\|\|/, '^[^\\/]+\\:\\/\\/([^\\/]+\\.)?');
						}

						//Test ob Regel mit | beginnt: Regel steht am Anfang der URL
						if(/^\|/.test(temp)){
							temp = temp.replace(/^\|/, '^');
						}

						//Test ob Regel mit | endet: URL muss dort aufhören.
						if(/\|$/.test(temp)) {
							temp = temp.replace(/\|$/, '$');
						}

						//alle anderen | in der Regel sollen Pipes darstellen.
						temp = temp.replace(/\|/g, '\\|');
					}

					//Ersetzen von * am Anfang und Ende der Regel (hat keinen Einfluss auf das Matchen)
					temp = temp.replace(/^\.\*/, '');
					temp = temp.replace(/\.\*$/, '');

					//temp speichern
					rule.Matchrule = temp;

					//console.log(temp + '\n' + rule.Matchrule + "   /    " + rule.DomainList + "   /   " + rule.OptionList + '\n' + rule.RuleList + '\n' + '\n');

					parsedEasyList.push(rule);
				}

				console.log("parsing finished");
				console.log(parsedEasyList.length);
				console.log(parsedHidingList.length);

		//speichern der parsedEasyList
		switch(name){
			case "easyList":
				EasyList = parsedEasyList;
				HidingList = parsedHidingList;
				//chrome.storage.local.set({'parsedEasyList': parsedEasyList}, function(){
				//	console.log("parsedEasyList gespeichert!");
				//});
				//chrome.storage.local.set({'parsedHidingList': parsedHidingList}, function(){
				//	console.log("parsedHidingList gespeichert!");
				//});
				break;
			case "easyPrivacy":
				PrivacyList = parsedEasyList;
				//chrome.storage.local.set({'parsedPrivacyList': parsedEasyList}, function(){
				//	console.log("parsedPrivacyList gespeichert!");
				//});
				break;
			default:
				console.log(name + " - sollte easyList oder easyPrivacy sein...!?!");
		}
}

function getEasyListFromStorage() {
	chrome.storage.local.get('parsedEasyList', function(data){
		if (data) {
			EasyList = data;
			console.log("parsedEasyList geladen!, length: " + data.length);
		}
		else {
			console.log("EasyList is not in storage");
		}
	});
	chrome.storage.local.get('parsedPrivacyList', function(data){
		if (data) {
			PrivacyList = data;
			console.log("parsedPrivacyList geladen!");
		}
		else {
			console.log("PrivacyList is not in storage");
		}
	});
}

// Parse a URL. Based upon http://blog.stevenlevithan.com/archives/parseuri
// parseUri 1.2.2, (c) Steven Levithan <stevenlevithan.com>, MIT License
// Inputs: url: the URL you want to parse
// Outputs: object containing all parts of |url| as attributes
parseUri = function(url) {
  var matches = /^(([^:]+(?::|$))(?:(?:\w+:)?\/\/)?(?:[^:@\/]*(?::[^:@\/]*)?@)?(([^:\/?#]*)(?::(\d*))?))((?:[^?#\/]*\/)*[^?#]*)(\?[^#]*)?(\#.*)?/.exec(url);
  // The key values are identical to the JS location object values for that key
  var keys = ["href", "origin", "protocol", "host", "hostname", "port",
              "pathname", "search", "hash"];
  var uri = {};
  for (var i=0; (matches && i<keys.length); i++)
    uri[keys[i]] = matches[i] || "";
  return uri;
};

/*
checks reqDetails against ruleList, returns the Rule on positive match or null otherwise
*/
function matchList(ruleList, reqDetails) {
	for (var j = 0; j < ruleList.length; j++) {
		var tempRule = ruleList[j];
		//first check options, faster to compare
		if (tempRule.Options == 1){
			//console.log("tempRule Option = 1");
			if(testMatchOptions(reqDetails, tempRule)) {
				var tempMatchRule = new RegExp(tempRule.Matchrule, "i");
				if (tempMatchRule.test(reqDetails.url)) {

					return tempRule;
				}
			}
		} else{
			var tempMatchRule2 = new RegExp(tempRule.Matchrule, "i");
			if(tempMatchRule2.test(reqDetails.url)){

				return tempRule;
			}
		}
	}
	return null;
}

/*
return type ad/content/tracker oder '-' wenn contentscript gebraucht wird
parameter: 		reqDetails: {tabId, requestId, resourceType, url}

Um Message an Contentscript zu senden: chrome.tabs.sendMessage(reqDetails.tabId, reqDetails, function(response) {});
*/

function match(reqDetails) {		
	if (matchList(EasyListMatchCache, reqDetails)) {
		//console.log("EasyList MatchCache matched!");
		return "ad";
	}
	if (matchList(PrivacyListMatchCache, reqDetails)) {
		//console.log("PrivacyList MatchCache matched!");
		return "tracker";
	}
	var matchingRule = matchList(PrivacyList, reqDetails);
	if (matchingRule) {
		if (PrivacyListMatchCache.length > MAX_CACHE_SIZE) {
			PrivacyListMatchCache.pop();
		}
		PrivacyListMatchCache.unshift(matchingRule);
		return "tracker";
	}
	matchingRule = matchList(EasyList, reqDetails);
	if (matchingRule) {
		if (EasyListMatchCache.length > MAX_CACHE_SIZE) {
			EasyListMatchCache.pop();
		}
		EasyListMatchCache.unshift(matchingRule);
		return "ad";
	}
	
	
/*
	if (matchList(EasyList, reqDetails)) {
		//console.log("EasyList MatchCache matched!");
		return "ad";
	}
	if (matchList(PrivacyList, reqDetails)) {
		//console.log("EasyList MatchCache matched!");
		return "tracker";
	}
*/
	return "content";
}

function testMatchOptions (reqDetails, tempRule){

	var domain = parseUri(reqDetails.url).hostname;
	var reqDomain = parseUri(reqDetails.originUrl).hostname;

	//prüfen, ob die RuleList der Regel ein Match zulässt.
	for(var ruleCounter = 0; ruleCounter < tempRule.RuleList.length; ruleCounter++){
		switch(tempRule.RuleList[ruleCounter].rule){
			case "third-party":
				if(reqDetails.originUrl){
					
					if(tempRule.RuleList.inverted == 0){
						//regel ist nicht invertiert. Wird nur auf third-party seiten angewendet. Domain der url darf nicht mit der url der eigentlich aufgerufenen seite übereinstimmen.
						//(bsp: aufruf: 20min.ch, request geht auf ad.com --> match. 20min.ch, request auf 20min.ch --> kein match.
						if(reqDomain == domain){
							return false;
						}
					}
					else{
						//regel ist invertiert. Wird nur auf die eigentlich aufgerufene Seite angewendet.
						//ggt. von oben.
						if(reqDomain == domain){
							return false;
						}
					}
				}

				break;
			case "domain":
				//variable tempDomainMatches wird auf true gesetzt, falls die URL die bedingung der regel erfüllt.
				var tempDomainMatchPossible = false;
				var tempDomainMatches = false;

				for(var domainCount = 0; domainCount < tempRule.DomainList.length; domainCount++){
					var tempDomain = tempRule.DomainList[domainCount];

					if(tempDomain.indexOf("~") === -1){
						//Domain ist NICHT invertiert. Url muss der domain entsprechen, damit tempDomainMatches auf true gesetzt werden kann.

						if(reqDetails.url.indexOf(tempDomain) != -1){
							//Domain matcht auf url. Setzen von tempDomainMatches auf true. for-loop muss zuende laufen, falls eine andere Regel ein Match wiederum ausschliesst.
							//console.log("Matching Domain: URL: " + reqDetails.url + ", DOMAIN: " + tempDomain);
							tempDomainMatches = true;
						}
						else{
							//Die Regel kann zum Überschreiben einer vorhergehenden invertierten Regel verwendet werden. die letzte Regel entscheidet also im zweifelsfall.
							tempDomainMatchPossible = false;
						}
					}else {
						//Domain IST invertiert! Url darf der domain NICHT entsprechen. Sonst muss noMatch auf true gesetzt werden, da ein Match nicht möglich ist.

						tempDomain = tempDomain.replace('~', '');

						if (reqDetails.url.indexOf(tempDomain) != -1) {
							//Domain matcht auf url. Match ist somit unmöglich. setzen von tempDomainMatch auf false und unterbrechen der for-loop für diese Regel.
							//console.log("INVERTED Matching Domain: URL: " + reqDetails.url + ", DOMAIN: ~" + tempDomain);
							tempDomainMatches = false;
							return false;
						} else {
							tempDomainMatchPossible = true;
						}
					}
				}
				if(tempDomainMatchPossible){
					tempDomainMatches = true;
				}
				if(!tempDomainMatches){
					//die domain-rule schliesst ein match der url mit dieser regel aus.
					return false;
				}
				break;
			case "match-case":
				//diese Regel kommt in keiner der beiden bisher verwendeten Listen vor.
				//daher wird sie an dieser Stelle nicht implementiert.
				break;
			case "collapse":
				//diese Regel kommt in keiner der beiden bisher verwendeten Listen vor.
				//daher wird sie an dieser Stelle nicht implementiert.
				break;
			case "donottrack":
				//diese Regel hat keinen Einfluss auf unsere Anwendung und wird daher ignoriert.
				break;
			default:
				console.log("unknown rule in RuleList" + tempRule.RuleList[ruleCounter].rule, tempRule.Matchrule);
		}
	}

	//die var match wird von jeder Regel in der for-loop auf true gesetzt, falls trotz der Regel ein match vorliegt. ist die Variable am Ende der for-loop noch auf false, liegt kein match vor.
	var match = false;

	//prüfen, ob die OptionList der Regel ein Match zulässt.
	for(var optionCounter = 0; optionCounter < tempRule.OptionList.length; optionCounter++){

		//noMatchPossible wird auf true gesetzt, falls bei einer Regel festgestellt wird, dass ein Match für diesen Request unmöglich ist (Beispiel: resourceType = script, Regel = ~script).
		//for-loop kann also beendet werden.
		switch(tempRule.OptionList[optionCounter].rule){
			/*
			 TODO:
			 Hier die html-Optionen prüfen (reqDetails.resourceType)
			 "main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", or "other"
			 alle typen: script, image, stylesheet, object, xmlhttprequest, object-subrequest, subdocument, ping, document, elemhide, generichide, genericblock, other, third-party, domain,
			 */
			case "script":
				//testen, ob resource Type des Requests script ist (mit der rule der OptionList überein stimmt).
				if(reqDetails.resourceType == "script"){
					//Testen, ob regel invertiert ist.
					if(tempRule.OptionList[optionCounter].inverted == 0){
						//regel ist NICHT invertiert und stimmt mit OptionList überein. Ist ein match.
						match = true;
					}else{
						//regel IST invertiert und stimmt mit OptionList überein. Match ist somit ausgeschlossen.
						return false;
					}
				}

				break;

			case "image":
				//bearbeitung wie script.
				if(reqDetails.resourceType == "image"){
					if(tempRule.OptionList[optionCounter].inverted == 0){
						match = true;
					}else{
						return false;
					}
				}

				break;

			case "stylesheet":
				//bearbeitung wie script
				if(reqDetails.resourceType == "stylesheet"){
					if(tempRule.OptionList[optionCounter].inverted == 0){
						match = true;
					}else{
						return false;
					}
				}
				break;

			case "object":
				//bearbeitung wie script.
				if(reqDetails.resourceType == "object"){
					if(tempRule.OptionList[optionCounter].inverted == 0){
						match = true;
					}else{
						return false;
					}
				}
				break;

			case "xmlhttprequest":
				//bearbeitung wie script.
				if(reqDetails.resourceType == "xmlhttprequest"){
					if(tempRule.OptionList[optionCounter].inverted == 0){
						match = true;
					}else{
						return false;
					}
				}
				break;

			case "object-subrequest":
				//Diese Regel kann nicht bearbeitet werden, da keine Informationen vom Browser zur Verfügung gestellt werden.
				//AdBlock Plus behandelt diese Regel wie die normale "object"-Regel.
				//Daher machen wir dies an dieser stelle genau so.
				if(reqDetails.resourceType == "object"){
					if(tempRule.OptionList[optionCounter].inverted == 0){
						match = true;
					}else{
						return false;
					}
				}
				break;

			case "subdocument":
				if(reqDetails.resourceType == "sub_frame"){
					if(tempRule.OptionList[optionCounter].inverted == 0){
						match = true;
					}else{
						return false;
					}
				}
				break;

			case "document":
				if(reqDetails.resourceType == "main_frame"){
					if(tempRule.OptionList[optionCounter].inverted == 0){
						match = true;
					}else{
						return false;
					}
				}
				break;
			case "elemhide":
				//diese Regel hat keinen Einfluss für unsere Anwendung und wird daher ignoriert.
				break;
			case "generichide":
				//diese Regel hat keinen Einfluss für unsere Anwendung und wird daher ignoriert.
				break;
			case "genericblock":
				//diese Regel hat keinen Einfluss für unsere Anwendung und wird daher ignoriert.
				break;
			case "other":
				//bearbeitung wie script.
				if(reqDetails.resourceType == "other"){
					if(tempRule.OptionList[optionCounter].inverted == 0){
						match = true;
					}else{
						return false;;
					}
				}
				break;

			case "ping":
				/*
				 TODO:
				 Herausfinden, wie ein Request als Popup erkannt werden kann.
				 */
			break;

			case "popup":
				/*
				TODO:
				 Herausfinden, wie ein Request als Popup erkannt werden kann.
				 In der Dokumentation der Syntax ist von diesem Attribut nirgends die Rede.
				 Das popup-Attribut wird verwendet, um mit Adblock Plus Popups blockeren zu können.
				 Evtl. funktioniert dieses Attribut bei Chrome nicht, auf der Homepage von AdBlock Plus wird auf Firefox bezug genommen!
				 */
				break;

			case "media":
				/*
				TODO: Diese Regel wird von Adblock Plus in der Syntax nirgends spezifiziert!
				Sie wird jedoch auf der EasyList verwendet und muss daher an dieser Stelle abgefangen werden.
				Allenfalls wird die Doku der Syntax bald aktualisiert um diese Regel zu erwähnen.
				 */
				break;

			case "font":
				/*
				TODO: Wie "media".
				 Diese Regel wird von Adblock Plus in der Syntax nirgends spezifiziert!
				 Sie wird jedoch auf der EasyList verwendet und muss daher an dieser Stelle abgefangen werden.
				 Allenfalls wird die Doku der Syntax bald aktualisiert um diese Regel zu erwähnen.
				 */
				break;

			default:
				console.log("unbekannte Regel" + tempRule.OptionList[optionCounter].rule, tempRule.Matchrule);
		}

	}
	
	return true;
}

function testMatch(){
	/*
	Methode zum Testen der Match-Funktion.
	LISTEN MÜSSEN IM SPEICHER VORHANDEN SEIN (GETEASYLIST MUSS VORHER AUSGEFÜHRT WERDEN)
	var reqDetails nach dem Muster    reqDetails: {tabId, requestId, resourceType, url}    definieren.
	tabID und requestID können für diesen Test auf 0 belassen werden. resourceType ist script, img,.... url ist die aufgerufene URL.
	 */
	var reqDetails = {tabId: 0, requestId: 0, resourceType: "image", url: "ads > .dose > .dosesingle"};
	match(reqDetails);
	console.log("testMatch finished");
}


/*
Zum Teste:
chasch i de konsole vo de hintergrundsite eifach die funktione ufrüefe
z.B: "match("http://google.com");" oder "parse("sampleText");"

Wennds mit de easylist wetsch versueche, gisch id konsole "getEasyList();" ih,
den rüefts der d parse function mit de easylist als parameter uf.

*/

/*
 //variable, falls die RuleList oder OptionList der aktuell geprüften Regel ein Match ausschliesst.
 var noMatch = false;

 //prüfen, ob die RuleList der Regel ein Match zulässt.
 for(var ruleCounter = 0; ruleCounter < tempAdRule.RuleList.length; ruleCounter++){
 switch(tempAdRule.RuleList[ruleCounter].rule){
 case "third-party":
 if(tempAdRule.RuleList.inverted == 0){
 //regel ist nicht invertiert. Wird nur auf third-party seiten angewendet. Domain der url darf nicht mit der url der eigentlich aufgerufenen seite übereinstimmen.
 //(bsp: aufruf: 20min.ch, request geht auf ad.com --> match. 20min.ch, request auf 20min.ch --> kein match.
 }
 else{
 //regel ist invertiert. Wird nur auf die eigentlich aufgerufene Seite angewendet.
 //ggt. von oben.
 }
 break;
 case "domain":
 //variable tempDomainMatches wird auf true gesetzt, falls die URL die bedingung der regel erfüllt.
 var tempDomainMatches = false;

 for(var domainCount = 0; domainCount < tempAdRule.DomainList.length; domainCount++){
 var tempDomain = tempAdRule.DomainList[domainCount];
 if(tempDomain.indexOf('~') == -1){
 //Domain ist NICHT invertiert. Url muss der domain entsprechen, damit tempDomainMatches auf true gesetzt werden kann.

 if(reqDetails.url.indexOf(tempDomain) != -1){
 //Domain matcht auf url. Setzen von tempDomainMatches auf true. for-loop muss zuende laufen, falls eine andere Regel ein Match wiederum ausschliesst.

 console.log("Matching Domain: URL: " + reqDetails.url + ", DOMAIN: " + tempDomain);
 tempDomainMatches = true;
 }
 }else{
 //Domain IST invertiert! Url darf der domain NICHT entsprechen. Sonst muss noMatch auf true gesetzt werden, da ein Match nicht möglich ist.

 tempDomain = tempDomain.replace('~','');
 if(reqDetails.url.indexOf(tempDomain) != -1){
 //Domain matcht auf url. Match ist somit unmöglich. setzen von tempDomainMatch auf false und unterbrechen der for-loop für diese Regel.
 console.log("INVERTED Matching Domain: URL: " + reqDetails.url + ", DOMAIN: ~" + tempDomain);
 tempDomainMatches = false;
 break;
 }
 }
 }
 if(!tempDomainMatches){
 //die domain-rule schliesst ein match der url mit dieser regel aus.
 noMatch = true;
 }
 break;
 case "match-case":
 //diese Regel kommt in keiner der beiden bisher verwendeten Listen vor.
 //daher wird sie an dieser Stelle nicht implementiert.
 break;
 case "collapse":
 //diese Regel kommt in keiner der beiden bisher verwendeten Listen vor.
 //daher wird sie an dieser Stelle nicht implementiert.
 break;
 case "donottrack":
 //diese Regel hat keinen Einfluss auf unsere Anwendung und wird daher ignoriert.
 break;
 default:
 alert("unknown rule in RuleList" + tempAdRule.RuleList[ruleCounter].rule);
 }

 //falls ein Match nicht mehr Möglich ist, kann die for-loop unterbrochen werden.
 if(noMatch){
 break;
 }
 }

 //falls kein Match möglich ist, kann die for-loop für diese Regel übersprungen werden.
 if(noMatch){
 continue;
 }

 //die var Match wird von jeder Regel in der for-loop auf true gesetzt, falls trotz der Regel ein match vorliegt. ist die Variable am Ende der for-loop noch auf false, liegt kein match vor.
 var match = false;

 //prüfen, ob die OptionList der Regel ein Match zulässt.
 for(var optionCounter = 0; optionCounter < tempAdRule.OptionList.length; optionCounter++){

 //noMatchPossible wird auf true gesetzt, falls bei einer Regel festgestellt wird, dass ein Match für diesen Request unmöglich ist (Beispiel: resourceType = script, Regel = ~script).
 //for-loop kann also beendet werden.
 var noMatchPossible = false;
 switch(tempAdRule.OptionList[optionCounter].rule){
 ///*
 //TODO:
 //Hier die html-Optionen prüfen (reqDetails.resourceType)
 //"main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", or "other"
 //alle typen: script, image, stylesheet, object, xmlhttprequest, object-subrequest, subdocument, ping, document, elemhide, generichide, genericblock, other, third-party, domain,
 //*/
/*
case "script":
//testen, ob resource Type des Requests script ist (mit der rule der OptionList überein stimmt).
if(reqDetails.resourceType == "script"){
	//Testen, ob regel invertiert ist.
	if(tempAdRule.OptionList[optionCounter].inverted == 0){
		//regel ist NICHT invertiert und stimmt mit OptionList überein. Ist ein match.
		match = true;
	}else{
		//regel IST invertiert und stimmt mit OptionList überein. Match ist somit ausgeschlossen.
		noMatchPossible = true;
	}
}

break;

case "image":
//bearbeitung wie script.
if(reqDetails.resourceType == "image"){
	if(tempAdRule.OptionList[optionCounter].inverted == 0){
		match = true;
	}else{
		noMatchPossible = true;
	}
}

break;

case "stylesheet":
//bearbeitung wie script
if(reqDetails.resourceType == "stylesheet"){
	if(tempAdRule.OptionList[optionCounter].inverted == 0){
		match = true;
	}else{
		noMatchPossible = true;
	}
}
break;

case "object":
//bearbeitung wie script.
if(reqDetails.resourceType == "object"){
	if(tempAdRule.OptionList[optionCounter].inverted == 0){
		match = true;
	}else{
		noMatchPossible = true;
	}
}
break;

case "xmlhttprequest":
//bearbeitung wie script.
if(reqDetails.resourceType == "xmlhttprequest"){
	if(tempAdRule.OptionList[optionCounter].inverted == 0){
		match = true;
	}else{
		noMatchPossible = true;
	}
}
break;

case "object-subrequest":
//Diese Regel kann nicht bearbeitet werden, da keine Informationen vom Browser zur Verfügung gestellt werden.
//AdBlock Plus behandelt diese Regel wie die normale "object"-Regel.
//Daher machen wir dies an dieser stelle genau so.
if(reqDetails.resourceType == "object"){
	if(tempAdRule.OptionList[optionCounter].inverted == 0){
		match = true;
	}else{
		noMatchPossible = true;
	}
}
break;

case "subdocument":
if(reqDetails.resourceType == "sub_frame"){
	if(tempAdRule.OptionList[optionCounter].inverted == 0){
		match = true;
	}else{
		noMatchPossible = true;
	}
}
break;

case "document":
//Diese Regel kommt in den zwei aktuell verwendeten Listen nicht vor und wird daher ignoriert.
console.log("unimplemented option document in rule " + tempMatchRule);
break;
case "elemhide":
//diese Regel hat keinen Einfluss für unsere Anwendung und wird daher ignoriert.
break;
case "generichide":
//diese Regel hat keinen Einfluss für unsere Anwendung und wird daher ignoriert.
break;
case "genericblock":
//diese Regel hat keinen Einfluss für unsere Anwendung und wird daher ignoriert.
break;
case "other":
//bearbeitung wie script.
if(reqDetails.resourceType == "other"){
	if(tempAdRule.OptionList[optionCounter].inverted == 0){
		match = true;
	}else{
		noMatchPossible = true;
	}
}
break;
default:
alert("unbekannte Regel" + tempAdRule.OptionList[optionCounter].rule);
}

if(noMatchPossible){
	match = false;
	break;
}
}
if(noMatchPossible){
	match = false;
	continue;
}
if(!match){
	continue;
}

 */