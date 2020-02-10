app.button.clicked(function () {
  config.addon.state = config.addon.state === "ON" ? "OFF" : "ON";
  /*  */
  app.icon(config.addon.state);
  app.tab.active(function (tab) {
    app.content_script.send("load", config.addon.state, tab.id);
  });
});

app.content_script.receive("load", function (e) {
  app.content_script.send("load", config.addon.state, (e ? e.tabId : null));
});

window.setTimeout(function () {app.icon(config.addon.state)}, 300);
app.content_script.receive("download", function (url) {chrome.downloads.download({"url": url})});
