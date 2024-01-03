import "./index.css";
import { default as config } from "./override-config.json";
export { default as cartWidgetTemplate } from "./index.html";

// domain specific
const specific = {};
if (window.location.hostname === "goodbuygear.com") {
  specific.name = `Make it returnable&trade; for {{currencySymbol}}{{price}}`;
}

export const overrideConfig = {
  ...config,
  ...specific,
};
