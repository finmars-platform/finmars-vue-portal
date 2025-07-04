module.exports = {
	root: true,
	env: {
		node: true,
		browser: true
	},
	extends: [
		'plugin:vue/vue3-essential',
		'eslint:recommended',
		'plugin:prettier/recommended'
	],
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	},
	rules: {
		'prettier/prettier': [
			'error',
			{
				singleQuote: true,
				semi: true,
				printWidth: 80,
				vueIndentScriptAndStyle: true,
				trailingComma: 'none'
			}
		],
		'vue/multi-word-component-names': 'off',
		'vue/no-unused-components': 'off',
		'no-undef': 'off'
	}
};
