async function init() {
  await Config.init();
  await Windows.init();
  await Proxy.init();

  browser.browserAction.onClicked.addListener(async function(tab) {
    let window = await Windows.getWindowForTab(tab.id);
    window.onActionClicked();
  });
}

init().catch(console.error);
