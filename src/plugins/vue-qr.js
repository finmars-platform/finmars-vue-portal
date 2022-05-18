import VueQrcode from '@chenfengyuan/vue-qrcode';

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.component(VueQrcode.name, VueQrcode);
});
