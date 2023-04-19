<template>
	<BaseLayoutsManager
		:layouts="dashStore.layoutList"
		:isLayoutDefault="isLayoutDefault"


	/>
	<!-- @createNewLayout="createNewLayout"
		@save="saveLayout"
		@saveAs="openSaveAsModal = true"
		@setAsDefault="setAsDefault"
		@rename="renameLayout"
		@delete="deleteLayout"
		@export="openLayoutExport" -->
</template>

<script setup>

	const router = useRouter();
	const route = useRoute();
	const dashStore = useStoreDashboard();

	let props = defineProps({
		layouts: Array,
		autosaveLayout: Object,
		loadingLayout: Boolean,
		loadingLayoutsList: Boolean,

		isLayoutDefault: Function
	});


	let emit = defineEmits([
		'createNewLayout',
		'setAsDefault',
		'save',
		'saveAs',
		'export',
		'openLayoutsList',
		'openInvites',
		'rename',
		'delete',
	]);



</script>

<style lang="scss" scoped>


</style>
