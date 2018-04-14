const CONFIG = {
  off: {
    icon: "icon-off.svg",
    title: "Direct connection",
  },

  on: {
    icon: "icon-on.svg",
    title: "Proxied",
  }
};

CONFIG.off.next = CONFIG.on;
CONFIG.on.next = CONFIG.off;

const Config = {
  async init() {
  },

  getDefault() {
    return CONFIG["off"];
  }
};
