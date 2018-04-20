const SCHEMA = 1;

var Config = {
  async init() {
    this.config = [];

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
        this.config = data.config;
        break;
      }
      default:
        console.error("Unexpected storage format. Throwing away configuration.");
    }
  },

  addConfig() {
    let newConfig = {
      name: "",
      type: "http",
      host: "",
      username: "",
      password: "",
      proxyDNS: false,
    };
    this.config.push(newConfig);

    // This tells all windows to update their action button state.
    for (let window of Windows.getWindows()) {
      window.setConfig(window.getConfig());
    }

    return newConfig;
  },

  deleteConfig(config) {
    this.config = this.config.filter(c => c != config);

    // Remove config from windows and update the other's popup state.
    for (let window of Windows.getWindows()) {
      let windowConfig = window.getConfig();
      if (windowConfig === config) {
        window.setConfig(null);
      } else {
        window.setConfig(windowConfig);
      }
    }
  },

  saveConfigs() {
    browser.storage.local.set({
      config: {
        schema: SCHEMA,
        config: this.config,
      }
    });
  },

  getProxyDataForConfig(config) {
    let host = config.host;
    let port = 0;
    let point = host.indexOf(":");
    if (point >= 0) {
      port = parseInt(host.substring(point + 1));
      host = host.substring(0, point);
    } else {
      // Guess at the port number
      switch (config.type) {
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

    let proxy = {
      type: config.type,
      host,
      port,
    };

    if (config.type == "socks") {
      proxy.proxyDNS = config.proxyDNS;
    }

    return proxy;
  }
};
