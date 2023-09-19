import defaultBanner from "./default-banner.html";
import plainBanner from "./plain-banner.html";
import store, { snapshot } from "../../core/store";
import { getProductEligibility } from "../../core";

import "./index.css";

const flatten = (banner, bannerType, type) => {
  const { configs } = snapshot(store);
  const config = configs.banners.find((_) => _.type === type);
  const { infoIcon, bannerIcon, bannerLogo, bannerDesc, bannerTip } = config;

  if (bannerType === "plain") {
    const bannerIconEl = banner.querySelector(".seel--product_tip--icon");
    const bannerDescEl = banner.querySelector(".seel-pdp-banner-text");
    bannerIconEl.setAttribute("src", bannerIcon);
    bannerDescEl.innerHTML = bannerDesc;
  } else {
    const infoIconEL = banner.querySelector(
      ".seel--product_tip--info-icon img",
    );
    const bannerLogoEl = banner.querySelector(".seel--product_tip--logo");
    const bannerTipEl = banner.querySelector(".seel--product_tip--tooltip");
    const bannerDescEl = banner.querySelector(".seel--product_tip--text");
    bannerDescEl.innerHTML = bannerDesc;
    infoIconEL.setAttribute("src", infoIcon);
    bannerLogoEl.setAttribute("src", bannerLogo);
    bannerTipEl.innerHTML = bannerTip;
  }
  return banner;
};

const getPdpBanner = (bannerType, type) => {
  const parser = new DOMParser();
  let pdpBanner = parser.parseFromString(defaultBanner, "text/html");
  if (bannerType && bannerType === "plain") {
    pdpBanner = parser.parseFromString(plainBanner, "text/html");
  }
  const component = flatten(pdpBanner.body.firstChild, bannerType, type);
  return component;
};

const renderPdpBanner = async (type, shop) => {
  const seelProductTipRoot = document.createElement("div");
  seelProductTipRoot.setAttribute("class", "seel--product_tip_root");
  const { configs } = snapshot(store);
  const config = configs.banners.find((_) => _.type === type);
  if (!config) {
    return;
  }

  const { bannerType, anchor, position } = config;
  const pdpBanner = getPdpBanner(bannerType, type);
  const pdpBannerAnchorEl = document.querySelector(anchor);
  if (anchor && pdpBannerAnchorEl) {
    let eligibility = false;
    const { product } = window?.meta || {};
    if (product) {
      const { vendor, id, variants = [] } = product || {};
      const params = {
        adminDomain: shop,
        shopDomain: window?.location?.hostname,
        productId: id,
        vendor,
        price: variants[0]?.price,
      };
      eligibility = await getProductEligibility(params);
    }
    if (eligibility) {
      pdpBannerAnchorEl.insertAdjacentElement(position, pdpBanner);
    }
  }
};
export default renderPdpBanner;
