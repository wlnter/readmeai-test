import modalTemplate from "./index.html";
import store, { snapshot } from "../../core/store";
import { seelEvents } from "../../core/constant";
import { pixelEvent } from "../../pixel/product-protection-pixel";
import "./index.css";

export const createOption = () => {
  const template = `<div class="seel_pdp_modal--plans--item" data-seel-pdp-modal-plan>
    <div class="seel_pdp_modal--plans--item--desc"></div>
    <div class="seel_pdp_modal--plans--item--price"></div>
  </div>`;
  const parser = new DOMParser();
  const doc = parser.parseFromString(template, "text/html");
  let component = doc.body.firstChild;
  return component;
};
const deselectWidgetOption = () => {
  const widget = document.querySelector(".seel_pdp_widget");
  const widgetOptions = widget?.querySelectorAll(".seel_pdp_widget--option");
  widgetOptions?.forEach((el) => {
    el.removeAttribute("data-seel-pdp-widget-option-selected");
    el.classList.remove("seel_pdp_widget--option--selected");
  });
};
const syncSelection = (planId) => {
  // sync
  const widget = document.querySelector(".seel_pdp_widget");
  const widgetOptions = widget?.querySelectorAll(".seel_pdp_widget--option");
  widgetOptions?.forEach((el) => {
    const id = el.getAttribute("data-seel-pdp-widget-option-id");
    if (id == planId) {
      el.setAttribute("data-seel-pdp-widget-option-selected", true);
      el.classList.add("seel_pdp_widget--option--selected");
    } else {
      el.removeAttribute("data-seel-pdp-widget-option-selected");
      el.classList.remove("seel_pdp_widget--option--selected");
    }
  });
};

export const flatten = (node, type) => {
  const querys = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  const { configs, profiles, quotes, sessions, product } = snapshot(store);
  const profile = profiles.find((_) => _.type === type);
  const quote = quotes.find((_) => _.type === type);

  if (!quote || !quote.data) {
    return null;
  }

  const currentVariantQuote = quote.data?.find(
    (_) => _.variantId == (querys?.variant || product?.variants?.[0]?.id),
  );
  const options = node.querySelector(".seel_pdp_modal--plans");
  options.innerHTML = "";
  currentVariantQuote?.plans?.forEach((_, index) => {
    const option = createOption();
    option.setAttribute("data-seel-pdp-modal-plan-id", _.planId);
    option.querySelector(".seel_pdp_modal--plans--item--desc").innerHTML =
      _.term;
    option.querySelector(
      ".seel_pdp_modal--plans--item--price",
    ).innerHTML = `${quote.currencySymbol}${_.price}`;
    const selected = true;
    // const selected =
    //   sessions?.[type] != null ? sessions?.[type] : profile.checked;
    if (selected && index === 0) {
      option.classList.add("seel_pdp_modal--plans--item--selected");
      option.setAttribute("data-seel-pdp-modal-plan-selected", true);
    }
    options.appendChild(option);
  });
  return node;
};

const getComponent = (type) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(modalTemplate, "text/html");
  let component = doc.body.firstChild;
  component = flatten(doc.body.firstChild, type);
  return component;
};

const renderModal = (type, shop) => {
  const modal = getComponent(type);

  if (!modal) {
    return;
  }
  modal.addEventListener("click", (ev) => {
    const { target } = ev;
    // dismiss PDP modal
    if (target.hasAttribute("data-seel-pdp-modal-dismiss")) {
      if (target.hasAttribute("data-seel-pdp-modal-deselect")) {
        deselectWidgetOption();
        document.dispatchEvent(new CustomEvent(seelEvents.protectionRemoved));
      }
      modal.classList.add("seel_pdp_modal_hidden");
    }
    // choose protection plan and sync selection on widget
    if (
      target.hasAttribute("data-seel-pdp-modal-plan") ||
      target
        .closest(".seel_pdp_modal--plans--item")
        ?.hasAttribute("data-seel-pdp-modal-plan")
    ) {
      const element = target.closest(".seel_pdp_modal--plans--item") || target;
      const planId = element.getAttribute("data-seel-pdp-modal-plan-id");
      modal.querySelectorAll(".seel_pdp_modal--plans--item").forEach((el) => {
        el.classList.remove("seel_pdp_modal--plans--item--selected");
        el.removeAttribute("data-seel-pdp-modal-plan-selected");
      });
      element.classList.add("seel_pdp_modal--plans--item--selected");
      element.setAttribute("data-seel-pdp-modal-plan-selected", true);

      syncSelection(planId);
    }
    // Add plan to cart
    if (target.hasAttribute("data-seel-pdp-modal-cta")) {
      const selected = modal.querySelector(
        "[data-seel-pdp-modal-plan-selected]",
      );
      if (selected) {
        syncSelection(selected.getAttribute("data-seel-pdp-modal-plan-id"));
        modal.classList.add("seel_pdp_modal_hidden");
        document.dispatchEvent(new CustomEvent(seelEvents.protectionAdded));
        document.dispatchEvent(
          new CustomEvent(pixelEvent.protectionSelected, {
            detail: { source: "modal" },
          }),
        );
      }
    }
  });
  document.addEventListener(seelEvents.showPdpModal, () => {
    modal.classList.remove("seel_pdp_modal_hidden");
  });
  document.body.insertAdjacentElement("beforeend", modal);
};

export default renderModal;
