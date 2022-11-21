const curDate = new Date();
const dateString = `${curDate.getHours()}:${curDate.getMinutes()}, ${curDate.getDate()}/${curDate.getMonth() + 1}/${curDate.getFullYear()}`;

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	runtimeConfig: {
		public: {
			appURL: process.env.APP_URL || "==PROD_APP_URL==",
			apiURL: process.env.API_URL || "==PROD_API_URL==",
			authorizerURL: process.env.AUTHORIZER_URL || process.env.API_URL,
			wsURL: process.env.WS_URL || "==PROD_WS_URL==",
			oldAppURL: process.env.OLD_APP_URL || "==PROD_OLD_APP_URL==",
			cloackPass: "==PROD_CLOACK_PASS==",
			cloack2fa: "==PROD_CLOACK_2fa==",
			buildDATE: dateString,
		}
	},
	experimental: {
		payloadExtraction: false
	},
	modules: [
    ['@pinia/nuxt'],
  ],
	imports: {
    dirs: [
      'stores',
      'composables',
      'composables/*/index.{ts,js,mjs,mts}'
    ]
  },
	ssr: false,
	app: {
		baseURL: '/v/'
	},
	css: [
		"~/assets/scss/main.scss",
		"~/assets/css/material-icons.css"
	],
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: '@import "~/assets/scss/variables.scss";',
				},
			},
		},
		define: {
			"process.env.DEBUG": false,
		},
	},

	srcDir: "src"
});
