import initialize, { seelEvents } from "./core";
import store, { snapshot } from "./core/store";
import embedWidget, {
  flatten as repaint,
} from "./component/cart-widget/index.js";
import renderModal from "./component/modal";
import renderPdpBanner from "./component/pdp-banner";
import configurations from "./config/funnyfuzzy2021.myshopify.com.json";
import { productType } from "./core/constant";
import "./component/cart-widget/funnyfuzzy2021.myshopify.com.css";
import { createElementFromString } from "./core/util";

store.configs = configurations;

// get myshopify domain from global var
const shop = "funnyfuzzy2021.myshopify.com";
const subtotalSelector = "#revy-cart-subtotal-price";
const dynamicSubtotalSelector = "#mini-cart > footer > button";
const chekoutBtnSelector = "div.cart__aside > safe-sticky > form > button";
const dynamicCheckoutBtnSelector = "#mini-cart > footer > button";
const dynamicUpdateSection = "#mini-cart-form";
const updateSection = "";

const changeSubtotal = (snapshot) => {
  // Change Subtotal
  if (!snapshot.quotes || !snapshot.quotes.length) {
    return;
  }

  const { total_price: cartTotalPrice, currency } = snapshot.cart;
  const subTotal = (cartTotalPrice / 100).toFixed(2);
  const numberFormat = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  });
  const parts = numberFormat.formatToParts(subTotal);
  const partValues = parts.map((p) => p.value);
  const currencySymbol = partValues.pop();
  const amount = partValues.join("");

  if (subtotalSelector && document.querySelector(subtotalSelector)) {
    const element = document.querySelector(subtotalSelector);
    element.innerHTML = subTotal;
  }
  if (
    dynamicSubtotalSelector &&
    document.querySelector(dynamicSubtotalSelector)
  ) {
    const element = document.querySelector(dynamicSubtotalSelector);
    element.innerHTML = `Checkout · ${currencySymbol} ${amount}${currency}`;
  }
};

const submitHandler = async (event) => {
  event.preventDefault();
  window.open("/checkout", "_self");
};

(async () => {
  if (window.location.href.indexOf("/cart") > -1) {
    return;
  }
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
    // Rerender cart
    if (updateSection || dynamicUpdateSection) {
      const sections = store.cart.sections;
      for (let prop in sections) {
        if (sections[prop]) {
          const element = createElementFromString(sections[prop]);
          if (updateSection) {
            if (
              element.querySelector(updateSection) &&
              document.querySelector(updateSection)
            ) {
              document.querySelector(updateSection).innerHTML =
                element.querySelector(updateSection).innerHTML;
            }
          }
          if (dynamicUpdateSection) {
            if (
              element.querySelector(dynamicUpdateSection) &&
              document.querySelector(dynamicUpdateSection)
            ) {
              document.querySelector(dynamicUpdateSection).innerHTML =
                element.querySelector(dynamicUpdateSection).innerHTML;
            }
          }
        }
      }
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
