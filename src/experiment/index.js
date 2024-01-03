import { querys } from "../core/util";
import { EXPERIMENT_PROFILE_KEY } from "../core/constant";

export const report = async ({ code, bucket }) => {
  if (!code || !bucket) {
    return;
  }
  fetch(`//${window.location.host}/cart/update.js`, {
    headers: { "content-type": "application/json" },
    method: "POST",
    body: JSON.stringify({
      attributes: {
        exp: `${code.substr(0, 2)}_${bucket}`,
      },
    }),
  });
};

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
        report({ code, bucket: exp.bucket });
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
      report({ code, bucket: buckets[index] });
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
  console.log("***", profile, type);
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
    if (code === "raccoon" || code === "meerkat") {
      const { cartWidgetTemplate, overrideConfig } = await import(
        /* webpackChunkName: "experiment/component/[request]" */
        `./component/cart-widget-${bucket}/`
      );
      return { cartWidgetTemplate, overrideConfig };
    } else {
      return null;
    }
  } catch (e) {
    console.log(e.message);
    return null;
  }
};
