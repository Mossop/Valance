const { Config, Cryptography } = browser.extension.getBackgroundPage();

class ConfigUI {
  constructor(config) {
    this.config = config;

    let template = document.getElementById("proxytemplate");
    let fragment = document.importNode(template.content, true);
    let proxies = document.getElementById("proxies");
    proxies.appendChild(fragment);
    this.ui = proxies.lastElementChild;

    this.wireTextbox(".proxyname", "name");
    this.wireSelect(".proxytype", "type", () => {
      this.updateProxyDNS();
    });
    this.wireTextbox(".proxyhost", "host");
    this.wireCheckbox(".proxydns", "proxyDNS");
    this.wireTextbox(".proxyuser", "username");
    this.wirePassword(".proxypass", "password");

    this.updateProxyDNS();

    this.ui.querySelector(".proxydelete").addEventListener("click", () => {
      Config.deleteConfig(this.config);
      this.ui.remove();
    });
  }

  updateProxyDNS() {
    let dns = this.ui.querySelector(".proxydns");
    let label = this.ui.querySelector(".proxydnslabel");

    if (this.config.type == "socks") {
      dns.disabled = false;
      label.classList.remove("disabled");
    } else {
      dns.checked = false;
      dns.disabled = true;
      label.classList.add("disabled");
    }
  }

  wire(selector, configProp, elementProp, callback) {
    let element = this.ui.querySelector(selector);
    element[elementProp] = this.config[configProp];
    element.addEventListener("change", () => {
      this.config[configProp] = element[elementProp];

      if (callback) {
        callback(element);
      }
    });
  }

  async wireEncrypted(selector, configProp, elementProp, callback) {
    let element = this.ui.querySelector(selector);
    element[elementProp] = await Cryptography.decrypt(this.config[configProp].data,
                                                     this.config[configProp].iv);
    element.addEventListener("change", async () => {
      this.config[configProp].data = await Cryptography.encrypt(element[elementProp],
                                                                this.config[configProp].iv);

      if (callback) {
        callback(element);
      }
    });
  }

  wireTextbox(selector, property, callback = null) {
    this.wire(selector, property, "value", callback);
  }

  wirePassword(selector, property, callback = null) {
    this.wireEncrypted(selector, property, "value", callback);
  }

  wireSelect(selector, property, callback = null) {
    this.wire(selector, property, "value", callback);
  }

  wireCheckbox(selector, property, callback = null) {
    this.wire(selector, property, "checked", callback);
  }
}

for (let config of Config.proxies) {
  new ConfigUI(config);
}

document.getElementById("addproxy").addEventListener("click", async () => {
  new ConfigUI(await Config.addProxyConfig());
});

addEventListener("unload", () => Config.saveConfig());
