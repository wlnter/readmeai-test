import glob from "glob";
import fs from "fs";
import path from "path";
import * as url from "url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const mockDir = "./mock/static.seel.com/shopify";
const testMockDir = "./mock/static-test.seel.com/shopify";
const overrideRADir = "./mock/cdn.seel.com/releases/scripts/shopify-ra";
const override17BPDir = "./mock/cdn.seel.com/releases/scripts/shopify-bp";

fs.rmSync(mockDir, { recursive: true, force: true });
fs.rmSync(testMockDir, { recursive: true, force: true });
fs.rmSync(overrideRADir, { recursive: true, force: true });
fs.rmSync(override17BPDir, { recursive: true, force: true });

fs.mkdirSync(overrideRADir, { recursive: true });
fs.mkdirSync(override17BPDir, { recursive: true });

fs.cpSync("dist", mockDir, { recursive: true });
fs.cpSync("dist", testMockDir, { recursive: true });

const copyScript = (mockDir, scriptPath) => {
  const dir = scriptPath.split("/");
  const name = dir[dir.length - 1];
  const temp = name.split(".");
  temp.shift();
  temp.pop();
  const shop = temp.join(".");
  fs.copyFileSync(
    path.join(__dirname, `${mockDir}/script/${name}`),
    path.join(__dirname, `${mockDir}/script/${name}?shop=${shop}`),
  );
  fs.copyFileSync(
    path.join(__dirname, `${mockDir}/script/${name}`),
    path.join(__dirname, `${mockDir}/script/${name}?shop=${shop}&shop=${shop}`),
  );
};

glob.sync(`${mockDir}/script/*.js`).forEach((scriptPath) => {
  copyScript(mockDir, scriptPath);
});
glob.sync(`${testMockDir}/script/*.js`).forEach((scriptPath) => {
  copyScript(testMockDir, scriptPath);
});

glob.sync(`./dist/script/*.js`).forEach((scriptPath) => {
  const dir = scriptPath.split("/");
  const name = dir[dir.length - 1];
  const temp = name.split(".");
  const integrationPoint = temp.shift();
  temp.pop();
  const shop = temp.join(".");
  if (integrationPoint === "index" && shop) {
    fs.copyFileSync(
      path.join(__dirname, `./dist/script/${name}`),
      path.join(
        __dirname,
        `${overrideRADir}/return-assurance.min.js?shop=${shop}`,
      ),
    );
    fs.copyFileSync(
      path.join(__dirname, `./dist/script/${name}`),
      path.join(
        __dirname,
        `${override17BPDir}/bp-embedded.min.js?shop=${shop}`,
      ),
    );
  }
});
