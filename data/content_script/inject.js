var background = (function () {
  var tmp = {};
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    for (var id in tmp) {
      if (tmp[id] && (typeof tmp[id] === "function")) {
        if (request.path === 'background-to-page') {
          if (request.method === id) tmp[id](request.data);
        }
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {tmp[id] = callback},
    "send": function (id, data) {chrome.runtime.sendMessage({"path": 'page-to-background', "method": id, "data": data})}
  }
})();

var icon = chrome.runtime.getURL("data/content_script/icons/download.png");
var load = function () {observer.observe(document.body, {"childList": true, "subtree": true})};

var clean = function () {
  observer.disconnect();
  /*  */
  var elements = [...document.querySelectorAll("span[class='IDFI-BUTTON']")];
  for (var i = 0; i < elements.length; i++) {
    if (elements[i]) elements[i].remove();
  }
};

var observer = new MutationObserver(function (m) {
  for (var i = 0; i < m.length; i++) {
    var mutation = m[i];
    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
      for (var j = 0; j < mutation.addedNodes.length; j++) {
        var tmp = mutation.addedNodes[j];
        if (tmp.nodeType === Node.ELEMENT_NODE) {
          var type = tmp.getAttribute("type");
          if (!type || (type && type.indexOf("DFI-BUTTON") === -1)) action(true);
        }
      }
    }
  }
});

var action = function (active) {  
  var images = document.querySelectorAll("img");
  for (var i = 0; i < images.length; i++) {
    var image = images[i];
    if (active) {
      var button = image.getAttribute("button");
      if (!button) {
        image.setAttribute("button", "IDFI-BUTTON");
        /*  */
        button = document.createElement("span");
        button.setAttribute("type", "IDFI-BUTTON");
        button.setAttribute("class", "IDFI-BUTTON");
        button.setAttribute("title", "Download Image");
        button.style.background = "#FFF " + "url(" + icon + ')' + " no-repeat center center";
        button.style.backgroundSize = "16px";
        /*  */
        button.addEventListener("mouseenter", function () {this.style.opacity = "1.0"});
        button.addEventListener("mouseleave", function () {this.style.opacity = "0.3"});
        /*  */
        button.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          /*  */
          var parent = this.parentNode.parentNode;
          var image = parent.querySelector("img");
          var src = image && image.src ? image.src : '';
          if (src) background.send("download", src);
        });
        /*  */
        image.parentNode.appendChild(button);
        image.parentNode.style.display = "flex";
      }
    } else {
      image.removeAttribute("button");
      var parent_a = image.parentNode;
      var parent_b = image.closest("article");
      var selector = "span[class='IDFI-BUTTON']";
      var target_a = parent_a ? parent_a.querySelector(selector) : null;
      var target_b = parent_b ? parent_b.querySelector(selector) : null;
      var element = target_a || target_b;
      if (element) element.remove();
    }
  }
};

background.receive("load", function (state) {
  action(state === "ON");
  state === "ON" ? load() : clean();
});

var contentLoaded = function () {
  background.send("load", {});
  document.removeEventListener("DOMContentLoaded", contentLoaded, false);
};

document.addEventListener("DOMContentLoaded", contentLoaded, false);
