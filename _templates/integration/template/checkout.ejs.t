---
to: "<%= integrationPoint === 'checkout' ? `src/checkout.${shop}.myshopify.com.js` : null %>"
---

import store from "./core/store";
import embedWidget, {
  flatten as repaintWidget,
} from "./component/checkout-widget";
import renderModal from "./component/modal";
import initialize, { seelEvents } from "./core";
import configuration from "./config/<%= shop %>.myshopify.com.json";
import { scriptingMarker } from "./pixel/performance.js";

store.configs = configuration;

scriptingMarker();

const shop = "<%= shop %>.myshopify.com";

const repaintAside = async (checkoutUrl = window.location.href) => {
  const resp = await fetch(checkoutUrl);
  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const productListSelector =
    ".order-summary__section.order-summary__section--product-list";
  const totalLineSelector = ".order-summary__section order-summary__section--total-lines";
  const productList = doc.querySelector(productListSelector);
  const totalLine = doc.querySelector(totalLineSelector);
  document.querySelector(productListSelector)?.replaceWith(productList);
  document.querySelector(totalLineSelector)?.replaceWith(totalLine);
};

(async () => {
  await initialize(shop);

  store?.types?.forEach?.((type) => {
    embedWidget(type);
    renderModal(type);
  });
  repaintAside();

  document.addEventListener(seelEvents.cartUpdated, async () => {
    store?.types?.forEach?.((type) => {
      const widget = document.querySelector(
        `.seel_widget[data-seel-product-type='${type}']`,
      );
      if (widget) {
        repaintWidget(widget, type);
      }
    });
    repaintAside();
  });
})();
