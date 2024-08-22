<template>
	<div class="general-id">
		<FmBreadcrumbs :items="breadcrumbsItems" />
		<h1 class="title">Edit {{ item?.company_name || 'White label' }}</h1>
		<SystemSettingsGeneralForm
			v-if="item"
			:id="item.id"
			:custom_css="item.custom_css"
			:favicon_url="item.favicon_url"
			:company_name="item.company_name"
			:is_default="item.is_default"
			:logo_dark_url="item.logo_dark_url"
			:logo_light_url="item.logo_light_url"
			:theme_code="item.theme_code"
			:theme_css_url="item.theme_css_url"
		/>
	</div>
</template>

<script setup>
	import SystemSettingsGeneralForm from '~/pages/system/settings/general/_components/SystemSettingsGeneralForm.vue'
	import { useGetNuxtLink } from '~/composables/useMeta'

	const route = useRoute()
	const router = useRouter()

	const item = ref(null)
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
			{ text: item.value?.company_name, to: '', disabled: true }
		]
	})

	async function getWhiteLabel() {
		try {
			const response = await useApi('systemWhiteLabelById.get', {
				params: { id: route.params.id }
			})

			item.value = response
		} catch (e) {
			console.warn('Error fetch white:', e)
			await router.push(
				useGetNuxtLink(`/system/settings/general/`, route.params)
			)
		}
	}

	getWhiteLabel()
</script>

<style scoped lang="scss">
	.general-id {
		font-size: 14px;
		padding: 8px;
	}

	.title {
		margin: 24px 0;
		padding: 6px;
	}
</style>
