import { defineNuxtConfig } from "nuxt";

const curDate = new Date();
const dateString = `${curDate.getHours()}:${curDate.getMinutes()}, ${curDate.getDate()}/${curDate.getMonth()}/${curDate.getFullYear()}`;

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	publicRuntimeConfig: {
		appURL: process.env.APP_URL || "http://localhost:3000",
		apiURL: process.env.API_URL || "http://localhost:3000",
		wsURL: process.env.WS_URL || "http://localhost:3000",
		oldAppURL: process.env.OLD_APP_URL || "http://localhost:3000",
		buildDATE: dateString,
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
	buildModules: ["@pinia/nuxt"],

	srcDir: "src",
	server: {
		host: process.env.NUXT_HOST,
	},
});
