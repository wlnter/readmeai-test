const fetch = require("node-fetch");

const sendNotification = async (
  webhooks,
  assets = [],
  { version, previousVersion, notes, author },
  isProd = true,
) => {
  console.log({ version, previousVersion, notes });
  if (!webhooks || !version) {
    console.log("no webhooks registered or no new version released");
    return;
  }

  const isBreakChange =
    version.split(".")[0] !== previousVersion?.split(".")[0];

  const relatedShops = {};
  assets
    .split(",")
    .sort((a, b) => b.length - a.length)
    .forEach((asset) => {
      const arr = asset.split(".");
      const integrationPoint = arr.shift() === "index" ? "cart" : "checkout";
      arr.pop();
      const shop = arr.length
        ? arr.join(".")
        : `shops using Shopify free theme - ${integrationPoint}`;
      relatedShops[shop] = relatedShops[shop] || [];
      arr.length && relatedShops[shop].push(integrationPoint);
    });

  let shopList = Object.entries(relatedShops).map(
    ([shop, integrationPoints]) => {
      return integrationPoints.length
        ? `  · <https://${shop}|${
            shop.split(".")[0]
          }> - ${integrationPoints.join(" & ")}`
        : `  · ${shop}`;
    },
  );
  console.log("shopList", shopList);
  const emoji = `${isProd ? ":tada:" : ""}`;
  const motion = `${isProd && isBreakChange ? "@channel" : ""}`;
  const verisonNumber = `${isProd ? `(${version})` : ""}`;
  const content = [
    `${emoji} ${motion}We've released new version ${verisonNumber} of Shopify script! ${emoji}`,
    `:four_leaf_clover: ${
      isProd ? "production" : "development"
    }  :technologist::skin-tone-2: ${author}  :calendar: ${new Date().toLocaleString(
      "zh-CN",
      { timeZone: "Asia/Shanghai" },
    )}.`,
  ]
    .concat(shopList)
    .join("\n");

  var data = JSON.stringify({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: content,
        },
        accessory: {
          type: "image",
          image_url: "https://static.seel.com/image/seel%C3%97shopify.png",
          alt_text: "seel × shopify",
        },
      },
      {
        type: "divider",
      },
    ],
  });
  console.log("message content", data);

  webhooks.split(",").forEach((webhook) => {
    var config = {
      method: "post",
      url: webhook,
      headers: {
        "Content-type": "application/json",
      },
      body: data,
    };
    fetch(webhook, config).catch((e) => console.log(e.message));
  });
};

module.exports = {
  sendNotification,
};
