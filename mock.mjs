import glob from "glob";
import fs from "fs";
import path from "path";
import * as url from "url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const mockDir = "./mock/static.seel.com/shopify";
const testMockDir = "./mock/static-test.seel.com/shopify";

fs.cpSync("dist", mockDir, { recursive: true });
fs.cpSync("dist", testMockDir, { recursive: true });

const renameThenCopy = (mockDir, scriptPath) => {
  const dir = scriptPath.split("/");
  const name = dir[dir.length - 1];
  const temp = name.split(".");
  temp.shift();
  temp.pop();
  const shop = temp.join(".");
  fs.rename(
    path.join(__dirname, scriptPath),
    path.join(__dirname, `${mockDir}/script`, `${name}?shop=${shop}`),
    function (err) {
      if (err) {
        console.log(err.message);
      } else {
        fs.copyFileSync(
          path.join(__dirname, `${mockDir}/script/${name}?shop=${shop}`),
          path.join(__dirname, `${mockDir}/script/${name}`)
        );
      }
    }
  );
};

glob.sync(`${mockDir}/script/*.js`).forEach((scriptPath) => {
  renameThenCopy(mockDir, scriptPath);
});
glob.sync(`${testMockDir}/script/*.js`).forEach((scriptPath) => {
  renameThenCopy(testMockDir, scriptPath);
});
