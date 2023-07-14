import lodashTemplate from 'lodash.template';
import widgetTemplate from './index.html';
import './index.css';

const templateOption = { interpolate: /\{\{(.+?)\}\}/g };

const flatten = (widget, config, { merchantConfig, quote }) => {
  const {
    description, name, icon, listPriceRate,
  } = config;
  const { value, price, currencySymbol } = quote;
  const listPrice = (value * listPriceRate).toFixed(2) > price ? `${currencySymbol}${(value * 0.3).toFixed(2)}` : '';

  const widgetName = widget.querySelector('.seel_widget--title_line--name');
  const widgetIcon = widget.querySelector('.seel_widget--desc_icon');
  const widgetDesc = widget.querySelector('.seel_widget--desc--text');
  widgetName.innerHTML = name.toUpperCase();
  widgetIcon.setAttribute('src', icon);
  widgetDesc.innerHTML = lodashTemplate(description, templateOption)({ ...merchantConfig, ...quote, listPrice: listPriceRate ? listPrice : '' });
  if (merchantConfig.checked) {
    widget.querySelector('.seel_widget--title_line--checkbox').setAttribute('checked', true);
  }
  return widget;
};

const getWidgetComponent = ({ merchantConfig, quote }, config) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(widgetTemplate, 'text/html');
  const component = flatten(doc.body.firstChild, config.widget, { merchantConfig, quote });
  return component;
};

export default getWidgetComponent;
