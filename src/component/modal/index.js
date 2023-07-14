import lodashTemplate from 'lodash.template';
import returnToSeelTemplate from './return-to-seel.html';
import returnToMerchantTemplate from './return-to-merchant.html';
import './index.css';

const templateOption = { interpolate: /\{\{(.+?)\}\}/g };

const returnToSeelFlatten = (modal, config, { merchantConfig, quote, shopDomain }) => {
  const { section, link, paragraph } = config.returnToSeel;
  let blocks = section.map((item) => {
    if (typeof item.contentText === 'string') {
      return `<div class="seel_modal--section--item">
        <div class="seel_modal--section--item--header">${lodashTemplate(item.header, templateOption)({
    ...merchantConfig, ...quote, shopDomain, ...link,
  })}</div>
        <div class="seel_modal--section--item--content">
          <img class="seel_modal--section--item--content_icon" src=${item.contentIcon} />
          <div class="seel_modal--section--item--content_text">${lodashTemplate(item.contentText, templateOption)({
    ...merchantConfig, ...quote, shopDomain, ...link,
  })}</div>
        </div>
      </div>`;
    } if (typeof item.contentText === 'object') {
      const list = item.contentText.map((_) => `<div class="seel_modal--section--item--content_list--item"><img class="seel_modal--section--item--content_list--icon" src=${item.contentIcon} />${lodashTemplate(_, templateOption)({
        ...merchantConfig, ...quote, shopDomain, ...link,
      })}</div>`);
      return `<div class="seel_modal--section--item">
        <div class="seel_modal--section--item--header">${lodashTemplate(item.header, templateOption)({
    ...merchantConfig, ...quote, shopDomain, ...link,
  })}</div>
        <div class="seel_modal--section--item--content_list">
          ${list.join('')}
        </div>
      </div>`;
    }
    return '';
  });

  const parser = new DOMParser();
  blocks = blocks.map((node) => {
    const parsed = parser.parseFromString(node, 'text/html');
    return parsed.body.firstChild;
  });
  modal.querySelector('.seel_modal--section').append(...blocks);

  const parag = paragraph.map((p) => {
    if (typeof p === 'string') {
      return `<div class="seel_modal--paragraph">${lodashTemplate(p, templateOption)({
        ...merchantConfig, ...quote, shopDomain, ...link,
      })}</div>`;
    } if (typeof p === 'object') {
      const list = p.map((li) => `<li>${lodashTemplate(li, templateOption)({
        ...merchantConfig, ...quote, shopDomain, ...link,
      })}</li>`);
      return `<ul>${list.join(' ')}</ul>`;
    }
    return '';
  });
  parag.forEach((node) => {
    const parsed = parser.parseFromString(node, 'text/html');
    modal.insertAdjacentElement('beforeend', parsed.body.firstChild);
  });

  return modal;
};

const returnToMerchantFlatten = (modal, config, { merchantConfig, quote, shopDomain }) => {
  const { link, paragraph } = config.returnToMerchant;

  const parag = paragraph.map((p) => {
    if (typeof p === 'string') {
      return `<div class="seel_modal--paragraph_b">${lodashTemplate(p, templateOption)({
        shopDomain, ...merchantConfig, ...quote, ...link,
      })}</div>`;
    } if (typeof p === 'object') {
      const list = p.map((li) => `<li class="seel_modal--paragraph_li">${lodashTemplate(li, templateOption)({
        shopDomain, ...merchantConfig, ...quote, ...link,
      })}</li>`);
      return `<ul class="seel_modal--paragraph_ul">${list.join(' ')}</ul>`;
    }
    return '';
  });
  const parser = new DOMParser();
  parag.forEach((node) => {
    const parsed = parser.parseFromString(node, 'text/html');
    modal.insertAdjacentElement('beforeend', parsed.body.firstChild);
  });

  return modal;
};

const getModalComponent = ({ merchantConfig, quote }, config) => {
  const parser = new DOMParser();
  const returnToSeelDoc = parser.parseFromString(returnToSeelTemplate, 'text/html');
  const returnToMerchantDoc = parser.parseFromString(returnToMerchantTemplate, 'text/html');
  const { returnToSeel } = merchantConfig;
  const doc = returnToSeel ? returnToSeelDoc : returnToMerchantDoc;
  const flatten = returnToSeel ? returnToSeelFlatten : returnToMerchantFlatten;
  const component = flatten(
    doc.body.firstChild,
    config.modal,
    { merchantConfig, quote, shopDomain: window.location.host },
  );
  return component;
};

export default getModalComponent;
