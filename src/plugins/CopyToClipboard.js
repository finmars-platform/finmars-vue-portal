export default defineNuxtPlugin((nuxtApp) => {

	nuxtApp.vueApp.config.globalProperties.$copyToClipboard = async (text) => {

		if (!navigator.clipboard) {
			console.error('Clipboard API not available');
			return;
		}

		try {
			await navigator.clipboard.writeText(text);
			console.log('Text copied to clipboard');
			// Optionally, show a success message to the user
		} catch (err) {
			console.error('Failed to copy text: ', err);
			// Optionally, handle errors (e.g., show an error message)
		}

	}

});
