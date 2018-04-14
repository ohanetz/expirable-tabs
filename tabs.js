// Zoom constants. Define Max, Min, increment and default values
const ZOOM_INCREMENT = 0.2;
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.3;
const DEFAULT_ZOOM = 1;

function buildTabExpirationSettings(item) {

	tabsExpiry = item.tabsExpiry;

  browser.tabs.query({})
  .then((tabs) => {

    let tabsExpiryTable = document.getElementById("tabsExpiryTable");

    for (let tab of tabs) {

      let tabTr = document.createElement("tr");

      let tabFaviconTd = document.createElement("td");
      let tabFavicon = document.createElement("img");
      tabFavicon.setAttribute("src", tab.favIconUrl);
      tabFavicon.setAttribute("class", "favicon");
      tabFaviconTd.appendChild(tabFavicon);
      tabTr.appendChild(tabFaviconTd);

      let tabUrlTd = document.createElement("td");
      tabUrlTd.textContent = tab.url;
      tabTr.appendChild(tabUrlTd);

      let tabDate = tabsExpiry[tab.id]["expiry"];

      let tabExpiresInTd = document.createElement("td");
      tabExpiresInTd.textContent = "days";
      let tabExpiresInInput = document.createElement("input");
      tabExpiresInInput.setAttribute("class", "tab-expire-days");
      tabExpiresInInput.setAttribute("tab-id", tab.id);
      tabExpiresInInput.setAttribute("tab-url", btoa(tab.url));
      tabExpiresInInput.setAttribute("type", "number");
      tabExpiresInInput.setAttribute("value", getDaysDistance(tabDate));
      tabExpiresInTd.appendChild(tabExpiresInInput);
      tabTr.appendChild(tabExpiresInTd);

      let tabDateTd = document.createElement("td");
      let tabDateInput = document.createElement("input");
      tabDateInput.setAttribute("class", "tab-expiry-date");
      tabDateInput.setAttribute("tab-id", tab.id);
      tabDateInput.setAttribute("tab-url", btoa(tab.url));
      tabDateInput.setAttribute("type", "date");
      tabDateInput.setAttribute("value", tabDate.getFullYear() + "-" + getMonthStr(tabDate.getMonth()) + "-" + getDayStr(tabDate.getDate()));
      tabDateTd.appendChild(tabDateInput);
      tabTr.appendChild(tabDateTd);

      tabsExpiryTable.appendChild(tabTr);
    }


  });
}

function getDaysDistance(date) {
	let today = new Date();
	var timeDiff = date.getTime() - today.getTime();
	if (timeDiff < 0) {
		return 0;
	}

	return Math.ceil(timeDiff / (1000 * 3600 * 24)); 
}

function getSettingsAndBuildTabExpirationSettings() {
	browser.storage.local.get("tabsExpiry")
		.then(buildTabExpirationSettings, onError);
}

function onError(err) {
  console.log(err);
}

function getDayStr(day) {
	if (day < 10) {
		return "0" + day;
	}

	return day;
}

function getMonthStr(month) {
	res = month + 1;
	if (res < 10) {
		res = "0" + res;
	}

	return res;
}

function updateSettings() {
	console.log("Updating tabs expiration settings...");
	let tabsExpiry = {};
	let dateInputs = document.getElementsByClassName("tab-expiry-date");
	for (let item of dateInputs) {
		tabsExpiry[item.getAttribute("tab-id")] = {
			url: item.getAttribute("tab-url"),
			expiry: item.valueAsDate
		};
	}

	browser.storage.local.set({tabsExpiry});
	console.log("Tabs expiration settings updated!");
}

function getCurrentWindowTabs() {
  return browser.tabs.query({currentWindow: true});
}


document.addEventListener("DOMContentLoaded", getSettingsAndBuildTabExpirationSettings);
document.querySelector("form").addEventListener("submit", updateSettings);

window.addEventListener('input', function (e) {
 if (e.target.getAttribute("class") === "tab-expiry-date") {
 	for (let elem of document.getElementsByClassName("tab-expire-days")) {
 		if (elem.getAttribute("tab-id") === e.target.getAttribute("tab-id")) {
 			elem.setAttribute("value", getDaysDistance(e.target.valueAsDate));
 			break;
 		}
 	}

 }

 if (e.target.getAttribute("class") === "tab-expire-days") {
 	for (let elem of document.getElementsByClassName("tab-expiry-date")) {
 		if (elem.getAttribute("tab-id") === e.target.getAttribute("tab-id")) {
 			let newTabDate = new Date(new Date().valueOf() + 864E5 * e.target.valueAsNumber)
 			elem.setAttribute("value", newTabDate.getFullYear() + "-" + getMonthStr(newTabDate.getMonth()) + "-" + getDayStr(newTabDate.getDate()));
 			break;
 		}
 	}
 }
}, false);


// function updateTabsExpiry(item) {
// 	if (item.tabsExpiry !== undefined) {
// 	    let tabsExpiry = item.tabsExpiry;

// 	    var hasUpdated = false;
// 		  for (let key of Object.keys(tabsExpiry)) {
// 		    let now = new Date();
// 		    if (tabsExpiry[key]["expiry"] < now) {
// 		      let res = confirm("Tab with the following URL has expired:\n" + atob(tabsExpiry[key]["url"]) + "\nWould you like to close it?");
// 		      if (res == true) {
// 		      	delete tabsExpiry[key];
// 		      	hasUpdated = true;
// 		      }
// 		    }
// 		  }
// 		if (hasUpdated) {
// 			// Updating storage.
// 			browser.storage.local.set({tabsExpiry});
// 			console.log("Tabs expiration settings updated!");
// 		}
// 	}
// }



// function checkTabsExpiry() {

//   browser.storage.local.get("tabsExpiry")
//     .then(updateTabsExpiry, onError);
// }

// // Set up an alarm to check this regularly.
// browser.alarms.onAlarm.addListener(checkTabsExpiry);
// browser.alarms.create('checkTabsExpiry', {periodInMinutes: 5});
