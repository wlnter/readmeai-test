import initialize, { seelEvents } from "./core";
import store, { snapshot } from "./core/store";
import embedWidget, {
  flatten as repaint,
} from "./component/cart-widget/index.js";
import configurations from "./config/803c78-2.myshopify.com.json";
import renderModal from "./component/modal";
import renderPdpBanner from "./component/pdp-banner";
//import configurations from "./config/index.json";
import { productType } from "./core/constant";
import { rerenderCart } from "./core/util";
// get myshopify domain from global var

store.configs = configurations;

const shop = window?.Shopify?.shop || window?.Shopify?.Checkout?.apiHost;

const subtotalSelector = "#MainContent .totals__subtotal-value";
const dynamicSubtotalSelector = "#mini-cart #mini-cart-subtotal";
const chekoutBtnSelector = "#MainContent [name=checkout]";
const dynamicCheckoutBtnSelector = "#mini-cart [name=checkout]";
const dynamicUpdateSection = "";
const updateSection = "";

const changeSubtotal = (snapshot) => {
  // Change Subtotal
  if (!snapshot.quotes || !snapshot.quotes.length) {
    return;
  }

  const { total_price: cartTotalPrice, currency } = snapshot.cart;
  const subTotal = (cartTotalPrice / 100).toFixed(2);
  const numberFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  });
  const parts = numberFormat.formatToParts(subTotal);
  const partValues = parts.map((p) => p.value);
  const currencySymbol = partValues.shift();
  const amount = partValues.join("");

  if (subtotalSelector && document.querySelector(subtotalSelector)) {
    const element = document.querySelector(subtotalSelector);
    element.innerHTML = `${currencySymbol} ${amount}${currency}`;
  }
  if (
    dynamicSubtotalSelector &&
    document.querySelector(dynamicSubtotalSelector)
  ) {
    const element = document.querySelector(dynamicSubtotalSelector);
    element.innerHTML = `${currencySymbol} ${amount}${currency}`;
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
    // Rerender cart
    try {
      rerenderCart(updateSection, dynamicUpdateSection, store);
    } catch {
      console.log("rerender cart fail");
    }
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
    chekoutBtnSelector &&
      document
        .querySelector(chekoutBtnSelector)
        ?.addEventListener("click", submitHandler);
    dynamicCheckoutBtnSelector &&
      document
        .querySelector(dynamicCheckoutBtnSelector)
        ?.addEventListener("click", submitHandler);
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
  chekoutBtnSelector &&
    document
      .querySelector(chekoutBtnSelector)
      ?.addEventListener("click", submitHandler);
  dynamicCheckoutBtnSelector &&
    document
      .querySelector(dynamicCheckoutBtnSelector)
      ?.addEventListener("click", submitHandler);
})();
