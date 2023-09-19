import store from "./core/store";
import embedWidget, {
  flatten as repaintWidget,
} from "./component/checkout-widget";
import renderModal from "./component/modal";
import renderPdpBanner from "./component/pdp-banner";
import initialize, { seelEvents, styledLogger } from "./core";
import configuration from "./config/gemma-by-wp-diamonds.myshopify.com.json";
import { productType } from "./core/constant";

import "./component/checkout-widget/gemma-by-wp-diamonds.myshopify.com.css";

store.configs = configuration;

const repaintAside = async (checkoutUrl = window.location.href) => {
  const resp = await fetch(checkoutUrl);
  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const productListSelector =
    ".order-summary__section.order-summary__section--product-list";
  const totalLineSelector =
    ".order-summary__section.order-summary__section--total-lines";
  const productList = doc.querySelector(productListSelector);
  const totalLine = doc.querySelector(totalLineSelector);
  document.querySelector(productListSelector)?.replaceWith(productList);
  document.querySelector(totalLineSelector)?.replaceWith(totalLine);
};

(async () => {
  const shop = "gemma-by-wp-diamonds.myshopify.com";
  await initialize(shop);

  try {
    renderPdpBanner(productType.ra, shop);
  } catch (error) {
    console.log("error", error);
  }

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
