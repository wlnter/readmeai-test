import store from "./core/store";
import embedWidget, {
  flatten as repaintWidget,
} from "./component/checkout-widget";
import renderModal from "./component/modal";
import initialize, { seelEvents } from "./core";
import configuration from "./config/kid-gear.myshopify.com.json";
import "./component/checkout-widget/kid-gear.myshopify.com.css";
store.configs = configuration;

const shop = "kid-gear.myshopify.com";
const productListSelector =
  ".order-summary__section.order-summary__section--product-list";
const totalLineSelector = ".total-line-table__footer";

const repaintAside = async (checkoutUrl = window.location.href) => {
  const resp = await fetch(checkoutUrl);
  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
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
