import initialize, { seelEvents, getQuotesAndUpdateCart } from "./core";
import store, { snapshot } from "./core/store";
import embedWidget, {
  flatten as repaint,
} from "./component/cart-widget/eric-javits.myshopify.com.js";
import renderModal from "./component/modal";
import renderPdpBanner from "./component/pdp-banner";
import configurations from "./config/eric-javits.myshopify.com.json";
import { productType } from "./core/constant";
store.configs = configurations;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const handler = async () => {
  const { cart, quotes } = snapshot(store);
  const { total_price: total } = cart;
  const { currencySymbol } = quotes[0];
  const subtotal = `${currencySymbol} ${(total / 100).toFixed(2)}`;
  if (document.querySelector(".cart__total-container > span:nth-child(2)")) {
    document.querySelector(
      ".cart__total-container > span:nth-child(2)",
    ).innerHTML = subtotal;
  }

  // Refresh Drawer Cart
  document.documentElement.dispatchEvent(
    new CustomEvent("cart:refresh", {
      bubbles: true,
      detail: {
        cart,
        openMiniCart: true,
      },
    }),
  );
  console.log("refresh mini cart");
  await delay(500);
  store?.types?.forEach?.((type) => {
    const widget = document.querySelector(
      `.seel_widget[data-seel-product-type='${type}']`,
    );
    if (widget) {
      console.log("repaint widget");
      repaint(widget, type);
    } else {
      console.log("re-embed widget");
      embedWidget(type);
    }
  });
};

(async () => {
  const shop = "eric-javits.myshopify.com";
  await initialize(shop);

  console.log(snapshot(store));

  // Cart Changed
  document.addEventListener(seelEvents.cartChanged, () => {
    getQuotesAndUpdateCart(shop);
  });
  // Cart Updated
  document.addEventListener(seelEvents.cartUpdated, handler);

  try {
    renderPdpBanner(productType.ra, shop);
  } catch (error) {
    console.log("error", error);
  }

  // Initial Render
  store?.types?.forEach?.((type) => {
    embedWidget(type);
    renderModal(type);
  });

  // Change default click behavior of checkout button
  const submitHandler = async (ev) => {
    ev.preventDefault();
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
  // static cart
  document.querySelector("#checkout")?.addEventListener("click", submitHandler);
  // dynamic cart
  document
    .querySelector("#mini-cart > footer > button")
    ?.addEventListener("click", submitHandler);
})();
