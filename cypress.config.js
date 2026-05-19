const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://r1036765-realbeans.myshopify.com/",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});