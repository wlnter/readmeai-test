import lodashTemplate from "lodash.template";
import complexTemplate from "./complex.html";
import simpleTemplate from "./simple.html";
import store, { snapshot } from "../../core/store";
import { seelEvents } from "../../core";
import "./index.css";
import { productType } from "../../core/constant";

const templateOption = { interpolate: /\{\{(.+?)\}\}/g };
const complexFlatten = (modal, type) => {
  modal.dataset.seelProductType = type;
  const { profiles, configs, quotes } = snapshot(store);
  const profile = profiles.find((_) => _.type === type);
  const quote = quotes.find((_) => _.type === type);
  const shopDomain = window.location.host;
  const config = configs.modals.find(
    (_) => _.type === type && _.modalType == "complex",
  );

  if (!config) {
    return;
  }

  const { section, linkInText, paragraph, marketing, links } = config;

  let blocks = section.map((item) => {
    if (typeof item.contentText === "string") {
      return `<div class="seel_modal--section--item">
        <div class="seel_modal--section--item--header">${lodashTemplate(
          item.header,
          templateOption,
        )({
          ...profile,
          ...quote,
          shopDomain,
          ...linkInText,
        })}</div>
        <div class="seel_modal--section--item--content">
          <img class="seel_modal--section--item--content_icon" src=${
            item.contentIcon
          } />
          <div class="seel_modal--section--item--content_text">${lodashTemplate(
            item.contentText,
            templateOption,
          )({
            ...profile,
            ...quote,
            shopDomain,
            ...linkInText,
          })}</div>
        </div>
      </div>`;
    }
    if (typeof item.contentText === "object") {
      const list = item.contentText.map(
        (_) =>
          `<div class="seel_modal--section--item--content_list--item"><img class="seel_modal--section--item--content_list--icon" src=${
            item.contentIcon
          } />${lodashTemplate(
            _,
            templateOption,
          )({
            ...profile,
            ...quote,
            shopDomain,
            ...linkInText,
          })}</div>`,
      );
      return `<div class="seel_modal--section--item">
        <div class="seel_modal--section--item--header">${lodashTemplate(
          item.header,
          templateOption,
        )({
          ...profile,
          ...quote,
          shopDomain,
          ...linkInText,
        })}</div>
        <div class="seel_modal--section--item--content_list">
          <div class="seel_modal--section--item--content_list-inner">
          ${list.join("")}
          </div>
        </div>
      </div>`;
    }
    if (typeof item.contentText === "object") {
      const list = item.contentText.map(
        (_) =>
          `<div class="seel_modal--section--item--content_list--item"><img class="seel_modal--section--item--content_list--icon" src=${
            item.contentIcon
          } />${lodashTemplate(
            _,
            templateOption,
          )({
            ...profile,
            ...quote,
            shopDomain,
            ...linkInText,
          })}</div>`,
      );
      return `<div class="seel_modal--section--item">
        <div class="seel_modal--section--item--header">${lodashTemplate(
          item.header,
          templateOption,
        )({
          ...profile,
          ...quote,
          shopDomain,
          ...linkInText,
        })}</div>
        <div class="seel_modal--section--item--content_list">
          ${list.join("")}
        </div>
      </div>`;
    }
    return "";
  });

  const parser = new DOMParser();
  blocks = blocks.map((node) => {
    const parsed = parser.parseFromString(node, "text/html");
    return parsed.body.firstChild;
  });
  modal.querySelector(".seel_modal--section").append(...blocks);

  const parag = paragraph.map((p) => {
    if (typeof p === "string") {
      return `<div class="seel_modal--paragraph">${lodashTemplate(
        p,
        templateOption,
      )({
        ...profile,
        ...quote,
        shopDomain,
        ...linkInText,
      })}</div>`;
    }
    if (typeof p === "object") {
      const list = p.map(
        (li) =>
          `<li>${lodashTemplate(
            li,
            templateOption,
          )({
            ...profile,
            ...quote,
            shopDomain,
            ...linkInText,
          })}</li>`,
      );
      return `<ul>${list.join(" ")}</ul>`;
    }
    if (typeof p === "object") {
      const list = p.map(
        (li) =>
          `<li>${lodashTemplate(
            li,
            templateOption,
          )({
            ...profile,
            ...quote,
            shopDomain,
            ...linkInText,
          })}</li>`,
      );
      return `<ul>${list.join(" ")}</ul>`;
    }
    return "";
  });
  parag.forEach((node) => {
    const parsed = parser.parseFromString(node, "text/html");
    modal.insertAdjacentElement("beforeend", parsed.body.firstChild);
  });

  if (marketing) {
    const marketingEl = document.createElement("div");
    marketingEl.setAttribute("class", "seel_modal--marketing");
    marketingEl.innerHTML = marketing;
    modal.insertAdjacentElement("beforeend", marketingEl);
  }

  if (links?.length) {
    const elements = links.map(
      ({ text, link }) =>
        `<a class="seel_modal--links--link" target="blank" href=${link}>${text}</a>`,
    );
    const parsed = parser.parseFromString(
      `<div class="seel_modal--links">${elements}</div>`,
      "text/html",
    );
    modal.insertAdjacentElement("beforeend", parsed.body.firstChild);
  }

  return modal;
};

const simpleFlatten = (modal, type) => {
  modal.dataset.seelProductType = type;
  const { profiles, configs, quotes } = snapshot(store);
  const profile = profiles.find((_) => _.type === type);
  const quote = quotes.find((_) => _.type === type);
  const shopDomain = window.location.host;
  const config = configs.modals.find(
    (_) => _.type === type && _.modalType == "simple",
  );

  if (!config) {
    return;
  }

  const { linkInText, paragraph, marketing, links } = config;

  const parag = paragraph.map((p) => {
    if (typeof p === "string") {
      return `<div class="seel_modal--paragraph_b">${lodashTemplate(
        p,
        templateOption,
      )({
        shopDomain,
        ...profile,
        ...quote,
        ...linkInText,
      })}</div>`;
    }
    if (typeof p === "object") {
      const list = p.map(
        (li) =>
          `<li class="seel_modal--paragraph_li">${lodashTemplate(
            li,
            templateOption,
          )({
            shopDomain,
            ...profile,
            ...quote,
            ...linkInText,
          })}</li>`,
      );
      return `<ul class="seel_modal--paragraph_ul">${list.join(" ")}</ul>`;
    }
    return "";
  });
  const parser = new DOMParser();
  parag.forEach((node) => {
    const parsed = parser.parseFromString(node, "text/html");
    modal.insertAdjacentElement("beforeend", parsed.body.firstChild);
  });

  if (marketing) {
    const marketingEl = document.createElement("div");
    marketingEl.setAttribute("class", "seel_modal--marketing");
    marketingEl.innerHTML = marketing;
    modal.insertAdjacentElement("beforeend", marketingEl);
  }

  if (links?.length) {
    const elements = links.map(
      ({ text, link }) =>
        `<a class="seel_modal--links--link" target="blank" href=${link}>${text}</a>`,
    );
    const parsed = parser.parseFromString(
      `<div class="seel_modal--links">${elements}</div>`,
      "text/html",
    );
    modal.insertAdjacentElement("beforeend", parsed.body.firstChild);
  }

  return modal;
};

const appendModalMask = () => {
  const mask = document.createElement("div");
  mask.setAttribute("class", "seel_modal_mask seel_modal_hidden");
  document.body.appendChild(mask);
};

const render = (type) => {
  const { profiles } = snapshot(store);
  const profile = profiles.find((_) => _.type === type);
  const { returnToSeel } = profile;

  const parser = new DOMParser();
  const complexDoc = parser.parseFromString(complexTemplate, "text/html");
  const simpleDoc = parser.parseFromString(simpleTemplate, "text/html");
  let doc = complexDoc;
  let flatten = complexFlatten;
  if (type === productType.ra && !returnToSeel) {
    doc = simpleDoc;
    flatten = simpleFlatten;
  }
  const component = flatten(doc.body.firstChild, type);
  document.body.appendChild(component);
  appendModalMask();
  document.addEventListener(seelEvents.showModal, (event) => {
    const { type } = event.detail;
    if (
      document.querySelector(`.seel_modal[data-seel-product-type="${type}"]`)
    ) {
      document
        .querySelector(`.seel_modal[data-seel-product-type="${type}"]`)
        .classList.remove("seel_modal_hidden");
      document
        .querySelector(`.seel_modal_mask`)
        .classList.remove("seel_modal_hidden");
    }
  });
  component.addEventListener("click", (event) => {
    if (event.target.classList.contains("seel_modal--header--close")) {
      component.classList.add("seel_modal_hidden");
      document
        .querySelector(`.seel_modal_mask`)
        .classList.add("seel_modal_hidden");
    }
  });
};

export default render;
