async function init() {
  await Config.init();
  await Windows.init();
  await Proxy.init();

  browser.browserAction.onClicked.addListener(async function(tab) {
    let window = await Windows.getWindowForTab(tab.id);
    let config = window.getConfig();

    // If the window has an active proxy then just disable it.
    if (config) {
      await window.setConfig(null);
      return;
    }

    // If there is only one configured proxy then switch to it.
    if (Config.config.length == 1) {
      await window.setConfig(Config.config[0]);
      return;
    }

    // If there are no configured proxies then open the options.
    browser.runtime.openOptionsPage();
  });
}

init().catch(console.error);
