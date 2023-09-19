import initialize, { seelEvents } from "./core";
import store, { snapshot } from "./core/store";
import embedWidget, {
  flatten as repaint,
} from "./component/cart-widget/index.js";
import renderModal from "./component/modal";
import renderPdpBanner from "./component/pdp-banner";
import configurations from "./config/adelante-shoe-co.myshopify.com.json";
import { productType } from "./core/constant";
import "./component/cart-widget/adelante-shoe-co.myshopify.com.css";

store.configs = configurations;

const shop = window?.Shopify?.shop || window?.Shopify?.Checkout?.apiHost;
const subtotalSelector =
  "#main-cart-footer > div > div > div > div.js-contents > div.totals > p";
const dynamicSubtotalSelector =
  "#rebuy-cart > div.rebuy-cart__flyout > div.rebuy-cart__flyout-footer > div.rebuy-cart__flyout-subtotal > div.rebuy-cart__flyout-subtotal-amount";
const chekoutBtnSelector =
  "#main-cart-footer > div > div > div > div.cart__ctas";
const dynamicCheckoutBtnSelector =
  "#rebuy-cart > div.rebuy-cart__flyout > div.rebuy-cart__flyout-footer > div.rebuy-cart__flyout-actions > button.rebuy-button.rebuy-cart__checkout-button.block";

const changeSubtotal = (snapshot) => {
  // Change Subtotal
  const { currencySymbol, currencyCode } = snapshot.quotes[0];
  const { total_price: amount } = snapshot.cart;
  const subTotal = `${currencySymbol} ${(amount / 100).toFixed(2)} ${
    currencyCode || ""
  }`;

  if (document.querySelector(subtotalSelector)) {
    const element = document.querySelector(subtotalSelector);
    element.innerHTML = subTotal;
  }
  if (document.querySelector(dynamicSubtotalSelector)) {
    const element = document.querySelector(dynamicSubtotalSelector);
    element.innerHTML = subTotal;
  }
};

(async () => {
  await initialize(shop);

  renderPdpBanner(productType.ra, shop);

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
  });

  // Change default click behavior of checkout button
  const submitHandler = async (event) => {
    event.preventDefault();
    // const { url: checkoutUrl } = await fetch(`${window.location.origin}/cart`, {
    //   headers: {
    //     "content-type": "application/x-www-form-urlencoded",
    //   },
    //   method: "post",
    //   body: "checkout=",
    // });
    // window.open(checkoutUrl, "_self");
    window.open("/checkout", "_self");
    // return false;
  };
  // Bind event
  document
    .querySelector(chekoutBtnSelector)
    ?.addEventListener("click", submitHandler);
  document
    .querySelector(dynamicCheckoutBtnSelector)
    ?.addEventListener("click", submitHandler);
})();
