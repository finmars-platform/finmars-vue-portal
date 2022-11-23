import dayjs from 'dayjs'

export default defineNuxtConfig({
	runtimeConfig: {
		public: {
			frontURL: process.env.FRONT_HOST || "==PROD_FRONT_HOST==",
			apiURL: process.env.API_HOST || "==PROD_API_HOST==",
			wsURL: (process.env.WS_HOST  || "==PROD_WS_HOST==") + '/ws',

			oldAppURL: process.env.API_HOST + '/a/#!' || "==PROD_API_HOST==/a/#!",
			authorizerURL: process.env.AUTH_HOST || process.env.API_HOST || "==PROD_API_HOST==",

			cloackPass: "==PROD_CLOACK_PASS==",
			cloack2fa: "==PROD_CLOACK_2fa==",

			buildDATE: dayjs().format('HH:mm DD/MM/YYYY')
		}
	},
	alias: {
		'img': `~/img`
	},
	ssr: false,
	imports: {
		dirs: [
			'stores',
			'composables',
			'composables/*/index.{ts,js,mjs,mts}'
		]
	},
	app: {
		pageTransition: { name: 'page', mode: 'out-in' }
	},
	modules: [
    ['@pinia/nuxt'],
  ],
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
