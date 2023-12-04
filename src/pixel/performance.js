import { sendBeacon } from "./util";

export const performanceObserver = (shop) => {
  const seel = ["merchant-service/api", "quotes-service/api"];
  const shopify = ["/cart.js", "/cart/update", "/cart/change", "/cart/add"];

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === "resource") {
        const { duration, name } = entry;
        seel.forEach((path) => {
          if (entry.name.indexOf(path) > -1) {
            sendBeacon(
              "performance",
              "shopify",
              JSON.stringify({
                eventData: {
                  version: process.env.VERSION,
                  duration: Math.round(duration),
                  shop,
                  url: name,
                  eventName: "seel-api",
                  path,
                },
              }),
            );
          }
        });
        shopify.forEach((path) => {
          if (entry.name.indexOf(path) > -1) {
            sendBeacon(
              "performance",
              "shopify",
              JSON.stringify({
                eventData: {
                  version: process.env.VERSION,
                  duration: Math.round(duration),
                  shop,
                  url: name,
                  eventName: "cart-api",
                  path,
                },
              }),
            );
          }
        });
      }
    });
  });

  observer.observe({ type: "resource" });
};
