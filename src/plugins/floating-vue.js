import FloatingVue from 'floating-vue'

export default defineNuxtPlugin((nuxtApp) => {
	FloatingVue.options.themes['error-tooltip'] = {
		$extend: 'tooltip',
	}
})
