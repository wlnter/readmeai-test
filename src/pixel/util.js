export const getDomain = () =>
  window?.Shopify?.shop ||
  window?.Shopify?.Checkout?.apiHost ||
  window.location.hostname;
const pagePath = window.location.pathname;
export const isProductPage = () =>
  pagePath.indexOf("/products/") > -1 ? true : false;
export const isCartPage = () => (pagePath.indexOf("/cart") > -1 ? true : false);
export const isCheckoutPage = () =>
  pagePath.indexOf("/checkouts") > -1 ? true : false;

export const dataReport = async (name, data) => {
  const currentTime = Date.now();
  const body = {
    platform: "shopify",
    code: "purchase-path",
    eventInfo: JSON.stringify({
      eventData: { url: window.location.href, ...(data || {}) },
      eventName: name,
      event_ts: currentTime,
      eventTime: currentTime,
      shop_domain: getDomain(),
      did: localStorage.getItem("seel-user-id") || "",
    }),
  };
  fetch(`https://api.seel.com/gateway/tracking-service/api/tracking-event`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    keepalive: true,
  }).catch((e) => {
    console.log(e.message);
  });
};

export const sendBeacon = (code, platform, eventInfo) => {
  if (!navigator?.sendBeacon) {
    return null;
  }
  navigator.sendBeacon(
    `https://${process.env.API_DOMAIN}/gateway/tracking-service/api/tracking-event`,
    new Blob(
      [
        JSON.stringify({
          code,
          platform,
          eventInfo,
        }),
      ],
      {
        type: "application/json",
      },
    ),
  );
};
