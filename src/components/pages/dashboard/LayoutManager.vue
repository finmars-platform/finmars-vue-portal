<template>
	<BaseLayoutsManager
		:layouts="dashStore.layoutList"

		@createNewLayout="create"
	/>
	<!--
		@save="saveLayout"
		@saveAs="openSaveAsModal = true"
		@setAsDefault="setAsDefault"
		@rename="renameLayout"
		@delete="deleteLayout"
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

		dashStore.components = []
		dashStore.tabs = []
		dashStore.props = []
	}


</script>

<style lang="scss" scoped>


</style>
