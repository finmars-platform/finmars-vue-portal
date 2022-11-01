<template>
	<BaseLayoutsManager :layouts="layoutsList"
											:autosaveLayout="autosaveLayout"
											:loadingLayout="loadingLayout"
											:loadingLayoutsList="loadingLayoutsList"
											:isLayoutDefault="isLayoutDefault"

											@createNewLayout="createNewLayout"
											@save="saveLayout"
											@saveAs="saveAs"
											@rename="renameLayout"
											@delete="deleteLayout" />

	<EvModalSaveLayoutAs v-model="openSaveAsModal"
											 @layoutSaved="getLayouts" />
</template>

<script setup>

	const store = useStore();
	const layoutsStore = useLayoutsStore();

	let props = defineProps({
		loadingLayout: Boolean,
	})

	const viewerData = inject('viewerData');
	const refresh = inject('refreshReport');

	let loadingLayoutsList = ref(false);

	let autosaveLayout = ref(null);
	let layoutsList = ref([]);

	let openSaveAsModal = ref(false);

	let invitesList = ref([]);

	async function getLayouts (arg) {
		console.log("testing getLayouts called", arg);
		loadingLayoutsList.value = true;

		const filters = {
			pageSize: 1000,
			content_type: viewerData.content_type,
		}

		const res = await useApi('listLayoutListLight.get', {filters});

		if (res.error) {
			return;
		}

		const alUserCode = getAutosaveLayoutUserCode(viewerData.content_type);
		const autosaveLayoutIndex = res.results.findIndex(layout => layout.user_code === alUserCode);

		if (autosaveLayoutIndex > -1) {
			autosaveLayout.value = res.results.splice(autosaveLayoutIndex, 1)[0];
		}

		layoutsList.value = res.results;
		loadingLayoutsList.value = false;

	}

	function createNewLayout() {

		viewerData.setLayoutCurrentConfiguration(null, store.ecosystemDefaults);

		refresh();

	}

	function saveLayout() {
		useSaveEvRvLayout(store, viewerData);
	}

	function saveAs() {
		openSaveAsModal.value = true;
	}

	async function getInvites () {

		const res = await useApi('configSharingMyInvitesList.get', {filters: {status: '0'}});

		invitesList.value = res.results;

	}

	async function renameLayout(namesData) {
		console.log("testing renameLayout called");
		const layout = JSON.parse(JSON.stringify(viewerData.listLayout));
		console.log("testing renameLayout layout", layout);
		layout.name = namesData.name;
		layout.user_code = namesData.user_code;

		const res = await layoutsStore.updateLayout(layout.id, layout);
		console.log("testing renameLayout res", res);
		if (!res.error) {

			viewerData.listLayout = res;

			const renamedLayout = layoutsList.value.find(lLayout => lLayout.id === layout.id);
			renamedLayout.name = namesData.name;
			renamedLayout.user_code = namesData.user_code;

		}

	}

	async function deleteLayout() {

		const layoutIsDefault = viewerData.listLayout.is_default;
		const layoutId = viewerData.listLayout.id;

		const res = await layoutsStore.deleteLayout(layoutId);

		if (!res.error) return;

		if (layoutIsDefault && layoutsList.value.length > 1) { // If default layout was deleted and other layouts exist. Make another layout default.

			let nextDefaultLayout = layoutsList.value[0];

			if (nextDefaultLayout.id === layoutId) {
				nextDefaultLayout = layoutsList.value[1];
			}

			nextDefaultLayout.is_default = true;

			await layoutsStore.updateLayout(nextDefaultLayout.id, nextDefaultLayout);

		}

		getLayouts();

	}

	function isLayoutDefault(layout) {

		if (viewerData.isRootEntityViewer) return layout.is_default;

		return viewerData.splitPanelDefaultLayout.layoutId === layout.id;

	}

	async function init() {
		/*const result = await getLayouts();
		console.log("testing init result", result);
		if (!result.error) layoutsList.value = result;
		console.log("testing init layoutsList", layoutsList.value);*/
		await getLayouts();
		console.log("testing init layoutsList", layoutsList.value);
	}
	console.log("testing EvLayoutManager", viewerData.content_type);
	/*watch(
		() => viewerData.content_type,
		() => {
			console.log("testing viewerData.content_type watch", viewerData.content_type);
			init();
			// unwatchLayoutLoading();

		}
	)*/

	init();

</script>

<style lang="scss" scoped>

</style>
