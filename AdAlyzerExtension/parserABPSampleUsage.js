
//Sample Code for ABP-Filter-Parser Usage from Github

let parsedFilterData = {};
let urlToCheck = 'http://static.tumblr.com/dhqhfum/WgAn39721/cfh_header_banner_v2.jpg';

// This is the site who's URLs are being checked, not the domain of the URL being checked.
let currentPageDomain = 'slashdot.org';

var rawFile = new XMLHttpRequest();
var link = "https://easylist-downloads.adblockplus.org/easylist.txt";
rawFile.open("GET", link, false);
rawFile.onreadystatechange = function ()
{
    if(rawFile.readyState === 4)
    {
        if(rawFile.status === 200 || rawFile.status == 0)
        {
            var easyListTxt = rawFile.responseText;
            //alert(allText);
            console.log("easyList downloaded");
            ABPFilterParser.parse(easyListTxt, parsedFilterData);
            console.log("easyList parsed");
        }
    }
}
rawFile.send(null);


// ABPFilterParser.parse(someOtherListOfFilters, parsedFilterData);

if (ABPFilterParser.matches(parsedFilterData, urlToCheck, {
      domain: currentPageDomain,
      elementTypeMaskMap: ABPFilterParser.elementTypes.SCRIPT,
    })) {
  console.log('You should block this URL!');
} else {
  console.log('You should NOT block this URL!');
}
