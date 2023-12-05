import widgetTemplate from "./index.html";
import store, { snapshot } from "../../core/store";
import "./index.css";
import { pixelEvent } from "../../pixel/product-protection-pixel";
import renderPdpModal, { flatten as flattenModal } from "../pdp-modal";

const createOption = () => {
  const optionTemplate = `<div data-seel-pdp-widget-option class="seel_pdp_widget--option">
    <div data-seel-pdp-widget-option-term class="seel_pdp_widget--option--term"></div>
    <div data-seel-pdp-widget-option-price class="seel_pdp_widget--option--price"></div>
  </div>`;
  const parser = new DOMParser();
  const doc = parser.parseFromString(optionTemplate, "text/html");
  const node = doc.body.firstChild;
  return node;
};

export const flatten = (node, type) => {
  const querys = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  const { configs, profiles, quotes, sessions, product } = snapshot(store);
  const config = configs?.pdpWidgets?.find((_) => _.type === type);
  const profile = profiles.find((_) => _.type === type);
  const quote = quotes.find((_) => _.type === type);
  if(!config){
    return null;
  }
  const { name, logo, anchor, position, linkHref, linkText, description } =
    config;
  node.setAttribute("data-seel-product-type", type);
  node.querySelector("[data-seel-pdp-widget-name]").innerHTML = name;
  node.querySelector("[data-seel-pdp-widget-description]").innerHTML =
    description;
  node.querySelector("[data-seel-pdp-widget-logo]").src = logo;
  node.querySelector("[data-seel-pdp-widget-link]").href = linkHref;
  node.querySelector("[data-seel-pdp-widget-link]").innerHTML = linkText;

  const options = node.querySelector("[data-seel-pdp-widget-options]");
  options.innerHTML = "";

  if (!quote?.data) {
    return null;
  }

  const currentVariantQuote = quote.data?.find(
    (_) => _.variantId == (querys?.variant || product?.variants?.[0]?.id),
  );
  currentVariantQuote?.plans?.forEach((_, index) => {
    const option = createOption();
    option.setAttribute("data-seel-pdp-widget-option-id", _.planId);
    option.querySelector("[data-seel-pdp-widget-option-term]").innerHTML =
      _.term;
    option.querySelector(
      "[data-seel-pdp-widget-option-price]",
    ).innerHTML = `${quote.currencySymbol}${_.price}`;
    const selected =
      sessions?.[type] != null ? sessions?.[type] : profile.checked;
    if (selected && index === 0) {
      option.classList.add("seel_pdp_widget--option--selected");
      option.setAttribute("data-seel-pdp-widget-option-selected", true);
    }
    options.appendChild(option);
  });
  if (document.querySelector(".seel_pdp_modal")) {
    flattenModal(document.querySelector(".seel_pdp_modal"), type);
  }

  return node;
};

const getComponent = (type) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(widgetTemplate, "text/html");
  let component = doc.body.firstChild;
  component = flatten(doc.body.firstChild, type);
  return component;
};

const renderPdpWidget = (type, shop) => {
  const { configs, profiles, quotes, product } = snapshot(store);
  const config = configs?.pdpWidgets?.find((_) => _.type === type);
  const profile = profiles.find((_) => _.type === type);
  const quote = quotes.find((_) => _.type === type);

  const widget = getComponent(type);

  if (!config || !config.anchor || !quote || !widget) {
    return null;
  }

  renderPdpModal(type, shop);

  const anchorElement = document.querySelector(config.anchor);

  if (anchorElement) {
    anchorElement.insertAdjacentElement(config.position, widget);
    document.dispatchEvent(new CustomEvent(pixelEvent.widgetRendered), {
      detail: {
        merchant: shop,
        product: product.productId,
      },
    });
    widget
      .querySelector("[data-seel-pdp-widget-options]")
      .addEventListener("click", (e) => {
        const optionClicked = e.target.closest("[data-seel-pdp-widget-option]");
        if (optionClicked) {
          const selected = optionClicked.getAttribute(
            "data-seel-pdp-widget-option-selected",
          );
          if (selected) {
            optionClicked.removeAttribute(
              "data-seel-pdp-widget-option-selected",
            );
            optionClicked.classList.remove("seel_pdp_widget--option--selected");
          } else {
            widget
              .querySelectorAll("[data-seel-pdp-widget-option-id]")
              .forEach((el) => {
                el.removeAttribute("data-seel-pdp-widget-option-selected");
                el.classList.remove("seel_pdp_widget--option--selected");
              });
            optionClicked.setAttribute(
              "data-seel-pdp-widget-option-selected",
              true,
            );
            optionClicked.classList.add("seel_pdp_widget--option--selected");
          }
        }
      });
  }
};

export default renderPdpWidget;
