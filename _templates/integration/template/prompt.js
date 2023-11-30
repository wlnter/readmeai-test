// prompt.js
module.exports = [
  {
    type: "input",
    name: "shop",
    message: "name of online store (<name>.myshopify.com)",
  },
  {
    type: "select",
    name: "integrationPoint",
    message: "integration point",
    choices: ["cart", "checkout"],
  },
];
