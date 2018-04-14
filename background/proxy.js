class ProxyManager extends Listener {
  constructor() {
    super();
  }

  async init() {
    this.listen(browser.proxy.onRequest, "onProxyRequest", { urls: ["<all_urls>"] });
  }

  async onProxyRequest(data) {
    const { url, tabId, type } = data;

    if (tabId == browser.tabs.TAB_ID_NONE) {
      console.warn(`Saw an unidentifiable ${type} request for ${url}`);
    } else {
      let window = await Windows.getWindowForTab(tabId);
      let config = window.getConfig();
    }

    return null;
  }
};

const Proxy = new ProxyManager();
