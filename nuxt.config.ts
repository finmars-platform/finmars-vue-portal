import { defineNuxtConfig } from "nuxt";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	publicRuntimeConfig: {
		appURL: process.env.APP_URL || "http://localhost:3000",
		apiURL: process.env.API_URL || "http://localhost:3000",
		oldAppURL: process.env.OLD_APP_URL || "http://localhost:3000",
	},
	ssr: false,
	app: {
		baseURL: '/v/'
	},
	css: [
		"~/assets/scss/main.scss",
		"vuetify/lib/styles/main.sass",
		"mdi/css/materialdesignicons.min.css",
	],
	build: {
		transpile: ["vuetify"]
	},
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
	buildModules: ["@pinia/nuxt"],

	srcDir: "src",
	server: {
		host: process.env.NUXT_HOST,
	},
});
