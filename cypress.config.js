const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
		baseUrl: 'http://localhost:3000',
    experimentalSessionAndOrigin: true
  },
	env: {
		apiUrl: 'https://dev.finmars.com/api/v1',
		loginUrl: 'https://dev.finmars.com/login',
		username: 'dev_apriakhin',
		password: '02nxmv8ow4lb0tfm'
	}
});
