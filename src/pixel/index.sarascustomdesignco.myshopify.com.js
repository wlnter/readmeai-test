import { isProductPage, isCartPage, dataReport } from "./util";

if (isProductPage()) {
  // product page
  document.addEventListener("click", (ev) => {
    const element = ev.target;
    if (element.classList.contains("sp-validate-overlay")) {
      console.log("product:atc");
      dataReport("product:atc");
    }

    if (element.classList.contains("shopify-payment-button")) {
      console.log("product:express");
      dataReport("product:express");
    }

    if (element.classList.contains("header__icon--cart")) {
      console.log("product:cart_icon:click");
      dataReport("product:cart_icon:click");
    }

    if (element.hasAttribute("id", "cart-notification-button")) {
      console.log("product:cart_notification:view_cart");
      dataReport("product:cart_notification:view_cart");
    }

    if (element.innerText === "Check out") {
      console.log("product:cart_notification:checkout");
      dataReport("product:cart_notification:checkout");
    }
  });

  const bannerIcon = document.querySelector(
    ".seel--product_tip--info-icon > img",
  );
  if (bannerIcon) {
    bannerIcon.addEventListener("pointerenter", (ev) => {
      const display = window.getComputedStyle(
        document.querySelector(".seel--product_tip--tooltip"),
        null,
      ).display;
      if (display === "block") {
        console.log("product:banner:show_tip");
        dataReport("product:banner:show_tip");
      }
    });
  }
}

// cart page
if (isCartPage()) {
  document.addEventListener("click", (ev) => {
    const element = ev.target;
    if (element.innerText === "CHECK OUT") {
      console.log("cart:checkout");
      dataReport("cart:checkout");
    }
  });
  const expressPayments = document.querySelector(
    ".cart__dynamic-checkout-buttons.additional-checkout-buttons",
  );
  if (expressPayments) {
    expressPayments.addEventListener("click", (ev) => {
      console.log("cart:express");
      dataReport("cart:express");
    });
  }
}
