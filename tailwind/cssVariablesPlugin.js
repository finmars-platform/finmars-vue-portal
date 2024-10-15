import plugin from 'tailwindcss/plugin'

let themeExtensionData = {
	colors: {
		'--secondary-color': 'var(--secondary-color)',
		'--primary-color': 'var(--primary-color)'
	},
	backgroundColor: {
		'--base-backgroundColor': 'var(--base-backgroundColor)',

		'--card-background-color': 'var(--card-background-color)'
	},
	borderColor: {
		'--table-border-color': 'var(--table-border-color)',

		'--card-border-color': 'var(--card-border-color)'
	},
	boxShadow: {
		card: '0 1px 4px var(--shadow-color)'
	}
}

function createDefaultThemeExtension() {
	const extensionData = {}

	/**
	 *
	 * @param {Object} themeExt - object with keys like 'color', 'opacity' etc.
	 */
	function applyThemeExt(themeExt) {
		let key
		/**
		 * keys - names of custom values. E.g. '--icon-disabled'.
		 * values - strings that will be converted into CSS values.
		 * E.g. 'var(--icon-disabled-opacity)'
		 * @type {Object}
		 */
		let cssPropertyData

		for ([key, cssPropertyData] of Object.entries(themeExt)) {
			if (!Object.prototype.hasOwnProperty.call(extensionData, key)) {
				extensionData[key] = {}
			}

			const cssPropData = extensionData[key]

			for (const [customValName, stringValue] of Object.entries(
				cssPropertyData
			)) {
				if (Object.prototype.hasOwnProperty.call(cssPropData, customValName)) {
					throw new Error(
						`A name of a CSS value is duplicated: '${customValName}'`
					)
				}

				cssPropData[customValName] = stringValue
			}
		}
	}

	Object.values(arguments).forEach(applyThemeExt)

	return extensionData
}

themeExtensionData = createDefaultThemeExtension(
	themeExtensionData
	/* Add other theme extensions here */
)

export default plugin(function () {}, {
	theme: {
		extend: themeExtensionData
	}
})
