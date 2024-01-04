import glob from "glob";
import fs from "fs";
import path from "path";
import * as url from "url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

glob.sync(`./src/config/**.json`).forEach((path) => {
  console.log(path);
  const content = fs.readFileSync(path, { encoding: "utf-8" });
  const config = JSON.parse(content);
  const { widgets = [] } = config;
  const found = widgets.find((_) => _.type === "sp");
  const rest =
    widgets.map((_) => {
      if (_?.type !== "sp") {
        return _;
      }
    }) || [];

  // rewrite
  if (found) {
    found.name = "Guaranteed Delivery&trade;";
    found.widgetIcon = "https://cdn.seel.com/assets/images/gsp-widget-icon.png";
    config.widgets = [found, ...rest];
    fs.writeFileSync(path, JSON.stringify(config), (err) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("rewrite succeed");
      }
    });
  }
});
