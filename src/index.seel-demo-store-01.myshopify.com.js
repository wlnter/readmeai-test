import initialize, { seelEvents } from "./core";
import store from "./core/store";
import embedWidget, {
  flatten as repaint,
} from "./component/cart-widget/seel-demo-store-01.myshopify.com.js";
import renderModal from "./component/modal";
import configurations from "./config/seel-demo-store-01.myshopify.com.json";
import renderPdpBanner from "./component/pdp-banner";
import { productType } from "./core/constant";

store.configs = configurations;

(async () => {
  const shop = "seel-demo-store-01.myshopify.com";
  await initialize(shop);

  try {
    renderPdpBanner(productType.ra, shop);
  } catch (error) {
    console.log("error", error);
  }
  // Discard the first cart_updated event, and manually complete the inital rendering
  store?.types?.forEach?.((type) => {
    embedWidget(type);
    renderModal(type);
  });

  // Cart Update Handler
  document.addEventListener(seelEvents.cartUpdated, (event) => {
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
    const { currencySymbol, currencyCode } = store.quotes[0] || {};
    const { total_price: amount } = store.cart;
    const subTotal = `${currencySymbol} ${(amount / 100).toFixed(2)} ${
      currencyCode || ""
    }`;

    if (document.querySelector(".cart__footer .totals__subtotal-value")) {
      const element = document.querySelector(
        ".cart__footer .totals__subtotal-value",
      );
      element.innerHTML = subTotal;
    }
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
    .querySelector("[name=checkout]")
    ?.addEventListener("click", submitHandler);
})();
