import { sendBeacon } from "./util";

// markers
const SCRIPT_EXECUTED = "seel-script-executed";
const COMPONENT_RENDERED = "seel-component-rendered";

export const performanceObserver = (shop) => {
  const seel = ["merchant-service/api", "quotes-service/api"];
  const shopify = ["/cart.js", "/cart/update", "/cart/change", "/cart/add"];

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      const { startTime, duration, name, initiatorType, entryType, detail } =
        entry;
      if (entryType === "mark" && name === COMPONENT_RENDERED) {
        const { type, integrationPoint } = detail;
        try {
          const measure = performance.measure(
            `${integrationPoint}-${type}-rendered-since-seel-script-executed`,
            SCRIPT_EXECUTED,
            name,
          );
          sendBeacon(
            "performance",
            "shopify",
            JSON.stringify({
              eventData: {
                version: process.env.VERSION,
                shop,
                startTime: Math.round(measure.startTime),
                duration: Math.round(measure.duration),
                name,
                eventName: "painting",
                integrationPoint,
                integrationType: type,
              },
            }),
          );
        } catch (e) {
          console.log(e.message);
        }

        // console.log("painting", {
        //   version: process.env.VERSION,
        //   shop,
        //   startTime: Math.round(measure.startTime),
        //   duration: Math.round(measure.duration),
        //   name,
        //   eventName: "painting",
        //   integrationPoint,
        //   integrationType: type,
        // });
        // console.log(measure);
      }
      if (entryType === "navigation" && initiatorType === "navigation") {
        sendBeacon(
          "performance",
          "shopify",
          JSON.stringify({
            eventData: {
              version: process.env.VERSION,
              shop,
              startTime: Math.round(startTime),
              duration: Math.round(duration),
              name,
              eventName: "page-loading",
            },
          }),
        );
        // console.log("page-loading", {
        //   version: process.env.VERSION,
        //   shop,
        //   startTime: Math.round(startTime),
        //   duration: Math.round(duration),
        //   name,
        //   eventName: "page-loading",
        // });
        // console.log(entry);
      }
      if (entryType === "resource") {
        // shopify script
        if (
          initiatorType === "script" &&
          name.includes("seel.com") &&
          name.includes("shopify/script/")
        ) {
          sendBeacon(
            "performance",
            "shopify",
            JSON.stringify({
              eventData: {
                version: process.env.VERSION,
                shop,
                startTime: Math.round(startTime),
                duration: Math.round(duration),
                name,
                eventName: "script-loading",
              },
            }),
          );

          // console.log("script-loading", {
          //   version: process.env.VERSION,
          //   shop,
          //   startTime: Math.round(startTime),
          //   duration: Math.round(duration),
          //   name,
          //   eventName: "script-loading",
          // });
          // console.log(entry);
        }
        seel.forEach((path) => {
          if (entry.name.includes(path) && entry.initiatorType !== "script") {
            sendBeacon(
              "performance",
              "shopify",
              JSON.stringify({
                eventData: {
                  version: process.env.VERSION,
                  duration: Math.round(duration),
                  startTime: Math.round(startTime),
                  shop,
                  name,
                  eventName: "seel-api",
                  path,
                },
              }),
            );
            // console.log(entry);
          }
        });
        shopify.forEach((path) => {
          if (entry.name.includes(path) && entry.initiatorType !== "script") {
            sendBeacon(
              "performance",
              "shopify",
              JSON.stringify({
                eventData: {
                  version: process.env.VERSION,
                  duration: Math.round(duration),
                  startTime: Math.round(startTime),
                  shop,
                  name,
                  eventName: "cart-api",
                  path,
                },
              }),
            );
            // console.log(entry);
          }
        });
      }
    });
  });

  ["resource", "mark", "measure"].map((type) =>
    observer.observe({ type, buffered: true }),
  );
  observer.observe({ type: "navigation" });
};

// integration point: product cart checkout
export const renderingMarker = (type, integrationPoint = "cart") => {
  let marked = {};
  const fn = () => {
    if (!marked[type]) {
      performance.mark(COMPONENT_RENDERED, {
        detail: {
          type,
          integrationPoint,
        },
      });
      marked[type] = true;
    }
  };
  fn();
};

export const scriptingMarker = () => {
  performance.mark(SCRIPT_EXECUTED);
};
