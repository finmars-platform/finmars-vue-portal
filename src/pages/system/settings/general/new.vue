<template>
	<div class="general-new">
		<FmBreadcrumbs :items="breadcrumbsItems" />
		<h1 class="title">Create new White label</h1>
		<SystemSettingsGeneralForm />
	</div>
</template>

<script setup>
	import SystemSettingsGeneralForm from '~/pages/system/settings/general/_components/SystemSettingsGeneralForm.vue'
	import { useGetNuxtLink } from '~/composables/useMeta'

	const route = useRoute()

	const breadcrumbsItems = computed(() => {
		return [
			{
				text: 'Home',
				to: useGetNuxtLink(`/home`, route.params),
				disabled: false
			},
			{
				text: 'System',
				to: useGetNuxtLink(`/system/settings/general`, route.params),
				disabled: false
			},
			{ text: 'New', to: '', disabled: true }
		]
	})
</script>

<style scoped lang="scss">
	.general-new {
		font-size: 14px;
		padding: 8px;
	}

	.title {
		margin: 24px 0;
		padding: 6px;
	}
</style>
