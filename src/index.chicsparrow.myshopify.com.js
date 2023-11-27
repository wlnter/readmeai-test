import initialize, { seelEvents } from "./core";
import store, { snapshot } from "./core/store";
import embedWidget, {
  flatten as repaint,
} from "./component/cart-widget/index.js";
import renderModal from "./component/modal";
import renderPdpBanner from "./component/pdp-banner";
import configurations from "./config/chicsparrow.myshopify.com.json";
import { productType } from "./core/constant";

store.configs = configurations;

// get myshopify domain from global var
const shop = "chicsparrow.myshopify.com";
const subtotalSelector =
  "p.cart__footer-total > span.money > span:nth-child(2)";
const dynamicSubtotalSelector =
  "div.satcb-cs-footer-subtotal > span.satcb-cs-total";
const chekoutBtnSelector =
  "#main-cart-footer > div > div > div > div.cart__ctas";
const dynamicCheckoutBtnSelector = "a.satcb-cs-checkout-btn";

const changeSubtotal = (snapshot) => {
  // Change Subtotal
  if (!snapshot.quotes || !snapshot.quotes.length) {
    return;
  }
  const { currencySymbol, currencyCode } = snapshot.quotes[0] || {};
  const { total_price: amount } = snapshot.cart;
  const subTotal = `${currencySymbol} ${(amount / 100).toFixed(2)} ${
    currencyCode || ""
  }`;

  if (subtotalSelector && document.querySelector(subtotalSelector)) {
    const element = document.querySelector(subtotalSelector);
    element.innerHTML = subTotal;
  }
  if (
    dynamicSubtotalSelector &&
    document.querySelector(dynamicSubtotalSelector)
  ) {
    const element = document.querySelector(dynamicSubtotalSelector);
    element.innerHTML = subTotal;
  }
};

const submitHandler = async (event) => {
  event.preventDefault();
  window.open("/checkout", "_self");
};

(async () => {
  await initialize(shop);

  renderPdpBanner(productType.ra, shop);

  // Discard the first cart_updated event, and manually complete the inital rendering
  store?.types?.forEach?.((type) => {
    embedWidget(type);
    renderModal(type);
  });
  changeSubtotal(snapshot(store));
  // Bind event
  chekoutBtnSelector &&
    document
      .querySelector(chekoutBtnSelector)
      ?.addEventListener("click", submitHandler);
  dynamicCheckoutBtnSelector &&
    document
      .querySelector(dynamicCheckoutBtnSelector)
      ?.addEventListener("click", submitHandler);

  // Cart Update Handler
  document.addEventListener(seelEvents.cartUpdated, () => {
    // Rerender widget
    store?.types?.forEach?.((type) => {
      const widget = document.querySelector(
        `.seel_widget[data-seel-product-type='${type}']`,
      );
      if (widget) {
        console.log(`repaint ${type}`);
        repaint(widget, type);
      } else {
        console.log(`reembed ${type}`);
        embedWidget(type);
      }
    });
    // Remove widget
    Object.values(productType).forEach((type) => {
      const found = store.types.find((_) => _ === type);
      const widget = document.querySelector(
        `.seel_widget[data-seel-product-type='${type}']`,
      );
      if (!found && widget) {
        widget.remove();
      }
    });

    // Change Subtotal
    changeSubtotal(snapshot(store));
    // Bind event
    chekoutBtnSelector &&
      document
        .querySelector(chekoutBtnSelector)
        ?.addEventListener("click", submitHandler);
    dynamicCheckoutBtnSelector &&
      document
        .querySelector(dynamicCheckoutBtnSelector)
        ?.addEventListener("click", submitHandler);
  });
})();
