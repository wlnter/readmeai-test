import initialize, { seelEvents } from "./core";
import store, { snapshot } from "./core/store";
import embedWidget, {
  flatten as repaint,
} from "./component/cart-widget/index.js";
import "./component/cart-widget/kid-gear.myshopify.com.css";
import renderModal from "./component/modal";
import renderPdpBanner from "./component/pdp-banner";
import configurations from "./config/kid-gear.myshopify.com.json";
import { productType } from "./core/constant";

store.configs = configurations;

// get myshopify domain from global var
const shop = window?.Shopify?.shop || window?.Shopify?.Checkout?.apiHost;
const subtotalSelector = "div.cart-subtotal > span.money";
const dynamicSubtotalSelector =
  "#rebuy-cart > div.rebuy-cart__flyout > div.rebuy-cart__flyout-footer > div.rebuy-cart__flyout-subtotal > div.rebuy-cart__flyout-subtotal-amount";
const chekoutBtnSelector = ".cart-checkout";
const dynamicCheckoutBtnSelector =
  "#rebuy-cart > div.rebuy-cart__flyout > div.rebuy-cart__flyout-footer > div.rebuy-cart__flyout-actions > button.rebuy-button.rebuy-cart__checkout-button.block";

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

(async () => {
  await initialize(shop);

  renderPdpBanner(productType.ra, shop);

  console.log("***", snapshot(store));

  // Discard the first cart_updated event, and manually complete the inital rendering
  changeSubtotal(snapshot(store));
  store?.types?.forEach?.((type) => {
    embedWidget(type);
    renderModal(type);
  });

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
      const found = store?.types?.find((_) => _ === type);
      const widget = document.querySelector(
        `.seel_widget[data-seel-product-type='${type}']`,
      );
      if (!found && widget) {
        widget.remove();
      }
    });

    // Change Subtotal
    changeSubtotal(snapshot(store));
  });

  // Change default click behavior of checkout button
  const submitHandler = async (event) => {
    event.preventDefault();
    window.open("/checkout", "_self");
  };
  // Bind event
  chekoutBtnSelector &&
    document
      .querySelector(chekoutBtnSelector)
      ?.addEventListener("click", submitHandler);
  dynamicCheckoutBtnSelector &&
    document
      .querySelector(dynamicCheckoutBtnSelector)
      ?.addEventListener("click", submitHandler);
})();
