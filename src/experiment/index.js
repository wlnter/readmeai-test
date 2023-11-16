import { querys } from "../core/util";
import { EXPERIMENT_PROFILE_KEY } from "../core/constant";

export const trafficSplitter = async ({ shop, code }) => {
  let urlBucket = null;
  if (querys.code === code) {
    urlBucket = querys.bucket;
  }
  if (localStorage.getItem(EXPERIMENT_PROFILE_KEY)) {
    const raw = localStorage.getItem(EXPERIMENT_PROFILE_KEY);
    const data = JSON.parse(raw);
    const exp = data[code];
    if (exp) {
      if (Date.now() - exp.timestamp > 86400000) {
        delete data[code];
        localStorage.setItem(EXPERIMENT_PROFILE_KEY, JSON.stringify(data));
      } else {
        return urlBucket ? { ...exp, bucket: urlBucket } : exp;
      }
    }
  }
  try {
    const resp = await fetch(
      `https://${process.env.ASSET_DOMAIN}/shopify/experiment/bucket/${code}.json`,
      {
        method: "GET",
      },
    );
    const data = await resp.json();

    const found = data.scope.find((_) => _.domain === shop);
    if (found) {
      const { buckets, shop, domain, profile, ...rest } = found;
      const now = Date.now();
      const index = now % buckets.length;
      const raw = localStorage.getItem(EXPERIMENT_PROFILE_KEY);
      const data = JSON.parse(raw) || {};
      localStorage.setItem(
        EXPERIMENT_PROFILE_KEY,
        JSON.stringify({
          ...data,
          [code]: {
            bucket: buckets[index],
            profile,
            ...rest,
            timestamp: Date.now(),
          },
        }),
      );
      return {
        bucket: urlBucket || buckets[index],
        profile,
        ...rest,
      };
    } else {
      return { bucket: null };
    }
  } catch (e) {
    return { bucket: null };
  }
};

export const loadExperimentAsset = async (type, { bucket, profile, code }) => {
  if (
    !type ||
    !code ||
    !bucket ||
    bucket === "a" ||
    profile?.productType?.indexOf(type) == -1
  ) {
    return null;
  }
  try {
    if (code === "meerkat") {
      const { cartWidgetTemplate, overrideConfig } = await import(
        /* webpackChunkName: 'cart-widget-experiment' */
        `./component/cart-widget-${bucket}/index.js`
      );
      return { cartWidgetTemplate, overrideConfig };
    }
  } catch (e) {
    console.log(e.message);
    return null;
  }
};
