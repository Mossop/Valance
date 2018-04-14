class Listener {
  listen(api, callback, ...args) {
    api.addListener(this[callback].bind(this), ...args);
  }
}
