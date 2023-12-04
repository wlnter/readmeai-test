import "./index.css";
import { default as config } from "./override-config.json";
export { default as cartWidgetTemplate } from "./index.html";

// domain specific
const specific = {};
if (window.location.hostname === "goodbuygear.com") {
  specific.name = `Include {{returnWindow}} day return option for any reason`;
}

export const overrideConfig = {
  ...config,
  ...specific,
};
