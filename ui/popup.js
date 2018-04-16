const { Config, Windows } = browser.extension.getBackgroundPage();

let targetWindow = null;
browser.windows.getCurrent().then(({ id }) => {
  targetWindow = Windows.getWindow(id);
});

let list = document.getElementById("menu");
for (let config of Config.config) {
  let li = document.createElement("li");
  li.textContent = config.name;
  list.appendChild(li);

  li.addEventListener("click", () => {
    targetWindow.setConfig(config);
    window.close();
  });
}
