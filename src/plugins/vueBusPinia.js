import { storeVueBus } from '@finmars/ui';
import { setActivePinia } from 'pinia';

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.$pinia.use(storeVueBus);
	setActivePinia(nuxtApp.$pinia);
});
