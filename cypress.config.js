const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
		baseUrl: 'http://localhost:3000/v',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
