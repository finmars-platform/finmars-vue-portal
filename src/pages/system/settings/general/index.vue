<template>
	<div class="general">
		<h1 class="title">White label</h1>
		<div class="list">
			<NuxtLink
				v-for="item in items"
				:key="item.id"
				:to="
					useGetNuxtLink(`/system/settings/general/${item.id}`, $route.params)
				"
			>
				<div class="item">{{ item.company_name || 'Unknown' }}</div>
			</NuxtLink>
		</div>
		<NuxtLink
			class="new"
			:to="useGetNuxtLink(`/system/settings/general/new`, $route.params)"
		>
			Create new
		</NuxtLink>
	</div>
</template>

<script setup>
	import { SystemApi } from '~/api/endpoints/system.api'
	import { useGetNuxtLink } from '~/composables/useMeta'

	const items = ref(null)

	async function getWhiteLabel() {
		try {
			let response = await SystemApi.whiteLabelFetch(false)

			if (response?.length) {
				items.value = response
			}
		} catch (e) {
			console.warn('Error fetch white:', e)
		}
	}

	onMounted(() => {
		getWhiteLabel()
	})
</script>

<style scoped lang="scss">
	.general {
		font-size: 14px;
		padding: 8px;

		.title {
			margin-bottom: 24px;
		}

		.list {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}

		.item {
			padding: 8px;
			border: 1px solid white;
			border-radius: 4px;
		}

		.new {
			margin-top: 16px;
		}
	}
</style>
