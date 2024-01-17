import Notifications from "@kyvg/vue3-notification";
export default defineNuxtPlugin((nuxtApp) => {

	nuxtApp.vueApp.config.globalProperties.$format = (number, opts = { round: 0 }) => {
		if (typeof number == 'string') return number
		if (typeof opts.round == 'number') number = Math.round(number)

		return new Intl.NumberFormat('en-EN', {
			// maximumSignificantDigits: 3
		}).format(number)
	}

});
