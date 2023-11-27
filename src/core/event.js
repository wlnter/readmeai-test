import { updateCart } from "./fetch";
import store, { snapshot } from "./store";
import { seelEvents } from "./constant";
import { styledLogger } from "./util";

export const setPerformanceObserver = () => {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (
        entry.entryType === "resource" &&
        (entry.name.indexOf("cart/change") > -1 ||
          entry.name.indexOf("cart/add") > -1)
      ) {
        document.dispatchEvent(new CustomEvent(seelEvents.cartChanged));
        styledLogger("Cart Edited");
      }
    });
  });
  observer.observe({ type: "resource" });
};

export const locationHashObserver = () => {
  let href = document.location.href;
  const observer = new MutationObserver(() => {
    if (href !== document.location.href) {
      href = document.location.href;
      document.dispatchEvent(new CustomEvent(seelEvents.urlChanged));
    }
  });
  observer.observe(document.querySelector("body"), {
    childList: true,
    subtree: true,
  });
};

export const bindWidgetEvents = async (type, widget) => {
  widget =
    widget ||
    document.querySelector(`.seel_widget[data-seel-product-type="${type}"]`);
  widget.addEventListener("click", async (event) => {
    console.log("bindWidgetEvents", event);
    const source = event.target;
    const { configs, quotes } = snapshot(store);
    const config = configs.widgets.find((_) => _.type === type);
    const quote = quotes.find((_) => _.type === type);
    if (source.hasAttribute("data-seel-widget-input")) {
      // widget input
      const { variantId } = quote;
      store.cart = await updateCart(null, {
        [variantId]: source.checked ? 1 : 0,
      });
      store.sessions = store.sessions || {};
      store.sessions[type] = !!source.checked;

      const detail = {
        updates: { [variantId]: source.checked ? 1 : 0 },
        checked: source.checked,
        type,
      };
      document.dispatchEvent(
        new CustomEvent(seelEvents.cartUpdated, {
          detail,
        }),
      );
      styledLogger(`Cart Updated ${type}`);
      console.log(detail);
    } else if (source.hasAttribute("data-seel-widget-info")) {
      // widget info
      if (config.infoIconLink) {
        window.open(config.infoIconLink, "_blank");
      } else {
        document.dispatchEvent(
          new CustomEvent(seelEvents.showModal, { detail: { type } }),
        );
      }
    } else {
      // others
    }
  });
};
