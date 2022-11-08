<template>
	<BaseLayoutsManager :layouts="layoutsList"
											:autosaveLayout="autosaveLayout"
											:loadingLayout="loadingLayout"
											:loadingLayoutsList="loadingLayoutsList"
											:isLayoutDefault="isLayoutDefault"

											@createNewLayout="createNewLayout"
											@save="saveLayout"
											@saveAs="openSaveAsModal = true"
											@setAsDefault="setAsDefault"
											@rename="renameLayout"
											@delete="deleteLayout"
											@export="openLayoutExport" />

	<EvModalSaveLayoutAs v-model="openSaveAsModal"
											 @layoutSaved="getLayouts" />

	<ModalExportListLayout :isReport="viewerData.isReport"
												 :layout="layoutToExport"
												 v-model="openExport" />
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
	let openExport = ref(false);
	let layoutToExport = ref(null);

	async function getLayouts () {

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

		// openSaveAsModal.value = false;

	}

	function createNewLayout() {

		viewerData.setLayoutCurrentConfiguration(null, store.ecosystemDefaults);
		viewerData.listLayout.name = 'New layout';

		refresh();

	}

	function saveLayout() {
		useSaveEvRvLayout(store, viewerData);
	}

	async function setAsDefault(layoutLight) {

		let layout;

		if (layoutLight) {

			if (layoutLight.is_default) return;

			layout = await layoutsStore.getLayoutByKey(layoutLight.id);

		} else { // use active layout

			if (viewerData.listLayout.is_default) return;

			layout = viewerData.listLayout;

		}

		layout.is_default = true;

		const res = await layoutsStore.updateLayout(layout.id, layout);

		if (!res.error) {

			let prevDefLayout = layoutsList.value.find(dLayout => dLayout.is_default);

			if (prevDefLayout) {

				prevDefLayout.is_default = false;

				if (prevDefLayout.id === viewerData.listLayout.id) viewerData.listLayout.is_default = false;

			}

			let dLayout = layoutsList.value.find(dLayout => dLayout.id === res.id);
			dLayout.is_default = true;

			useNotify({
				type: 'success',
				title: 'Layout made default'
			});

		}


	}

	function openLayoutExport() {
		layoutToExport.value = viewerData.getLayoutCurrentConfiguration();
		openExport.value = true;
	}

	async function renameLayout(namesData) {

		const layout = JSON.parse(JSON.stringify(viewerData.listLayout));

		layout.name = namesData.name;
		layout.user_code = namesData.user_code;

		const res = await layoutsStore.updateLayout(layout.id, layout);

		if (!res.error) {

			viewerData.listLayout = res;

			const renamedLayout = layoutsList.value.find(lLayout => lLayout.id === layout.id);
			renamedLayout.name = namesData.name;
			renamedLayout.user_code = namesData.user_code;

			useNotify({type: 'success', title: 'Layout renamed'})

		}

	}

	async function deleteLayout() {

		const layoutIsDefault = viewerData.listLayout.is_default;
		const layoutId = viewerData.listLayout.id;

		const res = await layoutsStore.deleteLayout(layoutId);

		if (res.error) return;

		/*if (layoutIsDefault && layoutsList.value.length > 1) { // If default layout was deleted and other layouts exist. Make another layout default.

			let nextDefLayoutId = layoutsList.value[0].id;

			if (nextDefaultLayout.id === layoutId) {
				nextDefLayoutId = layoutsList.value[1].id;
			}

			let nextDefaultLayout = await layoutsStore.getLayoutByKey(nextDefLayoutId);

			nextDefaultLayout.is_default = true;

			layoutsStore.updateLayout(nextDefaultLayout.id, nextDefaultLayout).then(() => {
				viewerData.layoutToOpen = 'default';
			});

		}*/

		viewerData.layoutToOpen = 'default';

		getLayouts();

	}

	function isLayoutDefault(layout) {

		if (viewerData.isRootEntityViewer) return layout.is_default;

		return viewerData.splitPanelDefaultLayout.layoutId === layout.id;

	}

	async function init() {
		await getLayouts();
	}

	init();

</script>

<style lang="scss" scoped>

</style>
