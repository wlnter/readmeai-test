---
to: src/config/<%= shop %>.myshopify.com.json
---
{
  "pdpWidgets": [
    {
      "type": "ew",
      "name": "Add product protection",
      "description": "Protect your purchase beyond manufacturer’s warranty.",
      "linkHref": "https://www.seel.com/faq/product-protection-plan-customer",
      "linkText": "Learn more",
      "logo": "https://cdn.seel.com/assets/images/ew-powerby-logo.svg",
      "anchor": ".product-form__buttons",
      "position": "afterend"
    }
  ],
  "widgets": [
    {
      "type": "ra",
      "name": "ADD RETURN ASSURANCE",
      "infoIcon": "https://static.seel.com/image/widget-info-icon.svg",
      "infoIconLink": "",
      "description": "You have item(s) worth {{currencySymbol}}{{value}} in your cart that are final sale. For <del>{{listPrice}}</del> {{currencySymbol}}{{price}}, you can add an option within {{returnWindow}} days to return these item(s) if they don’t work out for any reason.",
      "widgetIcon": "https://static.seel.com/image/ra-widget-icon.svg",
      "anchor": ".cart__ctas",
      "position": "beforebegin",
      "dynamicAnchor": "",
      "dynamicPosition": "beforebegin",
      "checkoutAnchor": ".order-summary__section.order-summary__section--total-lines",
      "checkoutPosition": "beforebegin",
      "listPriceRate": 0
    },
    {
      "type": "bp",
      "name": "ADD GREEN SHIPPING PROTECTION",
      "infoIcon": "https://static.seel.com/image/widget-info-icon.svg",
      "infoIconLink": "https://www.seel.com/terms/17trackbuyerprotection",
      "description": "Protect against loss, damage, delay & offset emissions for <strong>{{currencySymbol}}{{price}} {{currencyCode}}</strong>",
      "widgetIcon": "https://static.seel.com/image/bp-widget-icon.svg",
      "anchor": ".cart__ctas",
      "position": "beforebegin",
      "dynamicAnchor": ".rebuy-cart__flyout-actions",
      "dynamicPosition": "beforebegin",
      "checkoutAnchor": "",
      "checkoutPosition": "beforebegin",
      "listPriceRate": 0
    },
    {
      "type": "sp",
      "name": "ADD GREEN SHIPPING PROTECTION",
      "infoIcon": "https://static.seel.com/image/widget-info-icon.svg",
      "infoIconLink": "https://www.seel.com/terms/learn-more-about-seel-shipping-protection",
      "description": "Protect against loss, damage, delay & offset emissions for <strong>{{currencySymbol}}{{price}} {{currencyCode}}</strong>",
      "widgetIcon": "https://static.seel.com/image/sp-widget-icon.svg",
      "anchor": ".cart__ctas",
      "position": "beforebegin",
      "dynamicAnchor": "",
      "dynamicPosition": "beforebegin",
      "checkoutAnchor": "",
      "checkoutPosition": "",
      "listPriceRate": 0
    }
  ],
  "modals": [
    {
      "type": "ra",
      "modalType": "complex",
      "section": [
        {
          "header": "Return for any reason",
          "contentIcon": "https://cdn.seel.com/assets/images/modal-section-icon-1.svg",
          "contentText": [
            "Item doesn’t fit",
            "No longer needed",
            "Dissatisfied with items",
            "Arrived too late"
          ]
        },
        {
          "header": "{{returnWindow}}-day return window",
          "contentIcon": "https://cdn.seel.com/assets/images/modal-section-icon-2.svg",
          "contentText": "Return in {{returnWindow}} days. Shop with confidence."
        },
        {
          "header": "Easy resolution",
          "contentIcon": "https://cdn.seel.com/assets/images/modal-section-icon-3.svg",
          "contentText": "Resolve your return request and get refunded with a few clicks."
        }
      ],
      "paragraph": [
        "Return Assurance gives you a {{returnWindow}}-day return window on otherwise final sale (non-refundable) items. If you’re unhappy with the purchase for any reason, Seel will buy it back from you for 100% of the purchase price you paid. You can use the <a href={{link}} target=\"_blank\">{{text}}</a> to effortlessly make the return. In the event your entire order is cancelled by the seller or all items in your order are successfully disputed, the Return Assurance fee will be refunded to you. However, the fee will not be refunded for partial cancellations or partial disputes.",
        "Please note that shipping fees are not covered by Return Assurance. The original shipping fee will not be returned and a {{currencySymbol}}{{returnShippingFee}} return shipping fee will be deducted from your final refund.",
        "* Your order may be ineligible for Return Assurance if the order value exceeds our price cap or you are shipping to an address outside of the United States."
      ],
      "marketing": "Over 1,000 customers have purchased Return Assurance for peace of mind in the last 30 days. Join them and shop worry-free.",
      "linkInText": {
        "text": "Seel Resolution Center",
        "link": "https://resolve.seel.com/"
      },
      "links": [
        {
          "text": "Learn more >",
          "link": "https://www.seel.com/customer-testimonials"
        }
      ]
    },
    {
      "type": "ra",
      "modalType": "simple",
      "paragraph": [
        "Opting in Seel Return Assurance at checkout allows you to return previously non-returnable items.",
        "Please check out the Return Policy with Seel Return Assurance below:",
        [
          "Return Assurance is only available to US domestic orders.",
          "Items covered by Seel Return Assurance can be returned for a full refund within {{returnWindow}} days of receipt of shipment.",
          "The returned item(s) must be new, unworn, unwashed, in the same condition in which you received them, and in the original packaging with tags attached.",
          "To initiate a return, please follow the instructions provided on {{shopDomain}}’s Return Policy page.",
          "Unless your order is canceled, Seel Return Assurance fee is not refundable."
        ],
        "For more information, you can read our <a href={{link}} target=\"_blank\">{{text}}</a>. If you have further questions, you can also contact returns@seel.com."
      ],
      "marketing": "Over 1,000 customers have purchased Return Assurance for peace of mind in the last 30 days. Join them and shop worry-free.",
      "linkInText": {
        "text": "Terms of Service",
        "link": "https://www.seel.com/terms/customer-terms-of-service"
      },
      "links": [
        {
          "text": "Learn more >",
          "link": "https://www.seel.com/customer-testimonials"
        }
      ]
    },
    {
      "type": "sp",
      "modalType": "complex",
      "section": [
        {
          "header": "1-click protect against",
          "contentIcon": "https://cdn.seel.com/assets/images/modal-section-icon-1.svg",
          "contentText": ["Loss", "Damage", "Delay"]
        },
        {
          "header": "Instant resolution",
          "contentIcon": "https://cdn.seel.com/assets/images/modal-section-icon-3.svg",
          "contentText": "Instantly resolve your shipment issues and get a refund or replacement with a few clicks."
        },
        {
          "header": "Protect our planet",
          "contentIcon": "https://cdn.seel.com/assets/images/modal-section-icon-4.svg",
          "contentText": "Part of your Green Shipping Protection fee will fund green projects to offset emissions from shipping."
        }
      ],
      "paragraph": [
        "Green Shipping Protection offers peace of mind against package loss, damage, and delay, while offsetting carbon emissions from shipping for a greener planet. Should any covered incidents occur, use the <a href={{link}} target=\"_blank\">{{text}}</a> to resolve your package issue and get a compensation up to the full value of your order!"
      ],
      "linkInText": {
        "text": "Seel Resolution Center",
        "link": "https://resolve.seel.com/"
      },
      "links": []
    }
  ],
  "banners": [
    {
      "type": "ra",
      "bannerType": "default",
      "infoIcon": "https://cdn.seel.com/assets/images/buyer-protection/info_icon.svg",
      "bannerIcon": "",
      "bannerLogo": "https://cdn.seel.com/assets/images/logo/seel_logo.svg",
      "bannerDesc": "Return Option Available with",
      "bannerTip": "You can add the option to return this item for a refund back to your original payment method. Proceed to the cart for more details.",
      "anchor": ".product-form__buttons",
      "position": "beforebegin"
    }
  ],
  "sections": ["template--21173089665323__cart-items"]
}



