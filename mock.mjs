import glob from "glob";
import fs from "fs";
import path from "path";
import * as url from "url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const scripts = glob.sync("dist/script/*.js");

var mockDir = "./mock/static.seel.com/shopify/script";
if (!fs.existsSync(mockDir)) {
  fs.mkdirSync(mockDir, { recursive: true });
}

scripts.forEach((scriptPath) => {
  const name = scriptPath.replace("dist/script/", "").replace(".js", "");
  const temp = name.split(".");
  temp.shift();
  const shop = temp.join(".");
  console.log(shop);
  fs.rename(
    path.join(__dirname, scriptPath),
    path.join(
      __dirname,
      mockDir,
      // `${scriptPath.replace("dist/script/", "")}?shop=${shop}`
      `${scriptPath.replace("dist/script/", "")}`
    ),
    function (err) {
      if (err) {
        throw err;
      } else {
        console.log("Successfully moved the file!");
      }
    }
  );
});
