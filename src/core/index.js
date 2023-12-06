import {
  fetchAllProfiles,
  getQuoteResults,
  getEWQuoteResult,
  getCart,
  updateCart,
  fetchRAEligibility,
} from "./fetch";
import { seelEvents, MERCHANT_PROFILE_KEY, productType } from "./constant";
import { cartDiff, styledLogger, getProduct } from "./util";
import store, { snapshot } from "./store";
import { setCartObserver, locationHashObserver } from "./event";
import { performanceObserver } from "../pixel/performance";

export { seelEvents } from "./constant";
export { updateCart, addCart } from "./fetch";
export { bindWidgetEvents } from "./event";
export { styledLogger, querys } from "./util";

window.SEEL_SCRIPT_VERSION = process.env.VERSION;

export const getProductEligibility = async (params) => {
  const {
    adminDomain: shop_domain,
    productId: product_id,
    vendor,
    price,
  } = params;
  const res = await fetchRAEligibility({
    shop_domain,
    product_id,
    vendor,
    price,
  });
  return res;
};

const getProfilesUsingCacheFirst = async (shop, type) => {
  let cachedProfiles = localStorage.getItem(MERCHANT_PROFILE_KEY);
  if (cachedProfiles && cachedProfiles !== "undefined") {
    fetchAllProfiles(shop)
      .then((profile) => {
        localStorage.setItem(MERCHANT_PROFILE_KEY, JSON.stringify(profile));
      })
      .catch(console.log);
    cachedProfiles = JSON.parse(cachedProfiles);
    if (type) {
      return cachedProfiles.find((_) => _.type === type);
    }
    return cachedProfiles;
  } else {
    const profiles = await fetchAllProfiles(shop).catch(console.log);
    localStorage.setItem(MERCHANT_PROFILE_KEY, JSON.stringify(profiles));
    if (type) {
      return profiles.find((_) => _.type === type);
    }
    return profiles;
  }
};

export const getQuotesAndUpdateCart = async (shop) => {
  // generate empty quote attributes for each product type
  const quoteKeys = Object.values(productType)
    .filter((type) => type !== productType.ew)
    .map((type) => `${type}_quote_id`);
  const attributes = {};
  const updates = {};
  quoteKeys.reduce((acc, cur) => {
    acc[cur] = "";
    return acc;
  }, attributes);
  updateCart(shop, {}, attributes);

  // 商家未开启任何保险功能
  if (!store.profiles || !store.profiles.length) {
    return null;
  }

  // 购物车为空
  store.cart = await getCart();
  store.product = await getProduct();
  const previousEWQuoteId =
    store?.cart?.attributes?.[`${productType.ew}_quote_id`] || "";

  const quotePromises = [];
  if (store.cart && store.cart?.items && store.cart?.items?.length !== 0) {
    // RA BP SP
    quotePromises.push(
      getQuoteResults(
        shop,
        store.cart,
        store.profiles.map((_) => _.type).filter((_) => _ !== productType.ew),
      ),
    );
  } else {
    quotePromises.push(null);
  }
  if (store.product) {
    const found = store.profiles.find((_) => _.type === productType.ew);
    if (found?.live) {
      quotePromises.push(getEWQuoteResult(shop, store.product, productType.ew));
    }
  } else {
    quotePromises.push(null);
  }
  const [cartQuotes, pdpQuote] = await Promise.all(quotePromises);
  store.quotes = cartQuotes ? cartQuotes.concat([pdpQuote]) : [pdpQuote];
  const declinedQuotes = store.quotes?.filter((_) => _?.status === "declined");
  store.quotes = store.quotes?.filter((_) => _?.status === "accepted");
  // SP(GSP)和BP(17BP)互斥
  if (store.quotes?.find((_) => _.type === productType.sp)) {
    store.quotes = store.quotes.filter((_) => _.type !== productType.bp);
  }

  document.dispatchEvent(new CustomEvent(seelEvents.quoteUpdated));

  // 无报价
  if (!store.quotes || !store.quotes.length) {
    //需要把保险产品移除
    declinedQuotes?.forEach((quote) => {
      const [seelVariantsInCart, matched, notMatched] = cartDiff(
        quote,
        store.cart,
      );

      if (seelVariantsInCart?.length) {
        notMatched?.forEach((_) => {
          updates[_.id] = 0;
        });
      }
      updateCart(shop, updates, attributes);
    });
    return null;
  }

  // convert quote to cart attributes and updates
  store.types = [];

  store.quotes.forEach((quote) => {
    store.types.push(quote.type);
    const [seelVariantsInCart, matched, notMatched] = cartDiff(
      quote,
      store.cart,
    );
    const profile = store.profiles.find((_) => _.type === quote.type);

    if (seelVariantsInCart?.length) {
      notMatched?.forEach((_) => {
        updates[_.id] = 0;
      });

      if (matched || store?.sessions?.[quote.type] || profile?.checked) {
        if (quote?.variantId) {
          updates[quote.variantId] = 1;
        }
        store.sessions = store.sessions || {};
        store.sessions[quote.type] = true;
      }

      Object.entries(updates).forEach(([key]) => {
        if (key === undefined || key === "undefined") {
          delete updates[key];
        }
      });
    } else if (
      store?.sessions?.[quote.type] == null
        ? profile.checked
        : store?.sessions?.[quote.type]
    ) {
      if (quote?.variantId) {
        updates[quote.variantId] = 1;
      }
      store.sessions = store.sessions || {};
      store.sessions[quote.type] = true;
    }

    if (quote.type === productType.ew) {
      attributes[`${quote.type}_quote_id`] = previousEWQuoteId
        ? `${previousEWQuoteId},${quote.quoteId}`
        : quote.quoteId;
    } else {
      attributes[`${quote.type}_quote_id`] = quote.quoteId;
    }
  });

  store.cart = await updateCart(
    null,
    updates,
    Object.keys(attributes).length ? attributes : null,
  );
  styledLogger("Store Snapshot");
  console.log(snapshot(store));
  document.dispatchEvent(
    new CustomEvent(seelEvents.cartUpdated, {
      detail: { updates, attributes },
    }),
  );
  styledLogger("Cart Updated");
  console.log({ updates, attributes });
};

export default async (shop) => {
  setCartObserver();
  performanceObserver(shop);
  locationHashObserver();
  const merchantProfiles = await getProfilesUsingCacheFirst(shop);
  store.profiles = merchantProfiles?.filter((_) => _.live);
  store.shop = shop;
  await getQuotesAndUpdateCart(shop);
  // Cart Changed
  document.addEventListener(seelEvents.cartChanged, () => {
    getQuotesAndUpdateCart(shop);
  });
  styledLogger(`Script Version: ${window.SEEL_SCRIPT_VERSION}`);
  return store;
};
