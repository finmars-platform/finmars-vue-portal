import dayjs from 'dayjs'
import commonjs from 'vite-plugin-commonjs'

export default defineNuxtConfig({
	runtimeConfig: {
		public: {
			frontURL: process.env.FRONT_HOST || "==PROD_FRONT_HOST==",
			apiURL: process.env.API_HOST || "==PROD_API_HOST==",
			// wsURL: (process.env.WS_HOST  || "==PROD_WS_HOST==") + '/ws',

			authorizerURL: process.env.AUTH_HOST || "==PROD_API_HOST==" + "/authorizer",

			KEYCLOAK_URL: process.env.KEYCLOAK_URL || "==PROD_KEYCLOAK_URL==",
			KEYCLOAK_REALM: process.env.KEYCLOAK_REALM || "==PROD_KEYCLOAK_REALM==",
			KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID || "==PROD_KEYCLOAK_CLIENT_ID==",

			buildDATE: dayjs().format('HH:mm DD/MM/YYYY')
		}
	},
	ssr: false,
	imports: {
		dirs: [
			'stores',
			'composables/evRv/*.js'
		]
	},
	app: {
		head: {
			title: 'Finmars',
			viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
			charset: 'utf-8',
			link: [{rel: 'icon', type: 'image/png', href: 'img/favicon.png'}]
		},
		pageTransition: {name: 'page', mode: 'out-in'}
	},
	modules: [
		'@pinia/nuxt',
		'@nuxt/test-utils/module',
	],
	pinia: {
		/* Options for @pinia/nuxt */
	},
	css: [
		"~/assets/scss/main.scss",
		"~/assets/css/material-icons.css",
		"~/assets/scss/pickmeup.scss",
		"~/assets/scss/base-theme.scss",
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
		plugins: [commonjs()]
	},
	srcDir: "src",
	hooks: {
		'pages:extend': (pages) => {


			pages.forEach((page) => {
				if (page.path.startsWith('/profile')) {
					page.path = '/v' + page.path
				} else {
					page.path = '/:realm_code/:space_code/v' + page.path
				}
			})

		},
	}
});
