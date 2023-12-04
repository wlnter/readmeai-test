import { sendBeacon } from "./util";
import { getFingerprint } from "../core/util";
import { seelEvents } from "../core/constant";
import store, { snapshot } from "../core/store";

export const pixelEvent = {
  widgetRendered: "seel:product-protection:widget:rendered",
  protectionSelected: "seel:product-protection:widget:selected",
};

document.addEventListener(pixelEvent.widgetRendered, async (event) => {
  const { shop, product } = snapshot(store);

  console.log("pdp_widget_show");
  sendBeacon(
    "product-protection-user-behavior",
    "shopify",
    JSON.stringify({
      eventData: {
        eventName: "pdp_widget_show",
        merchant: shop,
        product: product.productId,
        deviceId: await getFingerprint(),
      },
    }),
  );
});

document.addEventListener(seelEvents.showPdpModal, async (event) => {
  const { shop, product } = snapshot(store);

  console.log("modal_show");
  sendBeacon(
    "product-protection-user-behavior",
    "shopify",
    JSON.stringify({
      eventData: {
        eventName: "modal_show",
        merchant: shop,
        product: product.productId,
        deviceId: await getFingerprint(),
      },
    }),
  );
});

document.addEventListener(pixelEvent.protectionSelected, async (event) => {
  const { source } = event.detail;
  const { shop, product } = snapshot(store);
  console.log(
    source === "widget" ? "pdp_protection_added" : "modal_protection_added",
  );
  sendBeacon(
    "product-protection-user-behavior",
    "shopify",
    JSON.stringify({
      eventData: {
        eventName:
          source === "widget"
            ? "pdp_protection_added"
            : "modal_protection_added",
        merchant: shop,
        product: product.productId,
        deviceId: await getFingerprint(),
      },
    }),
  );
});
