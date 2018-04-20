var Cryptography = {
  async init() {
    let algorithm = {
      name: "AES-CBC",
      length: 128,
    };
    let usage = ["encrypt", "decrypt"];

    let promise;
    if (Config.key) {
      this.key = await crypto.subtle.importKey("jwk", Config.key, algorithm,
                                               true, usage);
    } else {
      this.key = await crypto.subtle.generateKey(algorithm, true, usage);
      Config.key = await crypto.subtle.exportKey("jwk", this.key);
      Config.saveConfig();
    }
  },

  generateBuffer(length) {
    let data = new Uint8Array(length);
    crypto.getRandomValues(data);
  },

  generateIV() {
    return this.bufferToString(this.generateBuffer(16));
  },

  stringToBuffer(str) {
    let encoder = new TextEncoder();
    return encoder.encode(str);
  },

  bufferToString(buffer) {
    let decoder = new TextDecoder();
    return decoder.decode(buffer);
  },

  async encrypt(str, iv) {
    let buffer = this.stringToBuffer(str);

    let algorithm = {
      name: "AES-CBC",
      iv: this.stringToBuffer(iv),
    };
    return crypto.subtle.encrypt(algorithm, this.key, buffer);
  },

  async decrypt(str, iv) {
    let buffer = this.stringToBuffer(str);

    let algorithm = {
      name: "AES_CBC",
      iv: this.stringToBuffer(iv),
    };
    return crypto.subtle.decrypt(algorithm, this.key, buffer);
  },
};
