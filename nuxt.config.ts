import dayjs from 'dayjs'

export default defineNuxtConfig({
	runtimeConfig: {
		public: {
			frontURL: process.env.FRONT_HOST || "==PROD_FRONT_HOST==",
			apiURL: process.env.API_HOST || "==PROD_API_HOST==",
			wsURL: (process.env.WS_HOST  || "==PROD_WS_HOST==") + '/ws',

			authorizerURL: process.env.AUTH_HOST || "==PROD_API_HOST==" + "/authorizer",

			cloackPass: "==PROD_CLOACK_PASS==",
			cloack2fa: "==PROD_CLOACK_2fa==",
			keycloakAccountPage: "==KEYCLOAK_ACCOUNT_PAGE==",

			buildDATE: dayjs().format('HH:mm DD/MM/YYYY')
		}
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
		head: {
			title: 'Finmars',
			viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
			charset: 'utf-8',
			link: [{ rel: 'icon', type: 'image/png', href: process.env.NUXT_APP_BASE_URL + 'img/favicon.png' }]
		},
		pageTransition: { name: 'page', mode: 'out-in' }
	},
	modules: [
    ['@pinia/nuxt'],
		'@nuxt/image-edge'
  ],
	css: [
		"~/assets/scss/main.scss",
		"~/assets/css/material-icons.css",
		"~/assets/scss/pickmeup.scss",
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
