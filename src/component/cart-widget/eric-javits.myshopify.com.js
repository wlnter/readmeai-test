import lodashTemplate from "lodash.template";
import widgetTemplate from "./index.html";
import { bindWidgetEvents } from "../../core";
import store, { snapshot } from "../../core/store";
import { formatMoney } from "../../core/util"
import "./index.css";
import "./eric-javits.myshopify.com.css";
import "../../asset/eric-javits.myshopify.com.css";

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
        value:formatMoney(value),
        price:formatMoney(price),
      }
  const widgetName = widget.querySelector(".seel_widget--title_line--name");
  const widgetIconEl = widget.querySelector(".seel_widget--desc_line--icon");
  const widgetInfoIconEl = widget.querySelector("[data-seel-widget-info]");
  const widgetDesc = widget.querySelector(".seel_widget--desc_line--text");
  widgetName.innerHTML = name;
  widgetIconEl.setAttribute("src", widgetIcon);
  widgetInfoIconEl.setAttribute("src", infoIcon);
  widgetDesc.innerHTML = lodashTemplate(
    description,
    templateOption,
  )({ ...profile, ...quote, ...formatQuote, listPrice: listPriceRate ? listPrice : "" });
  if (sessions?.[type] || profile?.checked) {
    widget
      .querySelector(".seel_widget--title_line--checkbox")
      ?.setAttribute("checked", true);
  }
  return widget;
};

export const getComponent = (type) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(widgetTemplate, "text/html");
  const component = flatten(doc.body.firstChild, type);
  return component;
};

const waitForAnchorToRenderStably = async (anchor, ms = 500) =>
  new Promise((resolve) => {
    let timer = null;
    const observer = new MutationObserver((_, observer) => {
      if (document.querySelector(anchor)) {
        clearTimeout(timer);
        // stable
        timer = setTimeout(() => {
          if (document.querySelector(anchor)) {
            observer.disconnect();
            console.log("inserted");
            resolve();
          }
        }, ms);
      }
    });
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  });

export const embedWidget = (type) => {
  const { configs, sessions } = snapshot(store);
  const config = configs.widgets.find((_) => _.type === type);
  if (!config) {
    return;
  }
  const widget = getComponent(type);
  if (sessions?.[type]) {
    widget
      .querySelector("[data-seel-widget-input]")
      .setAttribute("checked", true);
  } else {
    widget.querySelector("[data-seel-widget-input]").removeAttribute("checked");
  }

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
    document
      .querySelector(selector)
      .insertAdjacentElement(insertPosition, widget);
    widget.dataset.seelProductType = type;
    bindWidgetEvents(type);
  } else if (dynamicAnchor && widget) {
    waitForAnchorToRenderStably(dynamicAnchor, 800).then(() => {
      const widgetElement = document.querySelector(
        `.seel_widget[data-seel-product-type='${type}']`,
      );
      if (document.querySelector(dynamicAnchor) && !widgetElement) {
        document
          .querySelector(dynamicAnchor)
          .insertAdjacentElement(dynamicPosition || "beforebegin", widget);
        widget.dataset.seelProductType = type;
        bindWidgetEvents(type);
      }
    });
  }
};

export default embedWidget;
