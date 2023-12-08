import initialize, { addCart, updateCart } from "./core/index.js";
import { productType, seelEvents } from "./core/constant.js";
import store, { snapshot } from "./core/store.js";
import embedWidget, {
  flatten as repaint,
} from "./component/cart-widget/index.js";
import renderModal from "./component/modal/index.js";
import renderPdpBanner from "./component/pdp-banner/index.js";
import configurations from "./config/vex-clothing-inc.myshopify.com.json";
import { rerenderCart } from "./core/util.js";
import embedPdpWidget, {
  flatten as repaintPdpWidget,
} from "./component/pdp-widget/index.js";

store.configs = configurations;

// shop related variables
const shop = "vex-clothing-inc.myshopify.com";
const option = {
  atcButtonSelector: "",
  quantitySelector: "",
  subtotalSelector: "p.cart_subtotal.js-cart_subtotal > span.right > span",
  dynamicSubtotalSelector: "",
  chekoutBtnSelector: "#checkout",
  dynamicCheckoutBtnSelector: "",
  dynamicUpdateSection: "",
  updateSection: "#cart_form > div > div.eleven.columns",
};

// helper
const changeSubtotal = (
  store,
  { subtotalSelector, dynamicSubtotalSelector },
) => {
  if (!store.quotes || !store.quotes.length) {
    return;
  }

  const { total_price: cartTotalPrice, currency } = store.cart;
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
    element.innerHTML = `${currencySymbol} ${amount}${currency}`;
  }
  if (
    dynamicSubtotalSelector &&
    document.querySelector(dynamicSubtotalSelector)
  ) {
    const element = document.querySelector(dynamicSubtotalSelector);
    element.innerHTML = `Checkout · ${currencySymbol} ${amount}${currency}`;
  }
};

// helper
const atcActionHandler = (ev, { quantitySelector }) => {
  const found = snapshot(store).quotes?.find((_) => _.type === productType.ew);
  if (!found) {
    return;
  }
  ev.preventDefault();
  const pdpWidget = document.querySelector(
    `.seel_pdp_widget[data-seel-product-type=${productType.ew}]`,
  );
  if (
    pdpWidget &&
    pdpWidget.querySelector(`[data-seel-pdp-widget-option-selected]`)
  ) {
    const querys = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });
    const { quotes, product } = snapshot(store);
    const quote = quotes.find((_) => _.type === productType.ew);
    const productVariant = querys.variant || product.variants[0].id;
    const quoteData = quote.data.find((_) => _.variantId == productVariant);
    const selectedOption = pdpWidget.querySelector(
      `[data-seel-pdp-widget-option-selected]`,
    );
    const planId = selectedOption.getAttribute(
      "data-seel-pdp-widget-option-id",
    );
    const quantity = document?.querySelector(quantitySelector)?.value || "1";
    const plan = quoteData.plans.find((_) => _.planId == planId);

    addCart({
      items: [
        {
          id: plan.variantId,
          quantity,
          properties: {
            Reference: String(productVariant),
            "Plan ID": planId,
            Product: `${quote.productTitle} - ${quoteData.variantTitle}`,
          },
        },
        {
          id: querys.variant || product.variants[0].id,
          quantity,
          properties: {
            "Plan ID": planId,
          },
        },
      ],
    }).then(() => {
      window.open("/cart", "_self");
    });
  } else {
    document.dispatchEvent(new CustomEvent(seelEvents.showPdpModal));
  }
};

// helper
const submitHandler = async (event) => {
  event.preventDefault();
  window.open("/checkout", "_self");
};

// helper
const actionDurationFrame = (
  store,
  {
    chekoutBtnSelector,
    dynamicCheckoutBtnSelector,
    subtotalSelector,
    dynamicSubtotalSelector,
  },
) => {
  // rerender subtotal
  changeSubtotal(store, {
    chekoutBtnSelector,
    dynamicCheckoutBtnSelector,
    subtotalSelector,
    dynamicSubtotalSelector,
  });

  // change behavior of checkout button
  chekoutBtnSelector &&
    document
      .querySelector(chekoutBtnSelector)
      ?.addEventListener("click", submitHandler);
  dynamicCheckoutBtnSelector &&
    document
      .querySelector(dynamicCheckoutBtnSelector)
      ?.addEventListener("click", submitHandler);
};

(async (
  shop,
  {
    dynamicUpdateSection,
    updateSection,
    atcButtonSelector,
    chekoutBtnSelector,
    quantitySelector,
  },
) => {
  await initialize(shop);

  if (store?.product?.productId) {
    renderPdpBanner(productType.ra, shop);
    embedPdpWidget(productType.ew, shop);
    document.addEventListener(seelEvents.urlChanged, () => {
      const pdpWidget = document.querySelector(
        `.seel_pdp_widget[data-seel-product-type=${productType.ew}]`,
      );
      if (pdpWidget) {
        repaintPdpWidget(pdpWidget, productType.ew);
      } else {
        embedPdpWidget(productType.ew, shop);
      }
    });

    const atcButton =
      atcButtonSelector && document.querySelector(atcButtonSelector);
    atcButton?.addEventListener("click", (ev) => {
      atcActionHandler(ev, option);
    });
    document.addEventListener(seelEvents.protectionAdded, (ev) => {
      atcActionHandler(ev, option);
    });
    document.addEventListener(seelEvents.protectionRemoved, (ev) => {
      const quantity = document?.querySelector(quantitySelector)?.value || "1";
      const { product } = snapshot(store);
      const querys = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
      });
      addCart({
        items: [
          {
            id: querys.variant || product.variants[0].id,
            quantity,
          },
        ],
      }).then(() => {
        window.open("/cart", "_self");
      });
    });
  }

  // render widget
  store?.types?.forEach?.((type) => {
    embedWidget(type);
    renderModal(type);
  });

  actionDurationFrame(snapshot(store), option);

  // rerender cart
  try {
    rerenderCart(updateSection, dynamicUpdateSection, snapshot(store));
  } catch (e) {
    console.log(e.message);
  }

  // reaction of cart update event
  document.addEventListener(seelEvents.cartUpdated, async () => {
    // rerender cart
    try {
      rerenderCart(updateSection, dynamicUpdateSection, snapshot(store));
    } catch (e) {
      console.log(e.message);
    }

    // keep quantity of product and ew item start
    const { cart } = snapshot(store);
    const updates = {};
    cart.items.forEach((item) => {
      const { vendor, properties } = item;
      if (vendor === "Seel" && properties?.["Plan ID"]) {
        const productVariantId = properties["Reference"];
        const planId = properties["Plan ID"];
        const reference = cart.items.find(
          (item) =>
            item?.id == productVariantId &&
            item?.properties["Plan ID"] == planId,
        );
        if (!reference) {
          updates[item.id] = 0;
        } else if (reference && reference.quantity != item.quantity) {
          updates[item.id] = reference.quantity;
        }
      }
    });
    store.cart = await updateCart("", updates, {});
    // keep quantity of product and ew item end

    // rerender widget
    store?.types?.forEach?.((type) => {
      const widget = document.querySelector(
        `.seel_widget[data-seel-product-type='${type}']`,
      );
      if (widget) {
        repaint(widget, type);
      } else {
        embedWidget(type);
      }
    });
    // remove widget
    Object.values(productType).forEach((type) => {
      const found = store.types.find((_) => _ === type);
      const widget = document.querySelector(
        `.seel_widget[data-seel-product-type='${type}']`,
      );
      if (!found && widget) {
        widget.remove();
        // todo: remove seel product in cart
      }
    });

    actionDurationFrame(snapshot(store), option);
  });
})(shop, option);
