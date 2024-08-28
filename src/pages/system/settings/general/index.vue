<template>
	<div class="general">
		<FmBreadcrumbs :items="breadcrumbsItems" />
		<h1 class="title">White label</h1>
		<div class="list">
			<div v-for="item in items" :key="item.id" class="item">
				<b class="name">
					{{ item.company_name || 'Unknown' }}
				</b>
				<NuxtLink
					:to="
						useGetNuxtLink(`/system/settings/general/${item.id}`, $route.params)
					"
				>
					<FmIcon icon="edit" btn />
				</NuxtLink>
				<FmIcon
					disabled
					:icon="item.is_default ? 'star' : 'star_border'"
					btn
					v-on="!item.is_default ? { click: () => setDefault(item.id) } : {}"
				/>
				<FmIcon @click="confirmRemove(item)" icon="delete" btn />
			</div>
		</div>
		<FmBtn
			:to="useGetNuxtLink(`/system/settings/general/new`, $route.params)"
			type="primary"
			class="new"
			>Create new
		</FmBtn>
	</div>
</template>

<script setup>
	import { useGetNuxtLink } from '~/composables/useMeta'

	const route = useRoute()
	const router = useRouter()
	const { loadThemeSettingsDefault } = useWhiteLabelStore()

	const items = ref(null)
	const breadcrumbsItems = [
		{
			text: 'Home',
			to: useGetNuxtLink(`/home`, route.params),
			disabled: false
		},
		{ text: 'System', to: '', disabled: true }
	]

	async function setDefault(id) {
		const formData = new FormData()

		items.value?.forEach((item) => {
			item.is_default = item.id === id
		})

		formData.append('is_default', true)

		try {
			await useApi('systemWhiteLabelById.patch', {
				body: formData,
				params: { id }
			})

			await loadThemeSettingsDefault()
		} catch (e) {
			console.log('Error set Default', e)
		}
	}

	async function remove(item) {
		try {
			await useApi('systemWhiteLabelById.delete', {
				params: { id: item.id }
			})

			useNotify({
				type: 'success',
				title: `White label "${item.company_name}" was deleted.`
			})

			await getWhiteLabel()
		} catch (e) {
			console.log('Error remove', e)
		}
	}

	async function getWhiteLabel() {
		try {
			let response = await useApi('systemWhiteLabel.get')

			if (response) {
				items.value = response
			}
		} catch (e) {
			console.warn('Error fetch white:', e)
		}
	}

	async function confirmRemove(item) {
		const isConfirm = await useConfirm({
			title: 'Delete white label',
			text: `Do you want to delete a white label "${item.company_name}"?`
		})

		if (!isConfirm) return false

		await remove(item)
	}

	getWhiteLabel()
</script>

<style scoped lang="scss">
	.general {
		font-size: 14px;
		padding: 8px;

		.title {
			margin: 24px 0;
			padding: 6px;
		}

		.list {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}

		.item {
			padding: 14px;
			background: var(--card-background-color);
			color: var(--secondary-color);
			box-shadow:
				0 1px 3px 0 rgba(83, 67, 63, 0.2),
				0 1px 1px 0 rgba(83, 67, 63, 0.14),
				0 2px 1px -1px rgba(83, 67, 63, 0.12);

			display: flex;
			align-items: center;
			gap: 12px;
		}

		.name {
			margin-right: auto;
		}

		.new {
			margin-top: 32px;
		}
	}
</style>
