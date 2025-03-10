import { vueBus } from '@finmars/ui';

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.use(vueBus);
});
