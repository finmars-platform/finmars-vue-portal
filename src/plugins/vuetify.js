import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export default defineNuxtPlugin((nuxtApp) => {
	const vuetify = createVuetify({
		components,
		directives,
		theme: {
			themes: {
				light: {
					dark: false,
					colors: {
						primary: '#F05A22'
					},
				},
				dark: {
					dark: true,
					colors: {
						background: '#121212',
						surface: '#212121',
						'surface-variant': '#BDBDBD',
						'on-surface-variant': '#424242',
						primary: '#BB86FC',
						'primary-darken-1': '#3700B3',
						secondary: '#03DAC5',
						'secondary-darken-1': '#03DAC5',
						error: '#CF6679',
						info: '#2196F3',
						success: '#4CAF50',
						warning: '#FB8C00'
					},
				},
			},
		},

		defaults: {
			global: {
				ripple: false,
			},
			VIcon: {
				// color: '#737373'
			},
		},
	});

	nuxtApp.vueApp.use(vuetify);
});
