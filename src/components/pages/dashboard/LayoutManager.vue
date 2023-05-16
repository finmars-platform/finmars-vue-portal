<template>
	<BaseLayoutsManager
		:layouts="dashStore.layoutList"
		:activeLayout="dashStore.layout"

		@createNewLayout="create"
		@changeLayout="dashStore.activeLayoutId = $event"
		@save="saveLayout"
		@delete="deleteLayout"
	/>
	<!--

		@setAsDefault="setAsDefault"
		@rename="renameLayout"

		@export="openLayoutExport" -->
</template>

<script setup>

	const props = defineProps({
		layouts: Array,
		autosaveLayout: Object,
		loadingLayout: Boolean,
		loadingLayoutsList: Boolean,

		isLayoutDefault: Function
	})

	const dashStore = useStoreDashboard();

	function create() {
		dashStore.activeLayoutId = null;
		dashStore.isEdit = true;

		dashStore.components = []
		dashStore.tabs = []
		dashStore.props = {
			inputs: [],
			outputs: [],
			proxies: []
		}
	}
	function saveLayout() {
		dashStore.saveLayout()
	}
	function deleteLayout() {
		dashStore.deleteLayout()
	}


</script>

<style lang="scss" scoped>


</style>
