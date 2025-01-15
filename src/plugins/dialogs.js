import { dialogs } from '@finmars/ui';

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.use(dialogs);
});
