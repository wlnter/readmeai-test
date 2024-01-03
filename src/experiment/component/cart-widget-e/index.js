import "./index.css";
import { default as config } from "./override-config.json";

export { default as cartWidgetTemplate } from "./index.html";

export const overrideConfig = {
  ...config,
};
