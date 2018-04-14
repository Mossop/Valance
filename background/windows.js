class Window {
  constructor(window) {
    this.id = window.id;
    this.config = Config.getDefault();

    for (let tab of window.tabs) {
      this.onTabCreated(tab);
    }
  }

  getConfig() {
    return this.config;
  }

  applyConfig(tabId) {
    browser.browserAction.setIcon({
      tabId,
      path: browser.runtime.getURL(`icons/${this.config.icon}`),
    });

    browser.browserAction.setTitle({
      tabId,
      title: this.config.title,
    });
  }

  onTabCreated(tab) {
    this.applyConfig(tab.id);
  }

  onTabAttached(tabId) {
    this.applyConfig(tabId);
  }

  onTabReplaced(tabId) {
    this.applyConfig(tabId);
  }

  onTabUpdated(tab, changeInfo) {
    this.applyConfig(tab.id);
  }

  async onActionClicked() {
    this.config = this.config.next;

    let window = await browser.windows.get(this.id, { populate: true });
    for (let tab of window.tabs) {
      this.applyConfig(tab.id);
    }
  }
}

class WindowManager extends Listener {
  constructor() {
    super();

    this.windowMap = new Map();
  }

  async init() {
    let windows = await browser.windows.getAll({ populate: true, windowTypes: ['normal', 'popup'] });
    for (let window of windows) {
      this.windowMap.set(window.id, new Window(window));
    }

    this.listen(browser.windows.onCreated, "onWindowCreated");
    this.listen(browser.windows.onRemoved, "onWindowRemoved");

    this.listen(browser.tabs.onCreated, "onTabCreated");
    this.listen(browser.tabs.onAttached, "onTabAttached");
    this.listen(browser.tabs.onReplaced, "onTabReplaced");

    this.listen(browser.tabs.onUpdated, "onTabUpdated");
  }

  getWindow(windowId) {
    return this.windowMap.get(windowId);
  }

  async getWindowForTab(tabId) {
    let tab = await browser.tabs.get(tabId);
    return this.getWindow(tab.windowId);
  }

  async onWindowCreated(window) {
    if (window.type != 'normal' && window.type != 'popup') {
      return;
    }

    // Needed to populate the tabs property.
    window = await browser.windows.get(window.id, { populate: true });
    this.windowMap.set(window.id, new Window(window));
  }

  onWindowRemoved(windowId) {
    this.windowMap.delete(windowId);
  }

  onTabCreated(tab) {
    let window = this.getWindow(tab.windowId);

    if (window) {
      window.onTabCreated(tab);
    } else {
      console.warn(`Saw a new tab with no window ${tab.windowId}.`)
    }
  }

  onTabAttached(tabId, { windowId }) {
    this.getWindow(windowId).onTabAttached(tabId);
  }

  async onTabReplaced(tabId) {
    let window = await this.getWindowForTab(tabId);
    window.onTabReplaced(tabId);
  }

  onTabUpdated(tabId, changeInfo, tab) {
    this.getWindow(tab.windowId).onTabUpdated(tab, changeInfo);
  }
}

const Windows = new WindowManager();
