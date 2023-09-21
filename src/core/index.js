import {
  fetchAllProfiles,
  getQuoteResults,
  getCart,
  updateCart,
  fetchRAEligibility,
} from "./fetch";
import { seelEvents, MERCHANT_PROFILE_KEY, productType } from "./constant";
import { cartDiff, styledLogger } from "./util";
import store, { snapshot } from "./store";
import { setPerformanceObserver } from "./event";

export { seelEvents } from "./constant";
export { updateCart } from "./fetch";
export { bindWidgetEvents } from "./event";
export { styledLogger, querys } from "./util";

window.SEEL_SCRIPT_VERSION = "SEMANTIC_RELEASE_VERSION";

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
  const quoteKeys = Object.values(productType).map(
    (type) => `${type}_quote_id`,
  );
  const attributes = {};
  const updates = {};
  quoteKeys.reduce((acc, cur) => {
    acc[cur] = "";
    return acc;
  }, attributes);

  // 商家未开启保险功能
  if (!store.profiles || !store.profiles.length) {
    updateCart(shop, {}, attributes);
    return null;
  }
  // 购物车为空
  store.cart = await getCart();
  if (!store.cart) return null;

  //购物车为空时不显示widget
  if (!store.cart?.items || store.cart?.items?.length === 0) {
    return;
  }

  const quoteResults = await getQuoteResults(
    shop,
    store.cart,
    store.profiles.map((_) => _.type),
  );
  const deselectSeelProducts =
    quoteResults
      ?.map((_) => {
        if (_ || _.price == 0) {
          return _.productId;
        } else {
          return null;
        }
      })
      ?.filter(Boolean) || [];
  store.quotes = quoteResults?.filter((_) => _ && _.price);
  // remove Seel product when quote fail
  store.cart?.items.forEach((item) => {
    const found = deselectSeelProducts.find((_) => {
      return item.product_id == _;
    });
    if (found) {
      updates[item.variant_id] = 0;
    }
  });

  // SP(GSP)和BP(17BP)互斥
  if (store.quotes?.find((_) => _.type === productType.sp)) {
    store.quotes = store.quotes.filter((_) => _.type !== productType.bp);
  }

  // 无报价
  if (!store.quotes || !store.quotes.length) {
    updateCart(shop, updates, attributes);
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

      if (matched || store?.sessions?.[quote.type] || profile.checked) {
        updates[quote.variantId] = 1;
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
      updates[quote.variantId] = 1;
      store.sessions = store.sessions || {};
      store.sessions[quote.type] = true;
    }
    attributes[`${quote.type}_quote_id`] = quote.quoteId;
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
  setPerformanceObserver();
  const merchantProfiles = await getProfilesUsingCacheFirst(shop);
  store.profiles = merchantProfiles?.filter((_) => _.live);
  await getQuotesAndUpdateCart(shop);
  // Cart Changed
  document.addEventListener(seelEvents.cartChanged, () => {
    getQuotesAndUpdateCart(shop);
  });
  styledLogger(`Script Version: ${window.SEEL_SCRIPT_VERSION}`);
  return store;
};
