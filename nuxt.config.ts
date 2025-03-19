import dayjs from 'dayjs';
import commonjs from 'vite-plugin-commonjs';

export default defineNuxtConfig({
	compatibilityDate: '2024-09-04',
	devtools: { enabled: true },
	runtimeConfig: {
		public: {
			frontURL: process.env.FRONT_HOST || '==PROD_FRONT_HOST==',
			apiURL: process.env.API_HOST || '==PROD_API_HOST==',
			// wsURL: (process.env.WS_HOST  || "==PROD_WS_HOST==") + '/ws',

			authorizerURL:
				process.env.AUTH_HOST || '==PROD_API_HOST==' + '/authorizer',

			KEYCLOAK_URL: process.env.KEYCLOAK_URL || '==PROD_KEYCLOAK_URL==',
			KEYCLOAK_REALM:
				process.env.KEYCLOAK_REALM || '==PROD_KEYCLOAK_REALM==',
			KEYCLOAK_CLIENT_ID:
				process.env.KEYCLOAK_CLIENT_ID || '==PROD_KEYCLOAK_CLIENT_ID==',

			buildDATE: dayjs().format('HH:mm DD/MM/YYYY')
		}
	},
	ssr: false,
	imports: {
		dirs: ['stores', 'composables/evRv/*.js']
	},
	app: {
		head: {
			title: 'Finmars | Financial Management Revolution System',
			viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
			charset: 'utf-8',
			link: [{ rel: 'icon', type: 'image/png', href: '/img/favicon/favicon-new-64x64.png' }]
		},
		pageTransition: { name: 'page', mode: 'out-in' }
	},
	modules: [
		'@pinia/nuxt',
		'@nuxtjs/tailwindcss',
		'@nuxt/test-utils/module',
		'floating-vue/nuxt'
	],
	pinia: {
		/* Options for @pinia/nuxt */
	},
	css: [
		'@finmars/ui/dist/finmars-ui.css',
		'@finmars/ui/dist/themes.css',
		'~/assets/scss/variables.scss',
		'~/assets/scss/main.scss',
		'~/assets/css/material-icons.css',
		'~/assets/scss/pickmeup.scss'
	],
	postcss: {
		plugins: {
			'postcss-mixins': {}
		}
	},
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					api: 'modern-compiler'
				}
			}
		},
		define: {
			'process.env.DEBUG': false
		},
		plugins: [commonjs()]
	},
	srcDir: 'src',
	hooks: {
		'pages:extend': (pages) => {
			const pagesToRemove: string[] = [];

			pages.forEach((page, index) => {
				// do not create pages for components whose names start with "_"
				if (page.path.search(/\/_./) > -1) {
					pagesToRemove.push(page.path);
					return;
				}

				if (page.path.startsWith('/profile')) {
					page.path = '/v' + page.path;
				} else {
					page.path = '/:realm_code/:space_code/v' + page.path;
				}
			});

			pagesToRemove.forEach((pagePath) => {
				const pageIndex = pages.findIndex(
					(page) => page.path === pagePath
				);

				pages.splice(pageIndex, 1);
			});
		}
	}
});
