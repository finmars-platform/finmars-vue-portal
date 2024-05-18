<template>
		<ModalNumberFormatContent
			v-if="isShow"
			@cancel="closeContent"
			@save="saveContent"
			:settings="settings"
		/>
</template>

<script setup>
	import { handleOnMessage, handleSend } from '~/composables/useExternal'

	definePageMeta({
		layout: 'auth',
	});

	const iframeId = useRoute().query.iframeId;

	const settings = ref({});
	const isShow = ref(false);
	let readyStatus = ref(false);

	const onMessageStack = {
		INITIALIZATION_SETTINGS_TRANSMISSION: init,
	}

	function onMessage(e) {
		handleOnMessage(e, onMessageStack);
	}

	function closeContent() {
		handleSend({
			action: 'CANCEL_DIALOG',
		},
			iframeId
		)
	}

	function saveContent(e) {
		handleSend({
			action: 'SAVE_DIALOG',
			payload: {
				selectedAttributes: JSON.parse(JSON.stringify(e)),
			},
		},
			iframeId
		)
	}

	function init(data) {
		settings.value = data.selectedAttributes;
		isShow.value = true;
	}

	onMounted(() => {
		window.addEventListener('message', onMessage);
		handleSend({
			action: 'IFRAME_READY',
		},
			iframeId
		)
	});
</script>

<style scoped>

</style>
