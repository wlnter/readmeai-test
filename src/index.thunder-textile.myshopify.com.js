import initialize, { seelEvents } from "./core";
import store, { snapshot } from "./core/store";
import embedWidget, {
  flatten as repaint,
} from "./component/cart-widget/thunder-textile.myshopify.com.js";
import renderModal from "./component/modal";
import renderPdpBanner from "./component/pdp-banner";
import configurations from "./config/thunder-textile.myshopify.com.json";
import { rerenderCart } from "./core/util";
import { productType } from "./core/constant";

store.configs = configurations;

const shop = "thunder-textile.myshopify.com";
const subtotalSelector = ".cart__footer .totals__subtotal-value";
const dynamicSubtotalSelector = "";
const chekoutBtnSelector = ".cart__footer [name=checkout]";
const dynamicCheckoutBtnSelector = "";
const dynamicUpdateSection = "";
const updateSection = "#main-cart-items";

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

  try {
    renderPdpBanner(productType.ra, shop);
  } catch (error) {
    console.log("error", error);
  }

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
