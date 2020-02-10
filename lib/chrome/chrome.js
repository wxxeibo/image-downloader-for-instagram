var app = {};

app.version = function () {return chrome.runtime.getManifest().version};
app.homepage = function () {return chrome.runtime.getManifest().homepage_url};
app.button = {"clicked": function (callback) {chrome.browserAction.onClicked.addListener(callback)}};
chrome.runtime.setUninstallURL(app.homepage() + "?v=" + app.version() + "&type=uninstall", function () {});

app.tab = {
  "open": function (url) {chrome.tabs.create({"url": url, "active": true})},
  "active": function (callback) {
    chrome.tabs.query({"active": true}, function (tabs) {
      if (tabs && tabs.length) callback(tabs[0]);
    });
  }
};

chrome.runtime.onInstalled.addListener(function (e) {
  window.setTimeout(function () {
    if (e.reason === "install") {
      app.tab.open(app.homepage() + '?v=' + app.version() + "&type=" + e.reason);
    }
  }, 3000);
});

app.icon = function (e) {
  chrome.browserAction.setTitle({"title": "Image Downloader for Instagram: " + e});
  chrome.browserAction.setIcon({
    "path": {
      '16': '../../data/icons/' + e + '/16.png',
      '32': '../../data/icons/' + e + '/32.png',
      '48': '../../data/icons/' + e + '/48.png',
      '64': '../../data/icons/' + e + '/64.png'
    }
  });
};

app.storage = (function () {
  var objs = {};
  window.setTimeout(function () {
    chrome.storage.local.get(null, function (o) {
      objs = o;
      var script = document.createElement("script");
      script.src = "../common.js";
      document.body.appendChild(script);
    });
  }, 300);
  /*  */
  return {
    "read": function (id) {return objs[id]},
    "write": function (id, data) {
      var tmp = {};
      tmp[id] = data;
      objs[id] = data;
      chrome.storage.local.set(tmp, function () {});
    }
  }
})();

app.content_script = (function () {
  var tmp = {};
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    for (var id in tmp) {
      if (tmp[id] && (typeof tmp[id] === "function")) {
        if (request.path === 'page-to-background') {
          if (request.method === id) {
            var o = request.data || {};
            if (sender.tab) o["tabId"] = sender.tab.id;
            tmp[id](o);
          }
        }
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {tmp[id] = callback},
    "send": function (id, data, tabId) {
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab) {
          if (!tabId || (tabId && tab.id === tabId)) {
            var o = data || {};
            o["tabId"] = tab.id;
            chrome.tabs.sendMessage(tab.id, {"path": 'background-to-page', "method": id, "data": o});
          }
        });
      });
    }
  }
})();
