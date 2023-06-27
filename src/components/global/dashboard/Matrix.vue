<template>
	<div>
		<iframe v-if="readyStatus"
						height="100%"
						width="100%"
						ref="iframeElem"
						:src="source"></iframe>

		<div v-if="errorMessage" class="red-text">{{ errorMessage }}</div>
	</div>
</template>

<script setup>

	let props = defineProps({
		uid: String,
	})

	onMounted(() =>{
		window.addEventListener("message", iframeReadyHandler);
	})

	const dashStore = useStoreDashboard();
	const layoutsStore = useLayoutsStore();
	const component = computed( () => dashStore.getComponent(props.uid) );

	const iframeId = useGenerateUniqueId();

	// const windowOrigin = window.origin;
	const windowOrigin = 'http://0.0.0.0:8080'; // for development
	// let source = 'https://dev.finmars.com/space0crgw/a/#!/dashboard-component-rv-matrix?iframe=true&atoken=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhMkduaFhLRWRIZHpwaExuQTljZWJKV0dXX25jZjB1a2luTHBiTmFLOUpjIn0.eyJleHAiOjE2NzgwMjE5OTgsImlhdCI6MTY3NzkzNTU5OCwianRpIjoiMTQ4MTJmZDItZDI5ZS00OGVmLTk2YWQtMWE5ZTMwZTJjNzFiIiwiaXNzIjoiaHR0cHM6Ly9kZXYtYXV0aC5maW5tYXJzLmNvbS9yZWFsbXMvZmlubWFycyIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJjYzA2ZmY5Ny05YzgzLTQyNWEtOTYyNi0zN2M0NDI1YjYxNzUiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJmaW5tYXJzLWF1dGhvcml6ZXIiLCJzZXNzaW9uX3N0YXRlIjoiOWIyNTQxYzMtMjJiOC00MDJjLWI5YWEtNWM0NGMxMTJjZmYxIiwiYWNyIjoiMSIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtZGV2LWZpbm1hcnMiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsInNpZCI6IjliMjU0MWMzLTIyYjgtNDAyYy1iOWFhLTVjNDRjMTEyY2ZmMSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoiZGV2X2Fwcmlha2hpbiJ9.Fcqn1xF40h28mtl5GtuIGnFEODRFh2rnjuuFxr2TNIKGwfwXJpUkqqnrsA0W6uTjnGJ7Wr4g09Z7wq2u5tMX7i_mYjKWKbO38ZWqIsTQyGlwd8I6_Upx0qNAwr_CZ7PtzUPlZAGguJZTlSbC7OTYInf_fCrhhEXbgOuiaTaqYpvK8vpBvNSTMnOEWU8qNpAScYMaWVqdUQABhEcLDdTnQW6YmsRjwhGAedg7ofL3t6tdyFbDnKy36dsyai4T8TDqYgCKz5Vnp9BAK7pDyemM8d0xYvDDJPeQily8hkBRq5TqUXWU7x0l6ZBwJdObkkmo-_qJxzf7YkqTM33apsVLMw&componentId=test&reportLayoutId=206&abscissa=&ordinate=&value_key='
	let source = `http://0.0.0.0:8080/space0ni5k/a/#!/dashboard-component-rv-matrix?iframe=true&iframeId=${iframeId}`;


	let readyStatus = ref(false);

	let errorMessage = ref('');
	let iframeElem = ref(null);
	let iframeWindow;

	let reportLayoutUc = component.value.settings.layout;
	let reportLayoutId;

	function iframeReadyHandler (event) {

		if ( !event.data ||
			event.data.iframeId !== iframeId ||
			event.data.action !== 'IFRAME_READY' ) {

			return;

		}

		iframeWindow = iframeElem.value.contentWindow;

		window.removeEventListener("message", iframeReadyHandler);
		// TODO: remove after creating matrix using vue
		let settings = JSON.parse(JSON.stringify(component.value.settings));
		settings.layout = reportLayoutId;

		const payload = {
			id: props.uid,
			settings: settings,
		};

		iframeWindow.postMessage({ action: 'INITIALIZATION_SETTINGS_TRANSMISSION', payload: payload }, windowOrigin );

	}

	async function getLayoutId() {

		let res = await layoutsStore.getLayoutByUserCode(component.value.settings.content_type, component.value.settings.layout);

		if (res.error) {
			errorMessage.value = `ERROR: Layout with user code: ${component.value.settings.layout} not found`;
			throw res.error;

		} else {
			return res.id;
		}

	}
	async function updateMatrix() {

		if (component.value.settings.layout !== reportLayoutUc) { // user code changed
			reportLayoutId = await getLayoutId();
		}

		let settings = JSON.parse(JSON.stringify(component.value.settings));
		settings.layout = reportLayoutId;

		const payload = {
			id: props.uid,
			settings: settings,
		};

		iframeWindow.postMessage({ action: 'SETTINGS_CHANGE', payload: payload }, windowOrigin );
	}

	watch( component, updateMatrix );

	async function init () {

		// TODO: remove after creating matrix using vue
		try {
			reportLayoutId = await getLayoutId();
			readyStatus.value = true;

		} catch (e) {}

	}

	init();


</script>

<style lang="scss" scoped>

</style>
