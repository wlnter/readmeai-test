import {
  convertToCamelCase,
  getFingerprint,
  getSessionId,
  appendQuerys,
  querys,
} from "./util";
import store from "./store";
import { productType } from "./constant";

export const fetchRAEligibility = async (params) => {
  let url = `https://${process.env.API_DOMAIN}/gateway/merchant-service/api/shopify-ra-eligibility`;
  url = appendQuerys(url, params);
  let resp = await fetch(url);
  resp = await resp.text();
  resp = JSON.parse(resp);
  const { ra_eligible } = resp;
  return ra_eligible;
};

export const fetchEWProfile = async (type = productType.ew, shop) => {
  let url = `https://${process.env.API_DOMAIN}/gateway/merchant-service/api/shopify-configs/${shop}`;
  let resp = await fetch(url);
  resp = await resp.json();
  if (resp.code !== 0 || !resp.data) {
    return null;
  }
  const config = resp.data?.configs?.find((_) => {
    return _.type === type;
  });
  if (config) {
    return {
      live: querys?.debug === "1" ? true : config.isLive,
      checked: false,
      // checked: config.defaultOn,
      type,
    };
  } else {
    return null;
  }
};

export const fetchSPProfile = async (type = productType.sp, shop) => {
  let url = `https://${process.env.API_DOMAIN}/gateway/merchant-service/api/query-shopify-bp-config?shopDomain=${shop}`;
  let resp = await fetch(url);
  resp = await resp.text();
  resp = JSON.parse(resp);
  const { status, defaultOpt } = resp?.data || {};
  // status: pending active
  if (!status) {
    return null;
  }

  return {
    live: querys?.debug === "1" ? true : status === "active",
    checked: defaultOpt === "true",
    type,
  };
};

export const fetchProfile = async (type, shop) => {
  let url = `https://${process.env.API_DOMAIN}/gateway/merchant-service/api/cart-configs-v2/${shop}`;
  const isRA = type === productType.ra;
  if (isRA) {
    url = `${url}?type=${type.toUpperCase()}`;
  }
  // 增加debug=1时接口返回live=true，以便测试
  if (querys.debug === "1") {
    url = `${url}${isRA ? "&" : "?"}token=${shop}`;
  }
  let resp = await fetch(url);
  resp = await resp.text();
  resp = JSON.parse(resp);
  const { return_config, meta: _meta } = resp.data || {};

  if (!_meta) {
    return null;
  }

  if (querys?.debug === "1") {
    _meta.live = true;
  }

  const returnConfig = return_config ? convertToCamelCase(return_config) : {};
  const meta = convertToCamelCase(_meta);

  return { ...meta, ...returnConfig, type };
};

export const fetchAllProfiles = async (shop) => {
  const profiles = await Promise.all([
    fetchProfile(productType.ra, shop),
    fetchProfile(productType.bp, shop),
    fetchSPProfile(productType.sp, shop),
    fetchEWProfile(productType.ew, shop),
  ]);

  return profiles.filter(Boolean);
};

export const updateCart = async (_, updates = {}, attributes) => {
  const sections = store.configs?.sections || [];
  const resp = await fetch(`//${window.location.host}/cart/update.js`, {
    headers: { "content-type": "application/json" },
    method: "POST",
    body: JSON.stringify(
      attributes ? { updates, attributes, sections } : { updates, sections },
    ),
  });
  const cart = await resp.json();
  return cart;
};

export const getCart = async (_) => {
  try {
    const resp = await fetch(`//${window.location.host}/cart.js`);
    const cart = await resp.json();
    return cart;
  } catch (e) {
    console.log(e.message);
    return null;
  }
};

export const addCart = async ({ items, attributes }) => {
  try {
    const resp = await fetch(`//${window.location.host}/cart/add.js`, {
      body: JSON.stringify({ items, attributes }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const cart = await resp.json();
    return cart;
  } catch (e) {
    console.log(e.message);
    return null;
  }
};

export const fetchQuote = async (shop, cart, type) => {
  try {
    const device_id = await getFingerprint();
    const pathMapping = {
      bp: "17bp",
      sp: "bp",
      ra: "ra",
    };
    const resp = await fetch(
      `https://${process.env.API_DOMAIN}/gateway/quotes-service/api/${pathMapping[type]}-quotes`,
      {
        headers: {
          "content-type": "application/json",
          "x-request-id": `${device_id}__${Date.now()}`,
        },
        body: JSON.stringify({
          cart_info: cart,
          customer_info: {
            timestamp_in_ms: Date.now(),
            user_id: getSessionId(),
            device_id,
          },
          shop_domain: shop,
        }),
        method: "POST",
      },
    );
    const quote = await resp.json();

    let result = null;
    if (type === productType.ra) {
      const {
        currencyCode,
        currencySymbol,
        quote_id,
        eligible_items,
        ra_price,
        ra_variant_id,
        ra_product_id,
        ra_value,
        status,
      } = quote;
      // TODO
      // remove format operation to redering phase
      result = {
        type,
        currencyCode,
        currencySymbol,
        quoteId: quote_id,
        eligibleItems: eligible_items,
        price: ra_price,
        variantId: ra_variant_id,
        value: ra_value,
        productId: ra_product_id,
        status,
      };
    } else if (
      (type === productType.bp || type === productType.sp) &&
      quote?.data
    ) {
      const {
        currencyCode,
        currencySymbol,
        quote_id,
        eligible_items,
        bp_price,
        bp_variant_id,
        bp_value,
        bp_product_id,
        status,
      } = quote?.data || {};
      result = {
        type,
        currencyCode,
        currencySymbol,
        quoteId: quote_id,
        eligibleItems: eligible_items,
        price: bp_price,
        variantId: bp_variant_id,
        value: bp_value,
        productId: bp_product_id,
        status,
      };
    }

    return result;
  } catch (e) {
    console.log(e.message);
    return null;
  }
};

export const getQuoteResults = async (shop, cart, types) => {
  try {
    const promises = types.map((type) => fetchQuote(shop, cart, type));
    const quotes = await Promise.all(promises);
    return quotes;
  } catch (e) {
    console.log(e.message);
    return null;
  }
};

export const getEWQuoteResult = async (shop, { productId }) => {
  try {
    const device_id = await getFingerprint();
    let resp = await fetch(
      `https://${process.env.API_DOMAIN}/gateway/quotes-service/api/shopify-${productType.ew}-quotes`,
      {
        headers: {
          "content-type": "application/json",
          "x-request-id": `${device_id}__${Date.now()}`,
        },
        body: JSON.stringify({
          productId,
          adminDomain: shop,
        }),
        method: "POST",
      },
    );
    resp = await resp.json();
    if (resp?.code === 0 && resp?.data?.status === "accepted") {
      const { productQuoteResult: data, status, ...rest } = resp.data;
      return {
        type: productType.ew,
        data,
        status,
        ...rest,
      };
    } else {
      throw new Error("quote rejected");
    }
  } catch (e) {
    console.log(e.message);
    return null;
  }
};
