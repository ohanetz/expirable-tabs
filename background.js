let tabsExpiry = {};


function updateCount(tabId, isOnRemoved) {
  browser.tabs.query({})
  .then((tabs) => {
    let length = tabs.length;

    // onRemoved fires too early and the count is one too many.
    // see https://bugzilla.mozilla.org/show_bug.cgi?id=1396758
    if (isOnRemoved && tabId && tabs.map((t) => { return t.id; }).includes(tabId)) {
      length--;
    }

    browser.browserAction.setBadgeText({text: length.toString()});
    if (length > 2) {
      browser.browserAction.setBadgeBackgroundColor({'color': 'green'});
    } else {
      browser.browserAction.setBadgeBackgroundColor({'color': 'red'});
    }

    newTab = false;
    for (let tab of tabs) {

      if (tabsExpiry[tab.id] === undefined || tabsExpiry[tab.id]["url"] !== btoa(tab.url)) {
        // Tab was or new tab, resetting expiry.
        tabsExpiry[tab.id] = {
          url: btoa(tab.url), 
          expiry: new Date("2099-12-31")
        };
        console.log("New tab in expiry:" + tabsExpiry[tab.id]);
        newTab = true;
      }
    }

    if (newTab) {
      browser.storage.local.set({tabsExpiry});
    }
  });
}



function onError(err) {
  console.log(err);
}

function updateTabsExpiry(item) {
  if (item.tabsExpiry !== undefined) {
    tabsExpiry = item.tabsExpiry;
  }

  for (let key of Object.keys(tabsExpiry)) {
    let now = new Date();
    if (tabsExpiry[key]["expiry"] < now) {
      console.log("Removing expired tab with ID " + key);
      browser.tabs.remove(parseInt(key));
      delete tabsExpiry[key];
    }
  }
}

function refreshTabsExpiry() {

  browser.storage.local.get("tabsExpiry")
    .then(updateTabsExpiry, onError);
}

refreshTabsExpiry();

// Set up an alarm to check this regularly.
browser.alarms.onAlarm.addListener(refreshTabsExpiry);
browser.alarms.create('refreshTabsExpiry', {periodInMinutes: 5});

// Handle creation and deletion of tabs.
browser.tabs.onRemoved.addListener(
  (tabId) => { updateCount(tabId, true);
});
browser.tabs.onCreated.addListener(
  (tabId) => { updateCount(tabId, false);
});
browser.tabs.onMoved.addListener((tabId, moveInfo) => {
  updateCount(tabId, false);
  // var startIndex = moveInfo.fromIndex;
  // var endIndex = moveInfo.toIndex;
  // console.log(`Tab with id: ${tabId} moved from index: ${startIndex} to index: ${endIndex}`);
});
updateCount();
