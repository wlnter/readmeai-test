import {
  convertToCamelCase,
  getFingerprint,
  getSessionId,
  appendQuerys,
  querys,
} from "./util";
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
  if (type === productType.ra) {
    url = `${url}?type=${type.toUpperCase()}`;
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
  ]);

  return profiles.filter(Boolean);
};

export const updateCart = async (_, updates = {}, attributes) => {
  const resp = await fetch(`//${window.location.host}/cart/update.js`, {
    headers: { "content-type": "application/json" },
    method: "POST",
    body: JSON.stringify(attributes ? { updates, attributes } : { updates }),
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
    console.log(e);
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
      } = quote.data;
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
    console.log("getQuoteResults",e.message);
    return null;
  }
};
