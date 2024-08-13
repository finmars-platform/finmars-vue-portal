import FloatingVue from 'floating-vue'

export default defineNuxtPlugin((nuxtApp) => {
	FloatingVue.options.themes['error-tooltip'] = Object.assign(
		{},
		FloatingVue.options.themes.tooltip,
		{
			$extend: 'tooltip',
		}
	)
})
