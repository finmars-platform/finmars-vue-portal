import { defineStore, acceptHMRUpdate } from 'pinia';

export const useWhiteLabelStore = defineStore({
	id: 'white-label',
	state: () => ({
		themeSettings: null
	}),
	getters: {
		getPrefixPath() {
			const store = useStore();

			return `${useRuntimeConfig().public.apiURL}/${store.realm_code}/${store.space_code}/`;
		}
	},
	actions: {
		async loadThemeSettingsDefault() {
			try {
				const response = await useApi('systemWhiteLabel.get', {
					filters: { is_default: true }
				});

				if (Array.isArray(response)) {
					this.themeSettings = response[0];
				} else {
					this.themeSettings = response;
				}

				this.installTheme();
			} catch (e) {
				console.warn('Error load Theme Default:', e);
			}
		},
		installTheme() {
			if (this.themeSettings?.theme_css_url) {
				this.setCssFile();
			} else {
				this.removeCssFile();
			}

			if (this.themeSettings?.custom_css) {
				this.setCustomCss();
			} else {
				this.removeCustomCss();
			}

			if (this.themeSettings?.favicon_url) {
				this.setFavicon();
			} else {
				this.removeFavicon();
			}
		},
		setCustomCss() {
			let existingStyleElement =
				document.getElementById('custom-css-style');

			if (existingStyleElement) {
				existingStyleElement.innerHTML = this.themeSettings.custom_css;
			} else {
				let styleElement = document.createElement('style');
				styleElement.id = 'custom-css-style';
				styleElement.innerHTML = this.themeSettings.custom_css;
				document.head.appendChild(styleElement);
			}
		},
		removeCustomCss() {
			let existingStyleElement =
				document.getElementById('custom-css-style');

			if (existingStyleElement) {
				existingStyleElement.remove();
			}
		},
		setFavicon() {
			let link = document.querySelector("link[rel~='icon']");

			if (!link) {
				link = document.createElement('link');
				link.rel = 'icon';
				document.head.appendChild(link);
			}

			link.href = this.getPrefixPath + this.themeSettings.favicon_url;
		},
		removeFavicon() {
			let link = document.querySelector("link[rel~='icon']");

			if (link) {
				link.remove();
			}

			let defaultLink = document.createElement('link');
			defaultLink.rel = 'icon';
			defaultLink.href = '/img/favicon-new-32x32.png';
			document.head.appendChild(defaultLink);
		},
		setCssFile() {
			let existingLink = document.getElementById('custom-theme-css');

			if (existingLink) {
				existingLink.href =
					this.getPrefixPath + this.themeSettings.theme_css_url;
			} else {
				let link = document.createElement('link');
				link.rel = 'stylesheet';
				link.id = 'custom-theme-css';
				link.href =
					this.getPrefixPath + this.themeSettings.theme_css_url;
				document.head.appendChild(link);
			}
		},
		removeCssFile() {
			let existingLink = document.getElementById('custom-theme-css');

			if (existingLink) {
				existingLink.remove();
			}
		}
	}
});

if (import.meta.hot) {
	import.meta.hot.accept(
		acceptHMRUpdate(useWhiteLabelStore, import.meta.hot)
	);
}
