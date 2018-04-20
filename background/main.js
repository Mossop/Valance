async function init() {
  await Config.init();
  await Cryptography.init();
  await Windows.init();
  await Proxy.init();

  browser.browserAction.onClicked.addListener(async function(tab) {
    let window = await Windows.getWindowForTab(tab.id);
    let config = window.getProxyConfig();

    // If the window has an active proxy then just disable it.
    if (config) {
      await window.getProxyConfig(null);
      return;
    }

    // If there is only one configured proxy then switch to it.
    if (Config.config.length == 1) {
      await window.getProxyConfig(Config.config[0]);
      return;
    }

    // If there are no configured proxies then open the options.
    browser.runtime.openOptionsPage();
  });
}

init().catch(console.error);
