import store, { snapshot } from "./core/store";
import embedWidget, {
  flatten as repaintWidget,
} from "./component/checkout-widget";
import renderModal from "./component/modal";
import initialize, { seelEvents, updateCart } from "./core";
import configuration from "./config/kid-gear.myshopify.com.json";
import "./component/checkout-widget/kid-gear.myshopify.com.css";
store.configs = configuration;
import renderPdpBanner from "./component/pdp-banner";
import { productType } from "./core/constant";
import { scriptingMarker } from "./pixel/performance.js";
import { sendBeacon } from "./pixel/util";

scriptingMarker();

const shop = "kid-gear.myshopify.com";
const productListSelector =
  ".order-summary__section.order-summary__section--product-list";
const totalLineSelector = ".total-line__price";

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

const conversionDataReport = (widgetStatus, quoteId = "") => {
  sendBeacon(
    "conversion",
    "shopify",
    JSON.stringify({
      eventName: "checkout-record",
      shop,
      path: location.pathname,
      timestamp: Date.now(),
      checkoutToken: location.pathname.split("/").pop(),
      quoteId,
      widgetStatus,
    }),
  );
  updateCart(null, {}, { co: widgetStatus });
};

(async () => {
  // traffic split, 3/10 without widget
  const magicNumber = 3;
  const storageKey = "seel-conversion-rate-experiment";
  const cache = localStorage.getItem(storageKey);
  const { timestamp, hit } = JSON.parse(cache) || {};
  const expired = Date.now() - timestamp > 86400000;
  if (cache != null && !expired) {
    if (hit === true || hit === "true") {
      // without widget
      conversionDataReport(0);
      return null;
    } else {
      // with widget
    }
  } else {
    localStorage.removeItem(storageKey);
    const random = Date.now();
    if (random % 10 < magicNumber) {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ timestamp: Date.now(), hit: true }),
      );
      conversionDataReport(0);
      return null;
    } else {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ timestamp: Date.now(), hit: false }),
      );
    }
  }

  await initialize(shop);

  const { profiles, quotes } = snapshot(store);
  const profileFound = profiles.find((_) => _.type === productType.ra);
  const quoteFound = quotes.find((_) => _.type === productType.ra);

  if (profileFound) {
    if (quoteFound) {
      // accepted
      conversionDataReport(2, quoteFound.quoteId);
    } else {
      // rejected
      conversionDataReport(1);
    }
  } else {
    // without widget
    conversionDataReport(0);
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
