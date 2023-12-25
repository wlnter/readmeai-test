import { sendBeacon } from "./util";

export const detectReference = (shop = "", version = "") => {
  sendBeacon(
    "reference-detection",
    "shopify",
    JSON.stringify({
      eventData: {
        eventName: "script-embedded",
        seelAsset: "shopify-script-v3",
        version,
        shop,
        hostUrl: window?.location?.href,
      },
    }),
  );
  console.log({
    eventData: {
      eventName: "script-embedded",
      seelAsset: "shopify-script-v3",
      version,
      shop,
      hostUrl: window?.location?.href,
    },
  });
};
