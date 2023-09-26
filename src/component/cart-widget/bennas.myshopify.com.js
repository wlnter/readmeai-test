import lodashTemplate from "lodash.template";
import widgetTemplate from "./index.html";
import { bindWidgetEvents } from "../../core";
import store, { snapshot } from "../../core/store";
import { formatMoney } from "../../core/util";
import "./index.css";
import "./bennas.myshopify.com.css";

const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));

export const flatten = (widget, type) => {
  const { configs, profiles, quotes, sessions } = snapshot(store);
  const config = configs.widgets.find((_) => _.type === type);
  const profile = profiles.find((_) => _.type === type);
  const quote = quotes.find((_) => _.type === type);
  const { description, name, infoIcon, widgetIcon, listPriceRate } = config;
  const templateOption = { interpolate: /\{\{(.+?)\}\}/g };
  const { value, price, currencySymbol } = quote;
  const listPrice =
    (value * listPriceRate).toFixed(2) > price
      ? `${currencySymbol}${(value * listPriceRate).toFixed(2)}`
      : "";
  const formatQuote = {
    value: formatMoney(value),
    price: formatMoney(price),
  };
  const widgetName = widget.querySelector(".seel_widget--title_line--name");
  const widgetIconEl = widget.querySelector(".seel_widget--desc_line--icon");
  const widgetInfoIconEl = widget.querySelector("[data-seel-widget-info]");
  const widgetDesc = widget.querySelector(".seel_widget--desc_line--text");
  widgetName.innerHTML = name;
  widgetIconEl.setAttribute("src", widgetIcon);
  widgetInfoIconEl.setAttribute("src", infoIcon);
  widgetDesc.innerHTML = lodashTemplate(
    description,
    templateOption
  )({
    ...profile,
    ...quote,
    ...formatQuote,
    listPrice: listPriceRate ? listPrice : "",
  });
  widget.querySelector(".seel_widget--title_line--checkbox").checked =
    sessions?.[type] == null ? profile?.checked : sessions?.[type];
  return widget;
};

export const getComponent = (type) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(widgetTemplate, "text/html");
  const component = flatten(doc.body.firstChild, type);
  return component;
};

const containerClass = "seel_widgets_list_container";
const createContainer = () => {
  const container = document.createElement("div");
  container.classList.add(containerClass);
  return container;
};
const isContainerMounted = () => document.querySelector(`.${containerClass}`);

let dynamicAnchorObserver = {};
export const embedWidget = async (type) => {
  // 第一次加载widget延迟展示
  await delay(1000);
  const { configs, sessions } = snapshot(store);
  const config = configs.widgets.find((_) => _.type === type);
  if (!config) {
    return;
  }
  const widget = getComponent(type);
  widget.querySelector("[data-seel-widget-input]").checked = sessions?.[type]
    ? true
    : false;

  const {
    anchor,
    position,
    checkoutAnchor,
    checkoutPosition,
    dynamicAnchor,
    dynamicPosition,
  } = config;
  const selector = checkoutAnchor || anchor;
  const insertPosition = checkoutPosition || position || "beforebegin";

  if (selector && document.querySelector(selector) && widget) {
    let container = isContainerMounted();
    if (!container) {
      document
        .querySelector(selector)
        .insertAdjacentElement(insertPosition, createContainer());
      container = isContainerMounted();
    }
    container.insertAdjacentElement("beforeend", widget);
    // document
    //   .querySelector(selector)
    //   .insertAdjacentElement(insertPosition, widget);
    widget.dataset.seelProductType = type;
    console.log(`insert ${type} widget and bind events`);
    bindWidgetEvents(type);
  } else if (dynamicAnchor && document.querySelector(dynamicAnchor) && widget) {
    const widgetElement = document.querySelector(
      `.seel_widget[data-seel-product-type='${type}']`
    );
    if (!widgetElement && document.querySelector(dynamicAnchor)) {
      let container = isContainerMounted();
      if (!container) {
        document
          .querySelector(dynamicAnchor)
          .insertAdjacentElement(dynamicPosition, createContainer());
        container = isContainerMounted();
      }
      container.insertAdjacentElement("beforeend", widget);
      // document
      //   .querySelector(dynamicAnchor)
      //   .insertAdjacentElement(dynamicPosition || "beforebegin", widget);
      widget.dataset.seelProductType = type;
      console.log(`insert dynamicAnchor ${type} widget and bind events`);
      bindWidgetEvents(type);
    }
  } else if (dynamicAnchor && widget) {
    dynamicAnchorObserver?.[type]?.disconnect?.();
    dynamicAnchorObserver[type] = new MutationObserver(() => {
      const widgetElement = document.querySelector(
        `.seel_widget[data-seel-product-type='${type}']`,
      );
      if (!widgetElement && document.querySelector(dynamicAnchor)) {
        let container = isContainerMounted();
        if (!container) {
          document
            .querySelector(dynamicAnchor)
            .insertAdjacentElement(dynamicPosition, createContainer());
          container = isContainerMounted();
        }
        container.insertAdjacentElement("beforeend", widget);
        // document
        //   .querySelector(dynamicAnchor)
        //   .insertAdjacentElement(dynamicPosition || "beforebegin", widget);
        widget.dataset.seelProductType = type;
        console.log(`insert ${type} widget and bind events`);
        bindWidgetEvents(type);
        dynamicAnchorObserver?.[type]?.disconnect?.();
      }
    });
    dynamicAnchorObserver[type].observe(
      document.querySelector("#sidebar-cart") || document.body,
      { attributes: true, childList: true, subtree: true },
    );
  }
};

export default embedWidget;
