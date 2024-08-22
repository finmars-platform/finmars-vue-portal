import { defineStore, acceptHMRUpdate } from 'pinia'

export const useWhiteLabelStore = defineStore({
	id: 'white-label',
	state: () => ({
		themeSettings: null
	}),
	actions: {
		async loadThemeSettingsDefault() {
			try {
				const response = await useApi('systemWhiteLabel.get', {
					filters: { is_default: true }
				})

				if (Array.isArray(response)) {
					this.themeSettings = response[0]
				} else {
					this.themeSettings = response
				}

				this.installTheme()
			} catch (e) {
				console.warn('Error load Theme Default:', e)
			}
		},
		installTheme() {
			if (this.themeSettings?.theme_css_url) {
				this.setCssFile()
			}

			if (this.themeSettings?.custom_css) {
				this.setCustomCss()
			}

			if (this.themeSettings?.favicon_url) {
				this.setFavicon()
			}
		},
		setCustomCss() {
			let styleElement = document.createElement('style')
			styleElement.innerHTML = this.themeSettings.custom_css
			document.head.appendChild(styleElement)
		},
		setFavicon() {
			let link = document.querySelector("link[rel~='icon']")

			if (!link) {
				link = document.createElement('link')
				link.rel = 'icon'
				document.head.appendChild(link)
			}

			link.href = this.themeSettings.favicon_ur
		},

		setCssFile() {
			let link = document.createElement('link')
			link.rel = 'stylesheet'
			link.href = this.themeSettings.theme_css_url

			document.head.appendChild(link)
		}
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useWhiteLabelStore, import.meta.hot))
}
