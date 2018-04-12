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
      let tabDateTd = document.createElement("td");
      let tabDateInput = document.createElement("input");
      tabDateInput.setAttribute("class", "tab-expiry-date");
      tabDateInput.setAttribute("tab-id", tab.id);
      tabDateInput.setAttribute("tab-url", btoa(tab.url));
      tabDateInput.setAttribute("type", "date");
      tabDateInput.setAttribute("value", tabDate.getFullYear() + "-" + getMonthStr(tabDate.getMonth()) + "-" + tabDate.getDate());
      tabDateTd.appendChild(tabDateInput);
      tabTr.appendChild(tabDateTd);

      tabsExpiryTable.appendChild(tabTr);
    }


  });
}

function getSettingsAndBuildTabExpirationSettings() {
	browser.storage.local.get("tabsExpiry")
		.then(buildTabExpirationSettings, onError);
}

function onError(err) {
  console.log(err);
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
