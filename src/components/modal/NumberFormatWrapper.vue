<template>
	<BaseModal
		title="Complex Transaction Code: Number Format"
		:model-value="isShow"
		:max-width="true"
		:show-bottom="false"
		:max-height="true"
		@close="closeContent"
	>
		<NumberFormatContent @cancel="closeContent" @save="saveContent" :settings="settings"/>
	</BaseModal>
</template>

<script setup>
	import NumberFormatContent from '~/components/modal/NumberFormatContent.vue'

	definePageMeta({
		layout: 'auth',
	});

	const settings = ref({});
	const isShow = ref(false);

	const iframeId = useRoute().query.iframeId;
	const windowOrigin = window.origin
	// const windowOrigin = 'http://0.0.0.0:8080'; //for development
	let readyStatus = ref(false);

	const onMessageStack = {
		INITIALIZATION_SETTINGS_TRANSMISSION: init,
	}

	function send(data, source = window.parent) {

		data.iframeId = iframeId

		let dataObj = Object.assign(data, {
			iframeId: iframeId,
		});

		source.postMessage(dataObj, windowOrigin);

	}
	function onMessage(e) {

		if (!e.data.action) {
			console.warn('Message without action sent')
			return false
		}

		if (e.origin !== windowOrigin) {
			console.error('Received message from a different origin', e.origin)
			return false
		}
		if (onMessageStack[e.data.action]) {
			onMessageStack[e.data.action](e.data.payload)
		}
		else console.log('e.data.action:', e.data)

	}

	function closeContent() {
		send({
			action: 'CANCEL_DIALOG',
		})
	}

	function saveContent(e) {
		send({
			action: 'SAVE_DIALOG',
			payload: {
				selectedAttributes: JSON.parse(JSON.stringify(e)),
			},
		})
	}

	function init(data) {
		settings.value = data.selectedAttributes;
		isShow.value = true;
	}

	onMounted(() => {
		window.addEventListener('message', onMessage)

		send({
			action: 'IFRAME_READY',
		})
	});
</script>

<style lang="scss" scoped>
</style>
