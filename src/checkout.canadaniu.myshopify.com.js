import store from "./core/store";
import embedWidget, {
  flatten as repaintWidget,
} from "./component/checkout-widget";
import renderModal from "./component/modal";
import initialize, { seelEvents } from "./core";
import configuration from "./config/canadaniu.myshopify.com.json";
store.configs = configuration;

const repaintAside = async (checkoutUrl = window.location.href) => {
  const resp = await fetch(checkoutUrl);
  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const productListSelector =
    "aside > div.RTcqB > div > div > div > div > section";
  const totalLineSelector = "div._1x41w3p1._1fragemf8._1fragemec._1x41w3p5";
  const productList = doc.querySelector(productListSelector);
  const totalLine = doc.querySelector(totalLineSelector);
  document.querySelector(productListSelector)?.replaceWith(productList);
  document.querySelector(totalLineSelector)?.replaceWith(totalLine);
};

(async () => {
  const shop = "canadaniu.myshopify.com";
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
