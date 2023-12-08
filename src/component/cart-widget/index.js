import lodashTemplate from "lodash.template";
import widgetTemplate from "./index.html";
import { bindWidgetEvents, seelEvents } from "../../core";
import store, { snapshot } from "../../core/store";
import { formatMoney, getWidgetSwitchStatus } from "../../core/util";
import { loadExperimentAsset, trafficSplitter } from "../../experiment";
import "./index.css";
import { renderingMarker } from "../../pixel/performance";

export const flatten = (widget, type) => {
  const { configs, profiles, quotes, sessions } = snapshot(store);
  const config = configs.widgets.find((_) => _.type === type);

  const profile = profiles.find((_) => _.type === type);
  const quote = quotes.find((_) => _.type === type);
  const { description, name, infoIcon, widgetIcon, listPriceRate } = config;
  const templateOption = { interpolate: /\{\{(.+?)\}\}/g };
  if (!quote) {
    return null;
  }
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
  const widgetIconEl = widget.querySelector("[data-seel-widget-icon]");
  const widgetInfoIconEl = widget.querySelector("[data-seel-widget-info]");
  const widgetDesc = widget.querySelector("[data-seel-widget-desc]");
  widgetName.innerHTML = lodashTemplate(
    name,
    templateOption,
  )({
    ...profile,
    ...quote,
    ...formatQuote,
    listPrice: listPriceRate ? listPrice : "",
  });
  widgetIconEl.setAttribute("src", widgetIcon);
  widgetInfoIconEl.setAttribute("src", infoIcon);
  widgetDesc.innerHTML = lodashTemplate(
    description,
    templateOption,
  )({
    ...profile,
    ...quote,
    ...formatQuote,
    listPrice: listPriceRate ? listPrice : "",
  });

  const widgetStatus = getWidgetSwitchStatus(type);
  const newWidgetStatus = sessions ? (sessions?.[type] !== null ? sessions?.[type] : widgetStatus) : widgetStatus;
  widget.querySelector("[data-seel-widget-input]").checked =
  newWidgetStatus !== null ? newWidgetStatus : profile?.checked;

  return widget;
};

export const getComponent = async (type) => {
  const parser = new DOMParser();

  // bucket testing start
  const { bucket, profile, ...rest } = await trafficSplitter({
    shop: store.shop,
    code: "capybara",
  });

  const experimentAsset = await loadExperimentAsset(type, {
    bucket,
    profile,
    ...rest,
    code: "capybara",
  });

  if (experimentAsset) {
    const { cartWidgetTemplate, overrideConfig } = experimentAsset;
    const doc = parser.parseFromString(cartWidgetTemplate, "text/html");
    // override config
    store.configs.widgets = store.configs.widgets.map((_) => {
      if (_.type === type) {
        return {
          ..._,
          ...overrideConfig,
        };
      } else {
        return _;
      }
    });
    const component = flatten(doc.body.firstChild, type);
    return component;
  }
  // bucket testing end
  const doc = parser.parseFromString(widgetTemplate, "text/html");
  const component = flatten(doc.body.firstChild, type);
  return component;
};

let dynamicAnchorObserver = {};
export const embedWidget = async (type) => {
  const { configs, sessions } = snapshot(store);
  const config = configs.widgets.find((_) => _.type === type);
  if (!config) {
    return;
  }
  const widget = await getComponent(type);
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
  if (anchor && document.querySelector(anchor) && widget) {
    document.querySelector(anchor).insertAdjacentElement(position, widget);
    widget.dataset.seelProductType = type;
    bindWidgetEvents(type);
    renderingMarker(type);
  } else if (
    checkoutAnchor &&
    document.querySelector(checkoutAnchor) &&
    widget
  ) {
    document
      .querySelector(checkoutAnchor)
      .insertAdjacentElement(checkoutPosition, widget);
    widget.dataset.seelProductType = type;
    bindWidgetEvents(type);
    renderingMarker(type);
  } else if (dynamicAnchor && widget) {
    const widgetElement = document.querySelector(
      `.seel_widget[data-seel-product-type='${type}']`,
    );
    if (!widgetElement && document.querySelector(dynamicAnchor)) {
      document
        .querySelector(dynamicAnchor)
        .insertAdjacentElement(dynamicPosition || "beforebegin", widget);
      widget.dataset.seelProductType = type;
      bindWidgetEvents(type);
      renderingMarker(type);
    }
    dynamicAnchorObserver?.[type]?.disconnect?.();
    dynamicAnchorObserver[type] = new MutationObserver(() => {
      const widgetElement = document.querySelector(
        `.seel_widget[data-seel-product-type='${type}']`,
      );
      if (!widgetElement && document.querySelector(dynamicAnchor)) {
        document
          .querySelector(dynamicAnchor)
          .insertAdjacentElement(dynamicPosition || "beforebegin", widget);
        widget.dataset.seelProductType = type;
        console.log(`insert dynamicAnchor ${type} widget and bind events`);
        bindWidgetEvents(type);
        renderingMarker(type);
        dynamicAnchorObserver?.[type]?.disconnect?.();
      }
    });
    dynamicAnchorObserver[type].observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }
};

export default embedWidget;
