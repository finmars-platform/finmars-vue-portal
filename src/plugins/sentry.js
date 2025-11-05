import * as Sentry from '@sentry/vue'

export default defineNuxtPlugin((nuxtApp) => {

	const router = useRouter()
	const { public: { sentry } } = useRuntimeConfig()

	const dsn = useRuntimeConfig().public.SENTRY_DSN;

	if (dsn.indexOf('SENTRY_DSN') !== -1) {
		return
	}

	Sentry.init({
		app: nuxtApp.vueApp,
		dsn: dsn,
	})


});
