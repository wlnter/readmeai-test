import FingerprintJS from "@fingerprintjs/fingerprintjs";
import camelCase from "lodash.camelcase";
import { v4 as uuidv4 } from "uuid";
import { SEEL_SESSION_ID_KEY, SEEL_USER_ID_KEY } from "./constant";

// reference: https://fingerprint.com/github/
const fpPromise = FingerprintJS.load();
let cachedUserId = localStorage.getItem(SEEL_USER_ID_KEY);
// Get the visitor identifier when you need it.
export const getFingerprint = async () => {
  if (cachedUserId) {
    return Promise.resolve(cachedUserId);
  }
  return new Promise((resolve, reject) => {
    fpPromise
      .then((fp) => fp.get())
      .then((result) => {
        cachedUserId = result.visitorId;
        localStorage.setItem(SEEL_USER_ID_KEY, result.visitorId);
        resolve(result.visitorId);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const cartDiff = (quote, cart) => {
  // const seelTags = ["Kover", "Seel"];
  // eslint-disable-next-line no-unused-vars
  const { productId, variantId } = quote;
  const seelVariantsInCart = cart?.items?.filter(
    (item) => item.product_id === productId,
  );
  // const seelVariantsInCart = cart?.items?.filter(
  //   (item) => seelTags.indexOf(item.vendor) > -1
  // );
  const matched = seelVariantsInCart?.find((item) => item.id === variantId);
  const notMatched = seelVariantsInCart?.filter(
    (item) => item.id !== variantId,
  );
  return [seelVariantsInCart, matched, notMatched];
};

export const getSessionId = () => {
  const value = sessionStorage.getItem(SEEL_SESSION_ID_KEY);
  if (value) {
    return value;
  }
  const generated = uuidv4();
  sessionStorage.setItem(SEEL_SESSION_ID_KEY, generated);
  return generated;
};

export const convertToCamelCase = (target) => {
  if (!target) {
    return target;
  }
  const ret = {};
  Object.entries(target).forEach(([key, value]) => {
    ret[camelCase(key)] = value;
  });
  return ret;
};

export const dataReport = async (
  eventName,
  eventData,
  code,
  platform = "shopify",
) => {
  const currentTime = Date.now();
  const shop_domain = window.location.host;
  const did = await getFingerprint();
  const body = {
    code,
    eventInfo: JSON.stringify({
      eventData,
      eventName,
      event_ts: currentTime,
      eventTime: currentTime,
      shop_domain,
      did,
    }),
    platform,
  };
  fetch(
    `https://${process.env.API_DOMAIN}/gateway/tracking-service/api/tracking-event`,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
    },
  ).catch((e) => {
    console.log(e.message);
  });
};

export const appendQuerys = (_url, queryObject) => {
  const url = new URL(_url);
  const { search, origin, pathname } = url;
  const params = new URLSearchParams(search);

  for (const prop in queryObject) {
    params.append(prop, queryObject[prop]);
  }

  return `${origin}${pathname}?${params.toString()}`;
};

export const styledLogger = (string) => {
  console.log(
    `%c ${string}`,
    "color:white; font-size:12px; background-color: #645AFF;border-radius: 4px; padding: 6px",
  );
};

export const querys = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

export const formatMoney = (num) => {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(num);
};