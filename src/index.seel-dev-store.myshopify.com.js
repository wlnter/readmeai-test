import initialize, { addCart, updateCart } from "./core";
import { createElementFromString } from "./core/util";
import store, { snapshot } from "./core/store";
import renderPdpBanner from "./component/pdp-banner";
import configurations from "./config/seel-dev-store.myshopify.com.json";
import { productType, seelEvents } from "./core/constant";
import embedPdpWidget, {
  flatten as repaintPdpWidget,
} from "./component/pdp-widget";
import embedWidget, { flatten as repaint } from "./component/cart-widget";
import renderModal from "./component/modal";

store.configs = configurations;

const shop = "seel-dev-store.myshopify.com";
const atcButtonSelector = ".product-form__submit";
const quantitySelector = ".quantity__input";
const subtotalSelector =
  "#main-cart-footer > div > div > div > div.js-contents > div.totals > p";
const dynamicSubtotalSelector = "";
const chekoutBtnSelector = ".cart__ctas";
const dynamicCheckoutBtnSelector = "";
const dynamicUpdateSection = "";
const updateSection = "#template--21173089665323__cart-items";

const changeSubtotal = (snapshot) => {
  // Change Subtotal
  if (!snapshot.quotes || !snapshot.quotes.length) {
    return;
  }
  const { currencySymbol, currencyCode } = snapshot.quotes[0];
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

const atcActionHandler = (ev) => {
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

    // calculate ew_mapping start
    // const value = cart?.attributes?.[`${productType.ew}_mapping`] || "";
    // const mapping = {};
    // const delimiter = "__";
    // (value.split(",") || []).forEach((item) => {
    //   if (item) {
    //     const [q, v, p] = item.split(delimiter);
    //     mapping[`${v}${delimiter}${p}`] = q;
    //   }
    // });
    // mapping[`${productVariant}${delimiter}${planId}`] = quote.quoteId;
    // const attr = Object.entries(mapping).map(
    //   ([key, value]) => `${value}${delimiter}${key}`,
    // );
    // ew_mapping end
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

(async () => {
  await initialize(shop);

  if (store?.product?.productId) {
    renderPdpBanner(productType.ra);
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
    atcButton?.addEventListener("click", atcActionHandler);
    document.addEventListener(seelEvents.protectionAdded, atcActionHandler);
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

  // Discard the first cart_updated event, and manually complete the inital rendering
  changeSubtotal(snapshot(store));
  store?.types?.forEach?.((type) => {
    embedWidget(type);
    renderModal(type);
  });

  // Cart Update Handler
  document.addEventListener(seelEvents.cartUpdated, async () => {
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

    // keep quantity of product and ew item start
    const { cart } = snapshot(store);
    const updates = {};
    cart.items.forEach((item) => {
      const { vendor, properties } = item;
      if (vendor === "Seel" && properties?.["Plan ID"]) {
        const productVariantId = properties["Reference"];
        console.log(productVariantId);
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
    console.log("ew-product quantity changed", updates);
    store.cart = await updateCart("", updates, {});
    // keep quantity of product and ew item end

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
