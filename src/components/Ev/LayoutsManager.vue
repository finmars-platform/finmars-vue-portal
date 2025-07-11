<template>
	<BaseLayoutsManager
		v-bind="$attrs"
		:activeLayout="viewerData.listLayout"
		:layouts="layoutsList"
		:content_type="viewerData.listLayout.content_type"
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
		@export="openLayoutExport"
		@changeLayout="viewerData.layoutToOpen = $event"
	/>

	<EvModalSaveLayoutAs v-model="openSaveAsModal"
											 :content_type="viewerData.listLayout.content_type"
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

	// let autosaveLayout = ref(null);
	// let layoutsList = ref([]);

	let openSaveAsModal = ref(false);
	let openExport = ref(false);
	let layoutToExport = ref(null);

	let lLayoutsLight = computed(() => layoutsStore.listLayoutsLightData[viewerData.content_type] || []);

	let layoutsList = computed(() => {
		return lLayoutsLight.value.filter(lLayout => !lLayout.is_systemic);
	});

	const alUserCode = getAutosaveLayoutUserCode(viewerData.content_type);

	let autosaveLayout = computed(() => {
		return lLayoutsLight.value.find(lLayout => lLayout.user_code === alUserCode)
	});

	async function getLayouts () {

		/*const filters = {
			pageSize: 1000,
			content_type: viewerData.content_type,
		}

		const res = await useApi('listLayoutListLight.get', {filters});

		if (res._$error) {
			return;
		}

		const alUserCode = getAutosaveLayoutUserCode(viewerData.content_type);
		const autosaveLayoutIndex = res.results.findIndex(layout => layout.user_code === alUserCode);

		if (autosaveLayoutIndex > -1) {
			autosaveLayout.value = res.results.splice(autosaveLayoutIndex, 1)[0];
		}

		layoutsList.value = res.results; */
		const res = await layoutsStore.getListLayoutsLight(viewerData.content_type);
		if (res._$error) loadingLayoutsList.value = true;

		// openSaveAsModal.value = false;

	}

	function createNewLayout() {

		viewerData.setLayoutCurrentConfiguration(null, store.ecosystemDefaults);
		viewerData.listLayout.name = 'New layout';
		viewerData.listLayout.newLayout = true;

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

		if (!res._$error) {

			// let prevDefLayout = layoutsList.value.find(dLayout => dLayout.is_default);
			let prevDefLayout = lLayoutsLight.value.find(dLayout => dLayout.is_default);

			if (prevDefLayout) {

				prevDefLayout.is_default = false;

				if (prevDefLayout.id === viewerData.listLayout.id) viewerData.listLayout.is_default = false;

			}

			let dLayout = lLayoutsLight.value.find(dLayout => dLayout.id === res.id);
			dLayout.is_default = true;
			dLayout.modified = res.modified;

			useNotify({
				type: 'success',
				title: 'Layout made default'
			});

			// getLayouts();

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
		layout.configuration_code = namesData.configuration_code;

		const res = await layoutsStore.updateLayout(layout.id, layout);

		if (!res._$error) {

			viewerData.listLayout = res;

			const renamedLayout = layoutsList.value.find(lLayout => lLayout.id === layout.id);
			renamedLayout.name = namesData.name;
			renamedLayout.user_code = namesData.user_code;

			useNotify({type: 'success', title: 'Layout renamed'})

		}

	}

	async function deleteLayout() {

		// const layoutIsDefault = viewerData.listLayout.is_default;
		const layoutId = viewerData.listLayout.id;

		const res = await layoutsStore.deleteLayout(layoutId);

		if (res._$error) return;

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

	}

	function isLayoutDefault(layout) {

		if (viewerData.isRootEntityViewer) return layout.is_default;

		return viewerData.splitPanelDefaultLayout.layoutId === layout.id;

	}

	async function init() {

		loadingLayoutsList.value = true;

		const res = layoutsStore.getListLayoutsLight(viewerData.content_type);

		if (!res._$error) {
			loadingLayoutsList.value = false;
		}

		// await getLayouts();
	}

	init();

</script>

<style lang="scss" scoped>

</style>
