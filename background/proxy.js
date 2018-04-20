class ProxyManager extends Listener {
  constructor() {
    super();
  }

  async init() {
    this.listen(browser.proxy.onRequest, "onProxyRequest", { urls: ["<all_urls>"] });
    this.listen(browser.webRequest.onAuthRequired, "onAuthRequired", { urls: ["<all_urls>"] }, ["blocking"]);
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
        return [Config.getProxyDataForConfig(config)];
      }
    }

    return [{ type: "direct" }];
  }

  async onAuthRequired({ tabId, proxyInfo }) {
    let window = await Windows.getWindowForTab(tabId);
    let config = window.getConfig();

    if (config) {
      return {
        authCredentials: {
          username: config.username,
          password: config.password,
        }
      };
    }
  }
};

const Proxy = new ProxyManager();
