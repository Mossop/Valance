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
      if (type == "speculative") {
        // Speculative connections are disabled if a proxy is active.
        return [{ type: "http", host: "www.example.com", port: 80 }];
      }
    } else {
      let window = await Windows.getWindowForTab(tabId);
      let config = window.getConfig();

      if (config) {
        return [config.proxy];
      }
    }

    return [{ type: "direct" }];
  }
};

const Proxy = new ProxyManager();
