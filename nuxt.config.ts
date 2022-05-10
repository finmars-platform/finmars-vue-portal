import { defineNuxtConfig } from "nuxt";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	publicRuntimeConfig: {
		appURL: process.env.APP_URL || "http://localhost:3000",
	},

	plugins: [
		// { src: '~plugins/Api.js' },
	],

	// css: ['~/assets/sass/main.sass'],
	// vite: {
	// 	css: {
	// 		preprocessorOptions: {
	// 			sass: {
	// 				additionalData: '@import "~/assets/sass/variables.sass"'
	// 			},
	// 		},
	// 	},
	// },
	components: {
		dirs: ["~/components", "~/components/pages"],
	},
	srcDir: "src",
	server: {
		host: process.env.NUXT_HOST,
	},
	head: {
		title: "Finmars",
		htmlAttrs: {
			lang: "en",
		},
		meta: [
			{ charset: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ hid: "description", name: "description", content: "" },
			{ name: "format-detection", content: "telephone=no" },
		],
		link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
	},
});
