const SCHEMA = 1;

var Config = {
  async init() {
    this.key = null;
    this.proxies = [];

    let data;
    try {
      data = (await browser.storage.local.get("config")).config;
    }
    catch (e) {
      console.error(e);
    }

    if (!data) {
      return;
    }

    switch (data.schema) {
      case 1: {
        this.key = data.key;
        this.proxies = data.proxies;
        break;
      }
      default:
        console.error("Unexpected storage format. Throwing away configuration.");
    }
  },

  async addProxyConfig() {
    let newProxyConfig = {
      name: "",
      type: "http",
      host: "",
      username: "",
      password: {
        data: null,
        iv: Cryptography.generateIV(),
      },
      proxyDNS: false,
    };
    newProxyConfig.password.data = await Cryptography.encrypt("", newProxyConfig.password.iv);
    this.proxies.push(newProxyConfig);

    // This tells all windows to update their action button state.
    for (let window of Windows.getWindows()) {
      window.setProxyConfig(window.getProxyConfig());
    }

    return newProxyConfig;
  },

  deleteProxyConfig(proxy) {
    this.proxies = this.proxies.filter(p => p != proxy);

    // Remove config from windows and update the other's popup state.
    for (let window of Windows.getWindows()) {
      let windowConfig = window.getProxyConfig();
      if (windowConfig === proxy) {
        window.setProxyConfig(null);
      } else {
        window.setProxyConfig(windowConfig);
      }
    }
  },

  saveConfig() {
    browser.storage.local.set({
      config: {
        schema: SCHEMA,
        key: this.key,
        proxies: this.proxies,
      }
    });
  },

  getProxyDataForProxyConfig(proxy) {
    let host = proxy.host;
    let port = 0;
    let point = host.indexOf(":");
    if (point >= 0) {
      port = parseInt(host.substring(point + 1));
      host = host.substring(0, point);
    } else {
      // Guess at the port numbergi
      switch (proxy.type) {
        case "http":
          port = 8080;
          break;
        case "https":
          port = 8080;
          break;
        case "socks4":
          port = 1080;
          break;
        case "socks":
          port = 1080;
          break;
      }
    }

    let proxyData = {
      type: proxy.type,
      host,
      port,
    };

    if (proxy.type == "socks") {
      proxyData.proxyDNS = proxy.proxyDNS;
    }

    return proxyData;
  }
};
