import initialize, { seelEvents } from "./core";
import store, { snapshot } from "./core/store";
import embedWidget, {
  flatten as repaint,
} from "./component/cart-widget/bennas.myshopify.com.js";
import renderModal from "./component/modal";
import renderPdpBanner from "./component/pdp-banner";
import configurations from "./config/bennas.myshopify.com.json";
// import "./component/cart-widget/bennas.myshopify.com.css";
import { productType } from "./core/constant";

store.configs = configurations;

const shop = "bennas.myshopify.com";
const subtotalSelector =
  ".cart__subtotal-container.ra-subtotal .cart__subtotal";
const dynamicSubtotalSelector = ".ajaxcart__subtotal .grid__item.text-right";
const chekoutBtnSelector = "[name='checkout']";
const dynamicCheckoutBtnSelector =
  "#CartDrawer .ajaxcart__footer [name=checkout]";

const changeSubtotal = (snapshot) => {
  // Change Subtotal
  const { currencySymbol, currencyCode } = (snapshot.quotes || [])[0] || {};
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

  // Discard the first cart_updated event, and manually complete the inital rendering
  // Update subtotal manually
  changeSubtotal(snapshot(store));
  store?.types?.forEach?.((type) => {
    embedWidget(type);
    renderModal(type);
  });

  // quote update
  document.addEventListener(seelEvents.quoteUpdated, () => {
    if (!store.quotes || !store.quotes.length) {
      // 更新UI
      setTimeout(() => {
        window.ajaxCart.load();
      }, 1000);
    }
  });
  // Cart Update Handler
  document.addEventListener(seelEvents.cartUpdated, () => {
    // 更新UI
    window.ajaxCart.load();
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
